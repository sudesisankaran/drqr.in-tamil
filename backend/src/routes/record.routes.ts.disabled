import express from "express";
import { createRecord, getRecords } from "../controllers/record.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadRecord } from "../middleware/upload.middleware";

const router = express.Router();

router.use(protect);

router.get("/", getRecords);
router.post("/", uploadRecord.array("attachments", 10), createRecord);

export default router;
