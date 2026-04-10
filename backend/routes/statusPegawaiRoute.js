import express from "express";
import { getAllStatus, createStatus, deleteStatus } from "../controllers/statusPegawaiController.js";

const router = express.Router();

router.get("/", getAllStatus);
router.post("/", createStatus);
router.delete("/:id", deleteStatus);

export default router;