import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

/**
 * Register user baru
 */
export const registerUser = async (req, res) => {
  try {
    const { username, password, email, no_hp, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    // cek apakah username sudah terdaftar
    const [existing] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Username sudah terdaftar" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user baru
    await pool.query(
      "INSERT INTO users (username, password, email, no_hp, role) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, email || null, no_hp || null, role || "user"]
    );

    res.status(201).json({
      success: true,
      message: "User berhasil dibuat",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: "Username dan password wajib diisi" });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        no_hp: user.no_hp,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Ambil semua user
 */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, username, email, no_hp, role FROM users");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update role user
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin", "sekdin", "kadin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Role tidak valid" });
    }

    const [result] = await pool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, message: "Role berhasil diperbarui" });
  } catch (error) {
    console.error("Update Role Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Hapus user
 */
export const deleteUser = async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Update user (profil)
 */
export const updateUser = async (req, res) => {
  try {
    const { username, email, no_hp } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET username = ?, email = ?, no_hp = ? WHERE id = ?",
      [username, email, no_hp, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, message: "User berhasil diperbarui" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
