import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import umkmRoutes from "./routes/umkmRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";

// import koperasiRoutes from "./routes/koperasiRoutes.js";
// import umkmRoutes from "./routes/umkmRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("🚀 SIM-KOPUKM Backend Aktif!");
});



app.use("/api/auth", authRoutes);
app.use("/api/umkm", umkmRoutes);
app.use("/api/data", dataRoutes);
// app.use("/api/koperasi", koperasiRoutes);
// app.use("/api/umkm", umkmRoutes);

export default app;
