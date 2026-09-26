import express from "express";
import { createVisitRecord, getVisitRecords } from "../controllers/visit.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadToMemory } from "../middleware/upload.middleware";

const router = express.Router();

router.use(protect);

router.get("/", getVisitRecords);
router.post("/", createVisitRecord);

export default router;
