import dotenv from 'dotenv';
import { getDbPool } from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const ADMIN_USERNAME = 'admin';
const ADMIN_ID = 'usr-1';

const adminPermissions = JSON.stringify([
  'ENCAPSULATE_FEEDBACK',
  'TRANSITION_WORKFLOW',
  'VIEW_ANALYTICS',
  'ASSIGN_EPIC',
  'MANAGE_USERS',
  'FULL_ADMIN_ACCESS',
  'CREATE_FEEDBACK',
  'SUBMIT_FEEDBACK',
  'TRIAGE_FEEDBACK',
  'COMMENT_FEEDBACK',
  'DELETE_FEEDBACK',
  'OVERRIDE_SLA',
  'VIEW_ENCAPSULATIONS',
  'VIEW_OWN_FEEDBACK'
]);

function generateRandomPassword(length = 20) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}<>?';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

async function promptPassword(promptText) {
  const stdin = process.stdin;
  const stdout = process.stdout;

  return new Promise((resolve, reject) => {
    if (!stdin.isTTY) return reject(new Error('Stdin is not a TTY; cannot securely prompt for password'));

    stdout.write(promptText);
    stdin.setRawMode(true);
    stdin.resume();

    let password = '';

    function onData(chunk) {
      const char = chunk.toString('utf8');

      // Enter/Return
      if (char === '\r' || char === '\n') {
        stdout.write('\n');
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        resolve(password);
        return;
      }

      // Ctrl+C
      if (char === '\u0003') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener('data', onData);
        reject(new Error('Aborted'));
        return;
      }

      // Backspace handling
      if (char === '\u0008' || char === '\u007f') {
        if (password.length > 0) {
          password = password.slice(0, -1);
        }
        return;
      }

      // Append character (no echo)
      password += char;
    }

    stdin.on('data', onData);
  });
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const useRandom = args.includes('--random');

    let password;
    let printed = false;

    if (useRandom) {
      password = generateRandomPassword(20);
      printed = true; // will print after successful DB update
    } else {
      // Prompt for password twice
      const p1 = await promptPassword('Enter new admin password: ');
      const p2 = await promptPassword('Confirm new admin password: ');
      if (p1 !== p2) {
        console.error('Passwords do not match. Aborting.');
        process.exit(1);
      }
      password = p1;
    }

    // Validate minimum criteria (optional, match policy if desired)
    if (password.length < 8) {
      console.error('Password must be at least 8 characters long. Aborting.');
      process.exit(1);
    }

    const hash = await bcrypt.hash(password, 10);

    const pool = await getDbPool();

    // Ensure users table exists (db.setup may not have run)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        title VARCHAR(100),
        avatar VARCHAR(50),
        email VARCHAR(100),
        permissions JSON
      )
    `);

    const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [ADMIN_USERNAME]);
    if (rows.length === 0) {
      await pool.query(`
        INSERT INTO users (id, username, password_hash, name, role, title, avatar, email, permissions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [ADMIN_ID, ADMIN_USERNAME, hash, 'Administrator', 'ENTERPRISE_ADMIN', 'Administrator', 'AD', 'admin@local', adminPermissions]);
      console.log('Admin user created/updated successfully.');
    } else {
      await pool.query('UPDATE users SET password_hash = ?, role = ?, permissions = ? WHERE username = ?', [hash, 'ENTERPRISE_ADMIN', adminPermissions, ADMIN_USERNAME]);
      console.log('Admin user updated successfully.');
    }

    await pool.end();

    if (printed) {
      console.log('\nGenerated admin password (copy now, shown only once):');
      console.log(password);
      console.log('\nStore it securely and change it after first login.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to set admin password:', err);
    process.exit(1);
  }
}

main();
