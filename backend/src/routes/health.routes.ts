import express from "express";

import { protect } from "../middleware/auth.middleware";
import { deleteHealthRecord, getHealthRecord, upsertHealthRecord } from "../controllers/health.controller";

const router = express.Router();

router.get("/", protect, getHealthRecord);
router.put("/", protect, upsertHealthRecord);
router.delete("/", protect, deleteHealthRecord);

export default router;