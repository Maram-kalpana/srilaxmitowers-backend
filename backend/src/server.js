import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await pool.query("SELECT 1");
    console.log("MySQL connected — database:", process.env.DB_NAME || "srilaxmi");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    console.error("Run: mysql -u root < database.sql  &&  npm run db:init");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Srilaxmi API running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });
}

start();
