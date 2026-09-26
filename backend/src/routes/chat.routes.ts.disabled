import express from "express";
import {
  getChatContacts,
  getConversation,
  sendMessage,
} from "../controllers/chat.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.use(protect);

router.get("/contacts", getChatContacts);
router.get("/:userId", getConversation);
router.post("/", sendMessage);

export default router;
