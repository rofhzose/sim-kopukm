import express from "express";
import { cleanDuplicateData } from "../controllers/dataController.js";

const router = express.Router();

// GET /api/data/bersihkan
router.get("/bersihkan", cleanDuplicateData);

export default router;
