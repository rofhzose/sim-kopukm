// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import morgan from "morgan";
// import fs from "fs";
// import path from "path";

// import authRoutes from "./routes/authRoutes.js";
// import umkmRoutes from "./routes/umkmRoutes.js";
// import dataRoutes from "./routes/dataRoutes.js";

// const app = express();

// app.use(express.json());
// app.use(cors());
// app.use(helmet());

// const logDir = path.join(process.cwd(), "logs");
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// const accessLogStream = fs.createWriteStream(path.join(logDir, "access.log"), {
//   flags: "a",
// });

// app.use(morgan("dev"));
// app.use(morgan("combined", { stream: accessLogStream }));

// app.get("/", (req, res) => {
//   res.send("🚀 SIM-KOPUKM Backend Aktif!");
// });

// app.use("/api/auth", authRoutes);
// app.use("/api/umkm", umkmRoutes);
// app.use("/api/data", dataRoutes);

// // 🚫 Handler 404
// app.use((req, res, next) => {
//   const error = new Error(`Endpoint tidak ditemukan: ${req.originalUrl}`);
//   error.status = 404;
//   next(error);
// });

// // ❌ Handler error global
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


// export default app;
