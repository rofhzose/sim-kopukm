import express from "express";
import { 
  getAllData, 
  getDataById, 
  getAllDataBersih,
  getDataBersihById
} from "../controllers/umkmController.js";

const router = express.Router();

// 🧹 Route untuk data bersih (lebih spesifik → TARUH DI ATAS)
router.get("/bersih", getAllDataBersih);
router.get("/bersih/:id", getDataBersihById);

// 🗂 Route untuk data kotor
router.get("/", getAllData);
router.get("/:id", getDataById);

export default router;
