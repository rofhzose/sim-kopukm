import express from "express";
import {
  getUMKMSummary,
  getUMKMList,
  getBantuanSummary,
  getBantuanList,
  getBantuanProfil,
  getBantuanTidakTerdaftar,
  getAnalisisTahunan,

} from "../controllers/dashboardController.js";

import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔒 Semua endpoint butuh token & super_admin
router.get("/umkm-summary", verifyToken, isSuperAdmin, getUMKMSummary);
router.get("/umkm-list", verifyToken, isSuperAdmin, getUMKMList);
router.get("/bantuan-summary", verifyToken, isSuperAdmin, getBantuanSummary);
router.get("/bantuan-list", verifyToken, isSuperAdmin, getBantuanList);
router.get("/bantuan-profil", verifyToken, isSuperAdmin, getBantuanProfil);
router.get("/bantuan-tidak-terdaftar", verifyToken, isSuperAdmin, getBantuanTidakTerdaftar);
router.get("/analisis-tahunan", verifyToken, isSuperAdmin, getAnalisisTahunan);

export default router;
