import express from "express";
import {
  getKoperasiSummary,
  getKoperasiDuplikat,
  getKoperasiDuplikatDetails,
  getKoperasiList,
} from "../controllers/koperasiController.js";

const router = express.Router();

// summary & duplikat (sudah ada)
router.get("/koperasi-summary", getKoperasiSummary);
router.get("/koperasi-duplikat", getKoperasiDuplikat);
router.get("/koperasi-duplikat/details", getKoperasiDuplikatDetails);

// PAGINATED LIST — map ke banyak path supaya frontend yang berganti-ganti langsung cocok
router.get("/koperasi", getKoperasiList);                  // /api/koperasi  OR /koperasi
router.get("/dashboard/koperasi", getKoperasiList);        // /api/dashboard/koperasi OR /dashboard/koperasi
router.get("/dashboard/koperasi-data", getKoperasiList);   // alternate

export default router;
