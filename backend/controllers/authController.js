import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // cek username sudah ada
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length > 0) return res.status(400).json({ message: "Username sudah digunakan" });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [
      username,
      hashedPassword,
      role || "viewer",
    ]);

    res.status(201).json({ message: "User berhasil terdaftar" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // cari user
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) return res.status(404).json({ message: "User tidak ditemukan" });

    const user = rows[0];

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Password salah" });

    // buat token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};
