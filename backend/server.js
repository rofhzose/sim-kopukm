import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import pool from "./config/db.js";

dotenv.config();

// tes koneksi DB apa aja bikin koding
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL Connected!");
    conn.release();
  } catch (err) {
    console.error("❌ Database Error:", err.message);
  }
})();

// buat HTTP server + socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", () => console.log("🔴 Socket disconnected"));
});

// jalankan server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
