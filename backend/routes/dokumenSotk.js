// backend/src/routes/dokumenSotk.js
import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { getAll, upload, update, remove } from "../controllers/dokumenSotkController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// upload folder relative ke root project: /uploads/sotk
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "sotk");

// ensure folder exists
import fs from "fs";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}_${safe}`);
  }
});
const uploadMiddleware = multer({
  storage,
  limits: {  fileSize: 25 * 1024 * 1024 }, 
});

const router = express.Router();

// routes
router.get("/", getAll);
router.post("/upload", uploadMiddleware.single("file"), upload);
router.put("/:id", express.json(), update);
router.delete("/:id", remove);

export default router;
