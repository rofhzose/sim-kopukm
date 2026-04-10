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
import hirarkiRoutes from "./routes/hirarkiRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import rkaRoutes from "./routes/rkaRoutes.js";
import pegawaiRouter from "./routes/pegawaiRoutes.js";
import pegawaiHirarkiRoutes from "./routes/pegawaiHirarkiRoutes.js";
import jabatanRouter from "./routes/jabatanRoutes.js";
import renstraSatuansRouter from "./routes/renstraSatuansRoutes.js";
import dokumenRenjaRoutes from "./routes/dokumenRenja.js";
import dokumenSopRoute from "./routes/dokumenSop.js";
import dokumenSpipRoute from "./routes/dokumenSpip.js";
import dokumenLakipRoutes from "./routes/dokumenLakip.js";
import dokumenLkpjRoutes from "./routes/dokumenLkpj.js";
import dokumenLppdRoutes from "./routes/dokumenLppd.js";
import paguRoutes from "./routes/paguRoutes.js";
import skmRoutes from "./routes/skmRoutes.js";
import dokumenLhpRoutes from "./routes/dokumenLhp.js";
import dokumenLkeRoutes from "./routes/dokumenLke.js";
import dokumenDpaRoutes from "./routes/dokumenDpa.js";
import dokumenKakRoutes from "./routes/dokumenKak.js";
import masterRoutes from "./routes/masterRoutes.js";
import userProfileRoutes from "./routes/userProfile.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import statusPegawaiRoute from "./routes/statusPegawaiRoute.js";
// tambahkan import ini
import userRoutes from "./routes/userRoutes.js";
import rencanaAksiRoutes from "./routes/rencanaaksiRoutes.js";
import pohonKinerjaRoutes from "./routes/pohonKinerjaRoutes.js";
import bukuTamuRoutes from "./routes/bukuTamuRoutes.js";

//RENSTRA
import ProgramRoutes from "./routes/Renstra/ProgramRoutes.js";
import ProgramAnggaranRoutes from "./routes/Renstra/ProgramAnggaranRoutes.js";
import KegiatanRoutes from "./routes/Renstra/KegiatanRoutes.js";
import KegiatanAnggaranRoutes from "./routes/Renstra/KegiatanAnggaranRoutes.js";
import TahunRoutes from "./routes/Renstra/TahunRoutes.js";
import SubKegiatanRoutes from "./routes/Renstra/SubKegiatanRoutes.js";
import SubKegiatanAnggaranRoutes from "./routes/Renstra/SubKegiatanAnggaranRoutes.js";
import DokumenRenstraRoutes from "./routes/Renstra/DokumenRoutes.js";
import DashboardRenstraRoutes from "./routes/Renstra/DashboardRoutes.js";
import KibBRoutes from "./routes/kibBRoutes.js";
import kibERoutes from "./routes/kibERoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4849;
const NODE_ENV = process.env.NODE_ENV || "production";

// ================================
// 🔹 Direktori log
// ================================
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), { flags: "a" });

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
  "http://192.168.1.9:3002",
  "http://72.61.208.1:3002",
  "http://192.168.1.9:4849",
  "http://192.168.1.6:3002",
  "http://192.168.1.6:4849",
  "http://localhost:3002",
  "http://localhost:3002",


  // ✅ Tambahkan ini:
  "http://192.168.1.5:3001",
  "http://192.168.1.5:3002",
  "http://192.168.1.8:3001",
  "http://192.168.1.8:4849",
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
  }),
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
  }),
);

// ✅ ADD THIS — fix ERR_BLOCKED_BY_RESPONSE.NotSameOrigin for all file previews
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});

app.use(xss());
app.use(hpp());

// ================================
// 🔹 Rate Limit (anti spam)
// ================================
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10000,
    message: "Too many requests",
  }),
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
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    try {
      res.removeHeader("X-Frame-Options");
    } catch (e) {}
    next();
  },
  express.static(uploadsDir, { index: false }),
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
app.use("/api/hirarki", hirarkiRoutes);
app.use("/hirarki", hirarkiRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/renstra/programs", programRoutes);
app.use("/api/pegawai", pegawaiRouter);
app.use("/api/jabatan", jabatanRouter);
app.use("/api/pegawai-hirarki", pegawaiHirarkiRoutes);
app.use("/api/rka", rkaRoutes);
app.use("/api/renstra/satuans", renstraSatuansRouter);
app.use("/api/dokumen/renja", dokumenRenjaRoutes);
app.use("/api/dokumen/sop", dokumenSopRoute);
app.use("/api/dokumen/spip", dokumenSpipRoute);
app.use("/api/dokumen/lkpj", dokumenLkpjRoutes);
app.use("/api/dokumen/lakip", dokumenLakipRoutes);
app.use("/api/lppd", dokumenLppdRoutes);
app.use("/api/pagu", paguRoutes);
app.use("/api/skm", skmRoutes);
app.use("/api/lhp", dokumenLhpRoutes);
app.use("/api/dokumen/lke", dokumenLkeRoutes);
app.use("/api/dokumen/dpa", dokumenDpaRoutes);
app.use("/api/dokumen/kak", dokumenKakRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/user", verifyToken, userProfileRoutes); // PUT /profile
app.use("/api/user", verifyToken, userRoutes);        // GET /, GET /:id, POST /, PUT /:id, DELETE /:id
app.use("/api/rencana-aksi", rencanaAksiRoutes);
app.use("/api/pohon-kinerja", pohonKinerjaRoutes);
app.use("/api/status-pegawai", statusPegawaiRoute);
app.use("/api/buku-tamu", bukuTamuRoutes);

//RENSTRA
app.use("/api/renstra/program", ProgramRoutes);
app.use("/api/renstra/program-anggaran", ProgramAnggaranRoutes);
app.use("/api/renstra/kegiatan", KegiatanRoutes);
app.use("/api/renstra/kegiatan-anggaran", KegiatanAnggaranRoutes);
app.use("/api/renstra/sub-kegiatan", SubKegiatanRoutes);
app.use("/api/renstra/sub-kegiatan-anggaran", SubKegiatanAnggaranRoutes);
app.use("/api/renstra/tahun", TahunRoutes);
app.use("/api/renstra/dokumen", DokumenRenstraRoutes);
app.use("/api/renstra/dashboard", DashboardRenstraRoutes);
app.use("/api/kib-b", KibBRoutes);
app.use("/api/kib-e", kibERoutes);

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

  const logEntry = `[${new Date().toISOString()}] ${status} ${req.method} ${req.originalUrl} - ${err.message}\n`;

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
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
