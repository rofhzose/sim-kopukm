import express from "express";
import { getPohonKinerja } from "../controllers/PohonKinerjaController.js";

const router = express.Router();
router.get("/", getPohonKinerja);

export default router;