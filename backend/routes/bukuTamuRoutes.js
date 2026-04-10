import express from "express";
import { getBukuTamu, getBukuTamuStats, getKegiatanList, addBukuTamu, deleteBukuTamu } from "../controllers/bukuTamuController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET ALL GUESTS
router.get("/", verifyToken, getBukuTamu);

// GET STATS
router.get("/stats", verifyToken, getBukuTamuStats);

// GET KEGIATAN LIST
router.get("/kegiatan-list", verifyToken, getKegiatanList);

// POST NEW GUEST (bisa tanpa token jika untuk self-check-in QR)
router.post("/", addBukuTamu);

// DELETE GUEST
router.delete("/:id", verifyToken, deleteBukuTamu);

export default router;
