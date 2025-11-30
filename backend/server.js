// backend/src/server.js
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
import dokumenSotkRoutes from "./routes/dokumenSotk.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4849;
const NODE_ENV = process.env.NODE_ENV || "production";

// ================================
// 🔹 Direktori log
// ================================
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(
  path.join(logDir, "access.log"),
  { flags: "a" }
);

// ================================
// 🔹 Direktori uploads (static files)
// ================================
const uploadsDir = path.join(process.cwd(), "uploads");
const uploadsSotkDir = path.join(uploadsDir, "sotk");

// ensure upload folders exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(uploadsSotkDir)) fs.mkdirSync(uploadsSotkDir, { recursive: true });

// ================================
// 🔹 Allowed Origins (FIXED)
// ================================
const allowedOrigins = [
  "https://himavera.my.id",
  "http://himavera.my.id",
  "https://api.himavera.my.id",
  "https://www.himavera.my.id",
  "http://www.himavera.my.id",
  "http://72.61.208.1",
  "http://72.61.208.1:4849",
  "http://72.61.208.1:3000",
  "http://72.61.208.1:3001",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:4849",
];

// ================================
// 🔥 CORS HARUS PALING ATAS!
// ================================
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, curl, mobile apps, server-to-server
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
    contentSecurityPolicy: false, // disable for easier CSR + inline assets
    frameguard: false,
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
// 🔹 Static: serve uploads (accessible at /uploads/*)
// ================================
// pastikan uploadsDir sudah didefinisikan sebelum ini
// contoh: const uploadsDir = path.join(process.cwd(), "uploads");

app.use(
  "/uploads",
  (req, res, next) => {
    // remove frame options so uploads can be embedded in iframes
    try {
      res.removeHeader("X-Frame-Options");
      // optional: remove CSP if you added restrictive policy earlier
      // res.removeHeader("Content-Security-Policy");
    } catch (e) {
      // ignore if not supported
    }
    next();
  },
  express.static(uploadsDir, { index: false })
);


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
app.use("/api/dokumen/sotk", dokumenSotkRoutes);

// ================================
// 🔹 Handler 404 (after routes)
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

  // If CORS blocked origin, express-cors callback returns an Error (message: Not allowed by CORS)
  if (err.message && err.message.includes("Not allowed by CORS")) {
    return res.status(403).json({ status: "error", code: 403, message: err.message });
  }

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
const HOST = NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
