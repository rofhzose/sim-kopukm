// routes/userProfile.js  — PUT /api/user/profile
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../config/db.js";

const router = express.Router();

// ── Multer ────────────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "avatars");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Format tidak didukung. Gunakan JPG, PNG, atau WebP."));
  },
});

// ── PUT /profile ──────────────────────────────────────────────────────────────
router.put("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Tidak terautentikasi" });

    // ← tambah phone di destructuring
    const { name, nip, username, phone } = req.body;

    // Tambahkan setelah destructuring
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: "Nama tidak boleh kosong" });
    }
    if (!username?.trim()) {
      return res.status(400).json({ success: false, message: "Username tidak boleh kosong" });
    }
    // Validasi NIP
    if (nip?.trim()) {
      if (!/^\d+$/.test(nip.trim())) return res.status(400).json({ success: false, message: "NIP hanya boleh berisi angka" });
      if (nip.trim().length !== 18) return res.status(400).json({ success: false, message: `NIP harus tepat 18 digit (sekarang ${nip.trim().length} digit)` });
    }

    // Validasi nomor HP (opsional)
    if (phone?.trim()) {
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length < 9 || cleaned.length > 15) return res.status(400).json({ success: false, message: "Nomor HP tidak valid (9–15 digit)" });
    }

    // Cek username unik
    const [existing] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username.trim(), userId]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: "Username sudah digunakan" });

    // Avatar baru
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = `uploads/avatars/${req.file.filename}`;
      const [rows] = await pool.query("SELECT avatar FROM users WHERE id = ?", [userId]);
      const old = rows[0]?.avatar;
      if (old?.startsWith("uploads/")) {
        const oldPath = path.join(process.cwd(), old);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    // ← tambah phone = ? di fields
    const fields = ["name = ?", "nip = ?", "username = ?", "phone = ?", "updated_at = NOW()"];
    const values = [
      name.trim(),
      nip?.trim() || null,
      username.trim(),
      phone?.trim() || null, // ← value phone
    ];

    if (avatarUrl) {
      fields.push("avatar = ?");
      values.push(avatarUrl);
    }
    values.push(userId);

    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);

    // ← tambah phone di SELECT kembalikan data terbaru
    const [rows] = await pool.query("SELECT id, name, nip, username, phone, avatar, created_at, updated_at FROM users WHERE id = ?", [userId]);
    const user = rows[0];
    if (user.avatar?.startsWith("uploads/")) user.avatar = `${req.protocol}://${req.get("host")}/${user.avatar}`;

    return res.json({ success: true, message: "Profil berhasil diperbarui", data: user });
  } catch (err) {
    console.error("Profile update error:", err);
    if (err.code === "LIMIT_FILE_SIZE") return res.status(400).json({ success: false, message: "Ukuran foto maksimal 2 MB" });
    return res.status(500).json({ success: false, message: err.message || "Terjadi kesalahan server" });
  }
});

export default router;
