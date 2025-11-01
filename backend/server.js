import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";

import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

// =========================
// 🔹 Konfigurasi awal
// =========================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// 🔹 Middleware umum
// =========================
app.use(express.json());
app.use(cors());
app.use(helmet());

// Setup logging folder & stream
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));

// =========================
// 🔹 Tes koneksi database
// =========================
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected!");
    conn.release();
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
})();

// =========================
// 🔹 Routing
// =========================
app.get("/", (req, res) => {
  res.send("🚀 SIM-KOPUKM Backend Aktif!");
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =========================
// 🔹 Handler 404
// =========================
app.use((req, res, next) => {
  const error = new Error(`Endpoint tidak ditemukan: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// =========================
// 🔹 Global Error Handler
// =========================
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const logEntry = `[${new Date().toISOString()}] ${status} ${req.method} ${
    req.originalUrl
  } - ${err.message}\n`;

  fs.appendFileSync(path.join(logDir, "error.log"), logEntry);
  console.error("❌", logEntry);

  res.status(status).json({
    status: "error",
    code: status,
    message: err.message,
  });
});

// =========================
// 🔹 Setup HTTP & Socket.io
// =========================
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
});

// =========================
// 🔹 Jalankan server
// =========================
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
