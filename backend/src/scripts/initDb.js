import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
  const sqlPath = path.join(__dirname, "..", "..", "database.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  const conn = await pool.getConnection();
  try {
    for (const stmt of statements) {
      await conn.query(stmt);
    }

    const [rows] = await conn.query(
      `SELECT id FROM users WHERE username = 'admin' AND deleted_at IS NULL`
    );
    if (rows.length === 0) {
      const hash = await bcrypt.hash("admin123", 12);
      await conn.query(
        `INSERT INTO users (username, email, name, password_hash, role) VALUES ('admin', 'admin@srilaxmi.com', 'Admin', ?, 'admin')`,
        [hash]
      );
      console.log("Seeded admin user — username: admin, password: admin123");
    } else {
      console.log("Admin user already exists");
    }

    console.log("Database initialized successfully");
  } finally {
    conn.release();
    await pool.end();
  }
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
