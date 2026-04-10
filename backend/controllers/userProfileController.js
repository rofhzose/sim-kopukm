import pool from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * 📋 GET ALL USERS
 */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nip, username, name, avatar, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC");
    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🔍 GET USER BY ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT id, nip, username, name, avatar, role, is_active, created_at, updated_at FROM users WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("Get User By ID Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ➕ CREATE USER
 */
export const createUser = async (req, res) => {
  try {
    const { name, username, password, nip, role = "user", is_active = 1 } = req.body;

    // Validation
    if (!name || !username || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, username, dan password wajib diisi",
      });
    }

    // Check if username already exists
    const [existingUsername] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (existingUsername.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah terdaftar",
      });
    }

    // Check if NIP already exists (if provided)
    if (nip) {
      const [existingNip] = await pool.query("SELECT * FROM users WHERE nip = ?", [nip]);

      if (existingNip.length > 0) {
        return res.status(400).json({
          success: false,
          message: "NIP sudah terdaftar",
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query("INSERT INTO users (name, username, password, nip, role, is_active) VALUES (?, ?, ?, ?, ?, ?)", [name, username, hashedPassword, nip || null, role, is_active]);

    res.status(201).json({
      success: true,
      message: "Pengguna berhasil ditambahkan",
      data: {
        id: result.insertId,
        name,
        username,
        nip,
        role,
        is_active,
      },
    });
  } catch (error) {
    console.error("Create User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * ✏️ UPDATE USER
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, nip, role, is_active } = req.body;

    if (!name || !username) {
      return res.status(400).json({
        success: false,
        message: "Nama dan username wajib diisi",
      });
    }

    // Check if username exists (excluding current user)
    const [usernameCheck] = await pool.query("SELECT * FROM users WHERE username = ? AND id != ?", [username, id]);

    if (usernameCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username sudah digunakan oleh pengguna lain",
      });
    }

    // Check if NIP exists (excluding current user) - if provided
    if (nip) {
      const [nipCheck] = await pool.query("SELECT * FROM users WHERE nip = ? AND id != ?", [nip, id]);

      if (nipCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "NIP sudah digunakan oleh pengguna lain",
        });
      }
    }

    let updateQuery = "UPDATE users SET name = ?, username = ?, nip = ?, role = ?, is_active = ?";
    let queryParams = [name, username, nip || null, role || "user", is_active !== undefined ? is_active : 1];

    // If password is provided, hash and update it
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ", password = ?";
      queryParams.push(hashedPassword);
    }

    updateQuery += " WHERE id = ?";
    queryParams.push(id);

    const [result] = await pool.query(updateQuery, queryParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Pengguna berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🗑️ DELETE USER
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Pengguna tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "Pengguna berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🔐 LOGIN USER
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    // Get user
    const [user] = await pool.query("SELECT id, name, username, password, nip, role, avatar, is_active FROM users WHERE username = ?", [username]);

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Check if user is active
    if (user[0].is_active === 0) {
      return res.status(403).json({
        success: false,
        message: "Akun pengguna tidak aktif",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user[0].password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Update last login
    await pool.query("UPDATE users SET updated_at = NOW() WHERE id = ?", [user[0].id]);

    // Return user data (without password)
    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: user[0].id,
        name: user[0].name,
        username: user[0].username,
        nip: user[0].nip,
        role: user[0].role,
        avatar: user[0].avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
