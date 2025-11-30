import express from "express";
import hirarkiController from "../controllers/hirarkiController.js";

const router = express.Router();

router.get("/", hirarkiController.index);
router.get("/:id", hirarkiController.show);
router.post("/", hirarkiController.store);
router.put("/:id", hirarkiController.update);
router.delete("/:id", hirarkiController.destroy);

export default router;
