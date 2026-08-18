import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { setupDatabase, getDbPool, insertAuditLog } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend with credentials
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Simple in-memory refresh token store (dev). For production use DB or Redis to persist and revoke.
const refreshStore = new Map(); // jti -> userId

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Generate a strong secret and set JWT_SECRET in the environment.');
  process.exit(1);
}
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '7d';

const passwordPolicyError = 'Password must be at least 16 characters long and include mixed upper/lower case plus at least one special character.';
const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{16,}$/;

function isPasswordStrong(password) {
  return passwordPolicyRegex.test(password);
}

function signAccessToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function signRefreshToken(user) {
  const jti = crypto.randomBytes(16).toString('hex');
  const payload = {
    sub: user.id,
    jti,
  };
  // store jti to allow revocation
  refreshStore.set(jti, user.id);
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL });
}

function getUserFromAuthToken(req) {
  // Check cookie first
  const token = req.cookies?.access_token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (e) {
    return null;
  }
}

function authMiddleware(req, res, next) {
  const userPayload = getUserFromAuthToken(req);
  if (!userPayload) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // normalize payload to req.user
  req.user = {
    id: userPayload.sub,
    username: userPayload.username,
    name: userPayload.name,
    role: userPayload.role,
    title: userPayload.title,
    avatar: userPayload.avatar,
    email: userPayload.email,
    permissions: userPayload.permissions || [],
  };
  next();
}

function hasPermission(user, permission) {
  if (!user) return false;
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  return permissions.includes(permission) || permissions.includes('FULL_ADMIN_ACCESS');
}

