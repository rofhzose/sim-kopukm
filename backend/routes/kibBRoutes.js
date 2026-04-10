import express from "express";
import * as KibBController from "../controllers/KibBController.js";

const router = express.Router();

router.get("/", KibBController.getAll);
router.get("/:id", KibBController.getById);
router.post("/", KibBController.create);
router.put("/:id", KibBController.update);
router.delete("/:id", KibBController.remove);

export default router;
