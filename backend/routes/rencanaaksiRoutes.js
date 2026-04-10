import express from "express";
import { getRencanaAksi } from "../controllers/RencanaAksiController.js";

const router = express.Router();

// GET /api/rencana-aksi
router.get("/", getRencanaAksi);

export default router;