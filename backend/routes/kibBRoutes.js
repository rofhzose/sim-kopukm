import express from "express";
import { getAll, getById, create, update, remove, getPublicById, resetChecklist } from "../controllers/KibBController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route for QR Code scan (automatically marks as checked and returns details)
router.get("/public/:id", getPublicById);

// Admin routes
router.get("/", verifyToken, getAll);
router.get("/:id", verifyToken, getById);
router.post("/", verifyToken, create);
router.put("/:id", verifyToken, update);
router.delete("/:id", verifyToken, remove);
router.post("/reset-checklist", verifyToken, resetChecklist);

export default router;
