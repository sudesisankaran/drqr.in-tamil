import express from "express";
import {
  ensureMyEmergencyQr,
  getEmergencyPatient,
  getMyEmergencyQr,
} from "../controllers/emergency.controller";
import { optionalProtect, protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/me", protect, getMyEmergencyQr);
router.post("/me", protect, ensureMyEmergencyQr);
router.put("/me", protect, ensureMyEmergencyQr);
router.get("/:qrCodeId", optionalProtect, getEmergencyPatient);

export default router;
