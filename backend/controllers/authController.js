import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";

/**
 * Helper: hapus file avatar lama dari disk
 */
const deleteAvatarFile = (avatarPath) => {
  if (!avatarPath) return;
  try {
    if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
  } catch (err) {
    console.warn("Could not delete avatar file:", err);
  }
};

/**
 * 🧾 REGISTER USER dengan NIP, Name, dan Avatar (opsional)
 */
export const registerUser = async (req, res) => {
  // Jika ada file terupload tapi terjadi error, hapus file-nya
  const uploadedFile = req.file ? req.file.path : null;

  try {
    const { nip, username, name, password, role } = req.body;

    // ✅ Validate required fields
    if (!nip || !username || !name || !password) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "NIP, username, nama, dan password wajib diisi",
      });
    }

    // ✅ Validate NIP format (18 digits)
    if (nip.length !== 18 || !/^\d+$/.test(nip)) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "NIP harus 18 digit angka",
      });
    }

    // ✅ Validate password strength
    if (password.length < 6) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter",
      });
    }

    // ✅ Check if NIP exists in pegawai table
    const [pegawaiRows] = await pool.query(
      "SELECT id_pegawai, nama_lengkap FROM pegawai WHERE nip = ?",
      [nip]
    );

    if (pegawaiRows.length === 0) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "NIP tidak terdaftar di database pegawai",
      });
    }

    // ✅ Check if username already exists
    const [existingUsername] = await pool.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (existingUsername.length > 0) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "Username sudah terdaftar",
      });
    }

    // ✅ Check if NIP already has user account
    const [existingNip] = await pool.query(
      "SELECT id FROM users WHERE nip = ?",
      [nip]
    );

    if (existingNip.length > 0) {
      deleteAvatarFile(uploadedFile);
      return res.status(400).json({
        success: false,
        message: "NIP ini sudah memiliki akun user",
      });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Siapkan path avatar (null jika tidak ada)
    // Simpan sebagai URL relatif yang bisa diakses frontend
    const avatarPath = req.file
      ? `uploads/avatars/${req.file.filename}`
      : null;

    // ✅ INSERT user dengan avatar
    const [result] = await pool.query(
      `INSERT INTO users (nip, username, name, password, role, avatar, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [nip, username, name, hashedPassword, role || "user", avatarPath]
    );

    const userId = result.insertId;

    console.log(`✓ User registered: ID=${userId}, NIP=${nip}, Username=${username}, Name=${name}, Avatar=${avatarPath || "none"}`);

    // ✅ Update pegawai table dengan user_id
    try {
      await pool.query("UPDATE pegawai SET id_user = ? WHERE nip = ?", [userId, nip]);
    } catch (err) {
      console.warn("Could not update pegawai id_user:", err);
    }

    // ✅ Return success response
    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      data: {
        id: userId,
        nip,
        username,
        name,
        role: role || "user",
        avatar: avatarPath
          ? `${process.env.BASE_URL || "http://localhost:4849"}/${avatarPath}`
          : null,
      },
    });
  } catch (error) {
    // Hapus file jika terjadi error server
    deleteAvatarFile(uploadedFile);
    console.error("Register Error:", error);
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

    // ✅ Find user
    const [rows] = await pool.query(
      "SELECT id, nip, username, name, password, role, avatar, is_active FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun ini telah dinonaktifkan",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        nip: user.nip,
        username: user.username,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "7d" }
    );

    // ✅ Update last_login
    // try {
    //   await pool.query("UPDATE users SET last_login = NOW() WHERE id = ?", [user.id]);
    // } catch (err) {
    //   console.warn("Could not update last_login:", err);
    // }

    // ✅ Build avatar URL
    const avatarUrl = user.avatar
      ? `${process.env.BASE_URL || "http://localhost:4849"}/${user.avatar}`
      : null;

    res.json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        nip: user.nip,
        username: user.username,
        name: user.name,
        role: user.role,
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 👤 GET CURRENT USER (BY TOKEN)
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT id, nip, username, name, role, avatar, is_active FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = rows[0];

    // ✅ Build avatar URL
    const avatarUrl = user.avatar
      ? `${process.env.BASE_URL || "http://localhost:4849"}/${user.avatar}`
      : null;

    res.json({
      success: true,
      data: {
        ...user,
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 👥 GET ALL USERS
 */
export const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nip, username, name, role, avatar, is_active FROM users ORDER BY created_at DESC"
    );

    const baseUrl = process.env.BASE_URL || "http://localhost:4849";
    const data = rows.map((u) => ({
      ...u,
      avatar: u.avatar ? `${baseUrl}/${u.avatar}` : null,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🔁 UPDATE USER ROLE
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin", "sekdin", "kadin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Role tidak valid" });
    }

    const [result] = await pool.query(
      "UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?",
      [role, id]
    );

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
 * 🗑️ DELETE USER
 */
export const deleteUser = async (req, res) => {
  try {
    // ✅ Ambil avatar path sebelum delete, lalu hapus file-nya
    const [rows] = await pool.query("SELECT avatar FROM users WHERE id = ?", [req.params.id]);
    if (rows.length > 0 && rows[0].avatar) {
      deleteAvatarFile(rows[0].avatar);
    }

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
 * ✏️ UPDATE USER (PROFIL)
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const [result] = await pool.query(
      "UPDATE users SET name = ?, updated_at = NOW() WHERE id = ?",
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "User tidak ditemukan" });
    }

    res.json({ success: true, message: "Profil berhasil diperbarui" });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};