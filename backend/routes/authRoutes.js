import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUser,
} from "../controllers/authController.js";

import { verifyToken, isAdmin, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * 🔐 Auth routes
 */
router.post("/register", registerUser);
router.post("/login", loginUser);

/**
 * 👥 User management (protected)
 */
router.get("/users", verifyToken, isAdmin, getAllUsers); // hanya admin/super_admin
router.put("/users/:id/role", verifyToken, isSuperAdmin, updateUserRole); // hanya super_admin
router.put("/users/:id", verifyToken, updateUser); // update profil
router.delete("/users/:id", verifyToken, isSuperAdmin, deleteUser); // hanya super_admin

export default router;