function requirePermission(permission) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (hasPermission(user, permission)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
}

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Parse permissions back to array
    let permissions = [];
    try {
      if (typeof user.permissions === 'string') {
        permissions = JSON.parse(user.permissions);
      } else if (Array.isArray(user.permissions)) {
        permissions = user.permissions;
      }
    } catch (e) {
      console.error('Error parsing permissions:', e);
    }

    const sessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      email: user.email,
      permissions,
    };

    // issue JWTs
    const accessToken = signAccessToken(sessionUser);
    const refreshToken = signRefreshToken(sessionUser);

    // Set cookies (httpOnly). For development on localhost, Secure isn't required; do set in production.
    const secureFlag = process.env.NODE_ENV === 'production';
    res.cookie('access_token', accessToken, { httpOnly: true, secure: secureFlag, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { httpOnly: true, secure: secureFlag, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    // Audit log for login
    await insertAuditLog(pool, sessionUser.id, sessionUser.name, sessionUser.role, 'LOGIN', `User '${sessionUser.username}' logged in successfully.`);

    // Return user profile only (do not expose tokens to JS)
    res.json(sessionUser);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const { jti, sub } = decoded;
    if (!jti || !refreshStore.has(jti) || refreshStore.get(jti) !== sub) {
      return res.status(401).json({ error: 'Refresh token revoked or unknown' });
    }

    // Load user from DB to ensure we have latest permissions
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [sub]);
    if (rows.length === 0) return res.status(401).json({ error: 'User not found' });
    const user = rows[0];

    let permissions = [];
    try {
      if (typeof user.permissions === 'string') permissions = JSON.parse(user.permissions);
      else if (Array.isArray(user.permissions)) permissions = user.permissions;
    } catch (e) { }

    const sessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      title: user.title,
      avatar: user.avatar,
      email: user.email,
      permissions,
    };

    const newAccess = signAccessToken(sessionUser);
    res.cookie('access_token', newAccess, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 15 * 60 * 1000 });

    res.json(sessionUser);
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    let loggedOutUser = null;
    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        if (decoded && decoded.jti) {
          loggedOutUser = decoded;
          refreshStore.delete(decoded.jti);
        }
      } catch (e) {}
    }
    // Clear cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // Audit log for logout
    if (loggedOutUser) {
      const pool = await getDbPool();
      // Load user details for audit entry
      const [rows] = await pool.query('SELECT id, username, name, role FROM users WHERE id = ?', [loggedOutUser.sub]);
      if (rows.length > 0) {
        const u = rows[0];
        await insertAuditLog(pool, u.id, u.name, u.role, 'LOGOUT', `User '${u.username}' logged out.`);
      }
    }

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/health', async (req, res) => {
  try {
    const pool = await getDbPool();
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.get('/api/users', authMiddleware, requirePermission('MANAGE_USERS'), async (req, res) => {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT id, username, name, role, title, avatar, email, permissions FROM users');
    
    // Parse permissions for each user
    const users = rows.map(user => {
      let permissions = [];
      try {
        if (typeof user.permissions === 'string') {
          permissions = JSON.parse(user.permissions);
        } else if (Array.isArray(user.permissions)) {
          permissions = user.permissions;
        }
      } catch (e) {}
      
      return {
        ...user,
        permissions
      };
    });
    
    res.json(users);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:id', authMiddleware, requirePermission('MANAGE_USERS'), async (req, res) => {
  const { id } = req.params;
  const { name, role, title, avatar, email, permissions, password } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required to update the user' });
  }

  try {
    const pool = await getDbPool();
    const updatedPermissions = JSON.stringify(Array.isArray(permissions) ? permissions : []);
    const fields = [name, role, title || null, avatar || null, email || null, updatedPermissions];
    let query = `UPDATE users SET name = ?, role = ?, title = ?, avatar = ?, email = ?, permissions = ?`;

    if (password) {
      if (!isPasswordStrong(password)) {
        return res.status(400).json({ error: passwordPolicyError });
      }
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      query += `, password_hash = ?`;
      fields.push(passwordHash);
    }

    query += ` WHERE id = ?`;
    fields.push(id);

    const [result] = await pool.query(query, fields);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [rows] = await pool.query('SELECT id, username, name, role, title, avatar, email, permissions FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found after update' });
    }

    const updatedUser = rows[0];
    let parsedPermissions = [];
    try {
      if (typeof updatedUser.permissions === 'string') {
        parsedPermissions = JSON.parse(updatedUser.permissions);
      } else if (Array.isArray(updatedUser.permissions)) {
        parsedPermissions = updatedUser.permissions;
      }
    } catch (e) {
      console.error('Error parsing user permissions:', e);
    }

    res.json({
      ...updatedUser,
      permissions: parsedPermissions,
    });

    // Audit log for user update
    await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'UPDATE_USER', `User '${updatedUser.username}' (ID: ${id}) updated by '${req.user.name}'. Role set to '${role}'.`);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/accounts', authMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query('SELECT * FROM accounts');
    res.json(rows);
  } catch (error) {
    console.error('Fetch accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const pool = await getDbPool();
    const [rows] = await pool.query(`
      SELECT 
        f.*,
        a.name as account_name,
        a.tier as account_tier,
        a.annualRevenue as account_revenue,
        a.logoInitial as account_logo,
        a.slaTierHours as account_sla
      FROM feedback f
      LEFT JOIN accounts a ON f.accountId = a.id
      ORDER BY f.submittedAt DESC
    `);
    
    const feedbackItems = rows.map(item => {
      let tags = [];
      let encapsulatedSpec = null;
      let auditTrail = [];
      let comments = [];

      try {
        if (item.tags) tags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
        if (item.encapsulatedSpec) encapsulatedSpec = typeof item.encapsulatedSpec === 'string' ? JSON.parse(item.encapsulatedSpec) : item.encapsulatedSpec;
        if (item.auditTrail) auditTrail = typeof item.auditTrail === 'string' ? JSON.parse(item.auditTrail) : item.auditTrail;
        if (item.comments) comments = typeof item.comments === 'string' ? JSON.parse(item.comments) : item.comments;
      } catch (e) {
        console.error('Error parsing JSON fields for feedback', item.id, e);
      }

      const account = {
        id: item.accountId,
        name: item.account_name,
        tier: item.account_tier,
        annualRevenue: item.account_revenue,
        logoInitial: item.account_logo,
        slaTierHours: item.account_sla
      };

      return {
        id: item.id,
        code: item.code,
        title: item.title,
        rawContent: item.rawContent,
        category: item.category,
        priority: item.priority,
        stage: item.stage,
        account: account,
        sentiment: item.sentiment,
        submittedBy: item.submittedBy,
        submittedAt: item.submittedAt,
        slaDeadline: item.slaDeadline,
        isSlaBreached: Boolean(item.isSlaBreached),
        tags,
        encapsulatedSpec,
        auditTrail,
        comments
      };
    });

    res.json(feedbackItems);
  } catch (error) {
    console.error('Fetch feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/feedback', authMiddleware, requirePermission('CREATE_FEEDBACK'), async (req, res) => {
  try {
    const fb = req.body;
    
    // Ensure nested objects are stringified for MySQL JSON columns
    const tags = JSON.stringify(fb.tags || []);
    const encapsulatedSpec = fb.encapsulatedSpec ? JSON.stringify(fb.encapsulatedSpec) : null;
    const auditTrail = JSON.stringify(fb.auditTrail || []);
    const comments = JSON.stringify(fb.comments || []);
    
    const pool = await getDbPool();
    await pool.query(`
      INSERT INTO feedback 
      (id, code, title, rawContent, category, priority, stage, accountId, sentiment, submittedBy, submittedAt, slaDeadline, isSlaBreached, tags, encapsulatedSpec, auditTrail, comments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      fb.id, fb.code, fb.title, fb.rawContent, fb.category, fb.priority, fb.stage, 
      fb.account.id, fb.sentiment, fb.submittedBy, new Date(fb.submittedAt), new Date(fb.slaDeadline), 
      fb.isSlaBreached, tags, encapsulatedSpec, auditTrail, comments
    ]);

    // Audit log for new feedback
    await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'CREATE_FEEDBACK', `Feedback item '${fb.title}' (${fb.code}) created by '${req.user.name}'.`);

    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/feedback/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const fb = req.body;
    const pool = await getDbPool();
    const [existingRows] = await pool.query('SELECT stage, comments, encapsulatedSpec FROM feedback WHERE id = ?', [id]);
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Feedback item not found' });
    }

    const existingItem = existingRows[0];
    let existingComments = [];
    try {
      existingComments = existingItem.comments ? (typeof existingItem.comments === 'string' ? JSON.parse(existingItem.comments) : existingItem.comments) : [];
    } catch (e) {
      existingComments = [];
    }

    if (fb.encapsulatedSpec) {
      if (!hasPermission(req.user, 'ENCAPSULATE_FEEDBACK')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    if (fb.stage && fb.stage !== existingItem.stage) {
      if (!hasPermission(req.user, 'TRANSITION_WORKFLOW')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    const updatedComments = Array.isArray(fb.comments) ? fb.comments : [];
    if (updatedComments.length > existingComments.length) {
      if (!hasPermission(req.user, 'COMMENT_FEEDBACK')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }

    // Stringify JSON columns
    const tags = JSON.stringify(fb.tags || []);
    const encapsulatedSpec = fb.encapsulatedSpec ? JSON.stringify(fb.encapsulatedSpec) : null;
    const auditTrail = JSON.stringify(fb.auditTrail || []);
    const comments = JSON.stringify(fb.comments || []);
    
    await pool.query(`
      UPDATE feedback SET
        stage = ?,
        priority = ?,
        tags = ?,
        encapsulatedSpec = ?,
        auditTrail = ?,
        comments = ?
      WHERE id = ?
    `, [
      fb.stage, fb.priority, tags, encapsulatedSpec, auditTrail, comments, id
    ]);

    // Audit log for feedback update
    const changeDetails = [];
    if (fb.stage && fb.stage !== existingItem.stage) {
      changeDetails.push(`stage → '${fb.stage}'`);
      // Dedicated stage-change audit log
      await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'STAGE_CHANGED', `Feedback '${id}' transitioned from '${existingItem.stage}' to '${fb.stage}' by '${req.user.name}'.`);
    }
    if (fb.encapsulatedSpec) {
      changeDetails.push('encapsulated spec updated');
      // Dedicated encapsulation audit log
      await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'ENCAPSULATED', `Feedback '${id}' encapsulated into technical specification by '${req.user.name}'.`);
    }
    // Only log generic UPDATE_FEEDBACK when no specific sub-event was logged
    if (changeDetails.length === 0) {
      await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'UPDATE_FEEDBACK', `Feedback '${id}' updated by '${req.user.name}'.`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ── Create User endpoint ──────────────────────────────────────────────────
app.post('/api/users', authMiddleware, requirePermission('MANAGE_USERS'), async (req, res) => {
  const { username, name, role, title, avatar, email, permissions, password } = req.body;

  if (!username || !name || !role || !password) {
    return res.status(400).json({ error: 'username, name, role and password are required' });
  }

  if (!isPasswordStrong(password)) {
    return res.status(400).json({ error: passwordPolicyError });
  }

  try {
    const pool = await getDbPool();

    // Check username uniqueness
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: `Username '${username}' is already taken` });
    }

    const id = `usr-${Date.now()}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const permsJson = JSON.stringify(Array.isArray(permissions) ? permissions : []);

    await pool.query(
      'INSERT INTO users (id, username, password_hash, name, role, title, avatar, email, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, username, passwordHash, name, role, title || null, avatar || null, email || null, permsJson]
    );

    await insertAuditLog(pool, req.user.id, req.user.name, req.user.role, 'CREATE_USER', `New user '${username}' (${name}) created by '${req.user.name}'. Role: '${role}'.`);

    const [rows] = await pool.query('SELECT id, username, name, role, title, avatar, email, permissions FROM users WHERE id = ?', [id]);
    const created = rows[0];
    let parsedPermissions = [];
    try {
      parsedPermissions = typeof created.permissions === 'string' ? JSON.parse(created.permissions) : (created.permissions ?? []);
    } catch (e) {}

    res.status(201).json({ ...created, permissions: parsedPermissions });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── System Audit Log endpoint ──────────────────────────────────────────────
app.get('/api/audit-logs', authMiddleware, requirePermission('VIEW_AUDIT_LOGS'), async (req, res) => {
  try {
    const pool = await getDbPool();
    const limit = Math.min(parseInt(req.query.limit || '200', 10), 500);
    const offset = parseInt(req.query.offset || '0', 10);
    const search = req.query.search ? `%${req.query.search}%` : null;

    let query = 'SELECT * FROM system_audit_logs';
    const params = [];

    if (search) {
      query += ' WHERE (actorName LIKE ? OR action LIKE ? OR details LIKE ?)';
      params.push(search, search, search);
    }

    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    // Total count
    let countQuery = 'SELECT COUNT(*) as total FROM system_audit_logs';
    const countParams = [];
    if (search) {
      countQuery += ' WHERE (actorName LIKE ? OR action LIKE ? OR details LIKE ?)';
      countParams.push(search, search, search);
    }
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ logs: rows, total });
  } catch (error) {
    console.error('Fetch audit logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function startServer() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();
