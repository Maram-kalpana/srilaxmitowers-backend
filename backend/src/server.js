import dotenv from "dotenv";
import app from "./app.js";
import { testConnection } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await testConnection();
    console.log("MySQL connected - database:", process.env.DB_NAME || "srilaxmi");
  } catch (err) {
    console.error("Database connection failed:", err);
    console.error("Run: npm install && npm run db:init");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Srilaxmi API running on http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Please stop the process using that port or change PORT in .env.`);
      process.exit(1);
    }
    throw error;
  });
}

start();
