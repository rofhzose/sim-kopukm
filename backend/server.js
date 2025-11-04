// import http from "http";
// import { Server } from "socket.io";
// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import fs from "fs";
// import path from "path";
// import rateLimit from "express-rate-limit";
// import xss from "xss-clean";
// import hpp from "hpp";

// import pool from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import dashboardRoutes from "./routes/dashboardRoutes.js";

// // =========================
// // 🔹 Konfigurasi awal
// // =========================
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 4849;
// const NODE_ENV = process.env.NODE_ENV || "development";

// // =========================
// // 🔹 Folder log
// // =========================
// const logDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
//   flags: "a",
// });

// // =========================
// // 🔹 Middleware umum
// // =========================
// app.use(express.json());
// app.use(morgan("dev"));
// app.use(morgan("combined", { stream: accessLogStream }));

// // Security Middleware
// app.use(helmet({
//   contentSecurityPolicy: NODE_ENV === "production" ? {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'"],
//       styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
//       fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       imgSrc: ["'self'", "data:", "https:"],
//     },
//   } : false,
//   crossOriginEmbedderPolicy: false,
// }));

// app.use(xss());
// app.use(hpp());

// // Rate Limit (maks 100 request per 15 menit per IP)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Too many requests, please try again later.",
// });
// app.use(limiter);

// // =========================
// // 🔹 CORS Setup (Lokal + Production)
// // =========================
// const allowedOrigins =
//   NODE_ENV === "production"
//     ? ["https://khfdz.my.id", "http://khfdz.my.id"]
//     : ["http://localhost:3000", "http://127.0.0.1:3000", "http://api.khfdz.my.id"];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.warn("🚫 Blocked CORS origin:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// // =========================
// // 🔹 Tes koneksi database
// // =========================
// (async () => {
//   try {
//     const conn = await pool.getConnection();
//     console.log("✅ MySQL Connected!");
//     conn.release();
//   } catch (err) {
//     console.error("❌ Database Error:", err.message);
//   }
// })();

// // =========================
// // 🔹 Routing
// // =========================
// app.get("/", (req, res) => {
//   res.send("🚀 API KHFDZ Backend Aktif!");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/dashboard", dashboardRoutes);

// // =========================
// // 🔹 Handler 404
// // =========================
// app.use((req, res, next) => {
//   const error = new Error(`Endpoint tidak ditemukan: ${req.originalUrl}`);
//   error.status = 404;
//   next(error);
// });

// // =========================
// // 🔹 Global Error Handler
// // =========================
// app.use((err, req, res, next) => {
//   const status = err.status || 500;
//   const logEntry = `[${new Date().toISOString()}] ${status} ${req.method} ${
//     req.originalUrl
//   } - ${err.message}\n`;

//   fs.appendFileSync(path.join(logDir, "error.log"), logEntry);
//   console.error("❌", logEntry);

//   res.status(status).json({
//     status: "error",
//     code: status,
//     message: err.message,
//   });
// });

// // =========================
// // 🔹 Setup HTTP & Socket.io
// // =========================
// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: allowedOrigins } });

// io.on("connection", (socket) => {
//   console.log("🟢 Socket connected:", socket.id);
//   socket.on("disconnect", () => console.log("🔴 Socket disconnected:", socket.id));
// });

// // =========================
// // 🔹 Jalankan server
// // =========================
// const HOST = NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
// server.listen(PORT, HOST, () => {
//   console.log(`🚀 Server running on http://${HOST}:${PORT}`);
// });

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

// =========================
// 🔹 Konfigurasi awal
// =========================
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4849;
const NODE_ENV = process.env.NODE_ENV || "development";

// =========================
// 🔹 Folder log
// =========================
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
  flags: "a",
});

// =========================
// 🔹 Middleware umum
// =========================
app.use(express.json());
app.use(morgan("dev"));
app.use(morgan("combined", { stream: accessLogStream }));

// =========================
// 🔹 Security Middleware
// =========================
app.use(
  helmet({
    contentSecurityPolicy:
      NODE_ENV === "production"
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
              ],
              fontSrc: ["'self'", "https://fonts.gstatic.com"],
              imgSrc: ["'self'", "data:", "https:"],
            },
          }
        : false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(xss());
app.use(hpp());

// =========================
// 🔹 Rate Limit (anti spam)
// =========================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// =========================
// 🔹 CORS Setup (Lokal + Production)
// =========================
const allowedOrigins = [
  "http://localhost:3000",   // Frontend lokal
  "http://127.0.0.1:3000",   // Local variant
  "http://api.khfdz.my.id",  // API domain
  "http://khfdz.my.id",      // Web domain (HTTP)
  "https://khfdz.my.id",     // Web domain (HTTPS)
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Untuk Postman, curl, dll
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.warn("🚫 Blocked CORS origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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
  res.send("🚀 API KHFDZ Backend Aktif!");
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
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
});

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", () =>
    console.log("🔴 Socket disconnected:", socket.id)
  );
});

// =========================
// 🔹 Jalankan server
// =========================
const HOST = NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
