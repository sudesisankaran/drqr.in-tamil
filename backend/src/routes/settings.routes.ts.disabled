import express from "express";
import {
  changePassword,
  updateNotifications,
  deleteAccount,
} from "../controllers/settings.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.put("/change-password", protect, changePassword);
router.put("/notifications", protect, updateNotifications);
router.delete("/delete-account", protect, deleteAccount);

export default router;