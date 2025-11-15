import express from "express";
import {
  getKoperasiSummary,
  getKoperasiDuplikat,
  getKoperasiDuplikatDetails,
  getKoperasiList, // <- baru
} from "../controllers/koperasiController.js";

const router = express.Router();

// existing routes
router.get("/koperasi-summary", getKoperasiSummary);
router.get("/koperasi-duplikat", getKoperasiDuplikat);
router.get("/koperasi-duplikat/details", getKoperasiDuplikatDetails);

// ===== new paginated endpoints (cover several possible frontend paths) =====
// mounted under whatever prefix server.js uses (we will mount both /api and /dashboard)
router.get("/koperasi", getKoperasiList); // matches /api/koperasi  OR /koperasi if mounted root
router.get("/dashboard/koperasi", getKoperasiList); // matches /api/dashboard/koperasi if mounted under /api
router.get("/dashboard/koperasi-data", getKoperasiList); // alternate name

export default router;
