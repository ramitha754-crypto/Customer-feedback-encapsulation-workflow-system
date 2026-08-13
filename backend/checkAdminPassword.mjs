import { getDbPool } from './db.js';
import bcrypt from 'bcryptjs';

async function main() {
  const pool = await getDbPool();
  const [rows] = await pool.query('SELECT username, password_hash FROM users WHERE username = ?', ['admin']);
  console.log(rows);
  const hash = rows[0].password_hash;
  const password = process.env.PASSWORD_TO_TEST;
  if (!password) {
    console.error('PASSWORD_TO_TEST not set. Set environment variable PASSWORD_TO_TEST to test admin password.');
    process.exit(1);
  }
  const match = await bcrypt.compare(password, hash);
  console.log('password provided, match', match);
  await pool.end();
}
main();
