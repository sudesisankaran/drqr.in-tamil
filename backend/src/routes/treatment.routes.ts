import express from "express";
import { createTreatmentRecord, getTreatmentRecords } from "../controllers/treatment.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

router.get("/", getTreatmentRecords);
router.post("/", createTreatmentRecord);

export default router;
