import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import hpp from "hpp";

import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import koperasiRoute from "./routes/koperasiRoutes.js";
import umkmRoute from "./routes/umkmRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4849;
const NODE_ENV = process.env.NODE_ENV || "production";

// ================================
// 🔹 Direktori log
// ================================
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" }
);

// ================================
// 🔹 Allowed Origins (FIXED)
// ================================
const allowedOrigins = [

  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",   // ✅ WAJIB TAMBAH
  "http://127.0.0.1:3001",
  "http://127.0.0.1:4849",
  "https://himavera.my.id",
  "https://www.himavera.my.id",
  "https://api.himavera.my.id",
  "http://api.himavera.my.id",
  "http://72.61.208.1:3000",
  "http://72.61.208.1:3001",
  "http://72.61.208.1:2211",
  
];



// ================================
// 🔥 CORS HARUS PALING ATAS!
// ================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, curl, dll
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ Blocked CORS Origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ================================
// 🔹 Middleware umum
// ================================
app.use(express.json());
app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));

// ================================
// 🔹 Security Middleware
// ================================
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // CSRF inline css/script biarkan OFF untuk CSR frontend
  })
);

app.use(xss());
app.use(hpp());

// ================================
// 🔹 Rate Limit (anti spam)
// ================================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: "Too many requests",
  })
);

// ================================
// 🔹 Tes koneksi database
// ================================
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected!");
    conn.release();
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
})();

// ================================
// 🔹 Routing
// ================================
app.get("/", (req, res) => {
  res.send("🚀 API KHFDZ Backend Aktif!");
});

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", koperasiRoute);
app.use("/api", koperasiRoute);
app.use("/api", umkmRoute);

// ================================
// 🔹 Handler 404
// ================================
app.use((req, res, next) => {
  const error = new Error(`Endpoint tidak ditemukan: ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// ================================
// 🔹 Global Error Handler
// ================================
app.use((err, req, res, next) => {
  const status = err.status || 500;

  const logEntry = `[${new Date().toISOString()}] ${status} ${req.method} ${
    req.originalUrl
  } - ${err.message}\n`;

  fs.appendFileSync(path.join(logDir, "error.log"), logEntry);

  console.error("❌ ERROR:", logEntry);

  res.status(status).json({
    status: "error",
    code: status,
    message: err.message,
  });
});

// ================================
// 🔹 Setup HTTP + SOCKET.IO
// ================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
});

// ================================
// 🔹 Jalankan server
// ================================
const HOST = NODE_ENV === "production" ? "0.0.0.0" : "localhost";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
