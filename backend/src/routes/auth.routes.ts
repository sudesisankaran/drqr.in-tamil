import express from "express";
import multer from "multer";
import { loginUser, registerUser } from "../controllers/auth.controller";

const router = express.Router();

// Memory storage for parsing files before uploading to Supabase
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", upload.single("photo"), registerUser);

router.post("/login", loginUser);

export default router;