import express from "express";
import {
  createAppointment,
  getAppointments,
  getSlotAvailability,
  updateAppointmentStatus,
} from "../controllers/appointment.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

router.post("/", createAppointment);
router.get("/", protect, getAppointments); 
router.get("/slots", getSlotAvailability);
router.put("/:id/status", updateAppointmentStatus);

export default router;
