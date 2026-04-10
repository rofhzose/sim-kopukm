import express from "express";
import { registerUser, loginUser, getAllUsers, updateUserRole, deleteUser, updateUser, getCurrentUser } from "../controllers/authController.js";

import { verifyToken, isAdmin, isSuperAdmin } from "../middleware/authMiddleware.js";

import { handleAvatarUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/**
 * 🔐 Auth Routes (Public)
 */
router.post("/register", handleAvatarUpload, registerUser); // ✅ multer handle multipart/form-data
router.post("/login", loginUser);

/**
 * 👥 User Management (Protected)
 */
router.get("/me", verifyToken, getCurrentUser);
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/users/:id/role", verifyToken, isSuperAdmin, updateUserRole);
router.put("/users/:id", verifyToken, updateUser);
router.delete("/users/:id", verifyToken, isSuperAdmin, deleteUser);
// di routes/userProfile.js atau authRoutes.js
router.get("/check-username", verifyToken, async (req, res) => {
  const { username } = req.query;
  if (!username?.trim()) return res.json({ available: false });
  const [rows] = await pool.query("SELECT id FROM users WHERE username = ? AND id != ?", [username.trim(), req.user.id]);
  res.json({ available: rows.length === 0 });
});

/**
 * 🧑‍💼 Role-based access demo
 */
router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ success: true, message: `Halo Admin ${req.user.username}` });
});

export default router;
