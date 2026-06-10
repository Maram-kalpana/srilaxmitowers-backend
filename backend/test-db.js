import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'srilaxmi',
  waitForConnections: true,
  connectionLimit: 1,
  queueLimit: 0,
};

console.log('DB config:', config);

const pool = mysql.createPool(config);

try {
  const [rows] = await pool.query('SELECT DATABASE() AS db, VERSION() AS version');
  console.log('DB connection succeeded:', rows);
} catch (err) {
  console.error('DB connection failed:', err);
} finally {
  await pool.end();
}
