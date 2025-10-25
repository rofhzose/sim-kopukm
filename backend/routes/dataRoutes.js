import express from "express";
import { 
    cleanDuplicateData,
    getDuplikatDataUMKM,
    getUMKMYangMendapatBantuan,
    getUMKMYangTidakMendapatBantuan,
    getUMKMYangMendapatkanBantuanGanda
 } from "../controllers/dataController.js";

const router = express.Router();

// GET /api/data/bersihkan
router.get("/bersihkan", cleanDuplicateData);
router.get("/duplikat/umkm", getDuplikatDataUMKM);
router.get("/umkm/bantuan/dapat", getUMKMYangMendapatBantuan);
router.get("/umkm/bantuan/tidak", getUMKMYangTidakMendapatBantuan);
router.get("/umkm/bantuan/ganda", getUMKMYangMendapatkanBantuanGanda);
export default router;
