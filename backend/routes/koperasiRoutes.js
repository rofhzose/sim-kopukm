import express from "express";
import { mergeKoperasiData } from "../controllers/koperasiGlobalController.js";

const router = express.Router();

// Endpoint merge data ke koperasi_global
router.post("/merge", mergeKoperasiData);

export default router;
