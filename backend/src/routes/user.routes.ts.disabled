import express from "express";
import {
  getAccessibleProfile,
  getDoctors,
  getMe,
  getPatients,
  updateMyMedicalRecord,
  updateProfileImage,
  updateProfile,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";
import { uploadProfileImage } from "../middleware/upload.middleware";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.put("/profile-image", protect, uploadProfileImage.single("profileImage"), updateProfileImage);
router.put("/medical-record", protect, updateMyMedicalRecord);
router.get("/me", protect, getMe);
router.get("/doctors", protect, getDoctors);
router.get("/patients", protect, getPatients);
router.get("/profiles/:id", protect, getAccessibleProfile);

export default router;
