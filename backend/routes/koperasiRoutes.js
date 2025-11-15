import express from "express";
import { 
  getKoperasiSummary, 
  getKoperasiDuplikat, 
  getKoperasiDuplikatDetails 
} from "../controllers/koperasiController.js";

const router = express.Router();

router.get("/koperasi-summary", getKoperasiSummary);
router.get("/koperasi-duplikat", getKoperasiDuplikat);
router.get("/koperasi-duplikat/details", getKoperasiDuplikatDetails);

export default router;
