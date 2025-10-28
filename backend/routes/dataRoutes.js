import express from "express";
import { 
  cleanDuplicateData,
  getDuplikatDataUMKM,
  getUMKMYangMendapatBantuan,
  getUMKMYangTidakMendapatBantuan,
  getUMKMYangMendapatkanBantuanGanda,
  getUMKMDashboardSummary,
} from "../controllers/dataController.js";

const router = express.Router();

router.get("/bersihkan", cleanDuplicateData);
router.get("/duplikat/umkm", getDuplikatDataUMKM);
router.get("/umkm/bantuan/dapat", getUMKMYangMendapatBantuan);
router.get("/umkm/bantuan/tidak", getUMKMYangTidakMendapatBantuan);
router.get("/umkm/bantuan/ganda", getUMKMYangMendapatkanBantuanGanda);
router.get("/umkm/dashboard", getUMKMDashboardSummary);

export default router;
