import pool from "../config/db.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nip, username, name, avatar, role, phone, is_active, last_location, last_device, last_login_at, created_at, updated_at FROM users ORDER BY created_at DESC");
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT id, nip, username, name, avatar, role, is_active, created_at, updated_at FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, username, password, nip, role = "user", is_active = 1 } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ success: false, message: "Nama, username, dan password wajib diisi" });
    }

    const [existingUsername] = await pool.query("SELECT id FROM users WHERE username = ?", [username]);
    if (existingUsername.length > 0) return res.status(400).json({ success: false, message: "Username sudah terdaftar" });

    if (nip) {
      const [existingNip] = await pool.query("SELECT id FROM users WHERE nip = ?", [nip]);
      if (existingNip.length > 0) return res.status(400).json({ success: false, message: "NIP sudah terdaftar" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query("INSERT INTO users (name, username, password, nip, role, is_active) VALUES (?, ?, ?, ?, ?, ?)", [name, username, hashedPassword, nip || null, role, is_active]);

    res.status(201).json({ success: true, message: "Pengguna berhasil ditambahkan", data: { id: result.insertId, name, username, nip, role, is_active } });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, nip, role, is_active } = req.body;

    if (!name || !username) return res.status(400).json({ success: false, message: "Nama dan username wajib diisi" });

    const [usernameCheck] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username, id]);
    if (usernameCheck.length > 0) return res.status(400).json({ success: false, message: "Username sudah digunakan oleh pengguna lain" });

    if (nip) {
      const [nipCheck] = await pool.query("SELECT id FROM users WHERE nip = ? AND id != ?", [nip, id]);
      if (nipCheck.length > 0) return res.status(400).json({ success: false, message: "NIP sudah digunakan oleh pengguna lain" });
    }

    let updateQuery = "UPDATE users SET name = ?, username = ?, nip = ?, role = ?, is_active = ?";
    let queryParams = [name, username, nip || null, role || "user", is_active !== undefined ? is_active : 1];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateQuery += " WHERE id = ?";
    queryParams.push(id);

    const [result] = await pool.query(updateQuery, queryParams);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });

    res.json({ success: true, message: "Pengguna berhasil diperbarui" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    res.json({ success: true, message: "Pengguna berhasil dihapus" });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDeviceInfo = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Tidak terautentikasi" });

    const { device, location } = req.body;

    await pool.query("UPDATE users SET last_device = ?, last_location = ?, last_login_at = NOW() WHERE id = ?", [device || null, location || null, userId]);

    res.json({ success: true });
  } catch (error) {
    console.error("Update Device Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
