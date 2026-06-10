import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { query } from "../config/db.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbName = process.env.DB_NAME || "srilaxmi";

async function init() {
  const sqlPath = path.join(__dirname, "..", "..", "database.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
  });

  try {
    await connection.query(sql);
  } finally {
    await connection.end();
  }

  const existingAdmin = await query(
    "SELECT id FROM users WHERE username = 'admin' AND deleted_at IS NULL"
  );

  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash("admin123", 12);
    await query(
      "INSERT INTO users (username, email, name, password_hash, role) VALUES ('admin', 'admin@srilaxmi.com', 'Admin', ?, 'admin')",
      [hash]
    );
    console.log("Seeded admin user — username: admin, password: admin123");
  } else {
    console.log("Admin user already exists");
  }

  console.log("Database initialized successfully");
}

init()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
