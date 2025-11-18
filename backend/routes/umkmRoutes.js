import express from "express";
import {
  createUMKM,
  getUMKMDetail,
  updateUMKM,
  deleteUMKM,
  getUMKMList
} from "../controllers/umkmController.js";

import { verifyToken, isSuperAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*  
   Semua route UMKM sekarang wajib:
   🔒 verifyToken  → user harus punya token
   🛡  isSuperAdmin → user harus super admin
*/

router.get("/umkm", verifyToken, isSuperAdmin, getUMKMList);

router.get("/umkm/:id", verifyToken, isSuperAdmin, getUMKMDetail);

router.post("/umkm", verifyToken, isSuperAdmin, createUMKM);

router.put("/umkm/:id", verifyToken, isSuperAdmin, updateUMKM);

router.delete("/umkm/:id", verifyToken, isSuperAdmin, deleteUMKM);

export default router;
