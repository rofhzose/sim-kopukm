import express from "express";
import { register, login } from "../controllers/authController.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// contoh: hanya admin bisa akses ini
router.get("/admin", verifyToken, checkRole("admin"), (req, res) => {
  res.json({ message: `Halo Admin ${req.user.username}` });
});

export default router;
