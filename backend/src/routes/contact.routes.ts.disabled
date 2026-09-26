import express from "express";
import {
  createContactMessage,
  getContactMessages,
} from "../controllers/contact.controller";
import { authorize, protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", createContactMessage);
router.get("/", protect, authorize("admin"), getContactMessages);

export default router;
