import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbUrl = process.env.DATABASE_URL;

let pool;

if (dbUrl) {
  pool = mysql.createPool({
    uri: dbUrl,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else if (process.env.DB_HOST) {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
} else {
  console.error("❌ FATAL ERROR: Database configuration (DATABASE_URL or DB_HOST/USER/NAME) is missing.");
  process.exit(1);
}

export default pool;
