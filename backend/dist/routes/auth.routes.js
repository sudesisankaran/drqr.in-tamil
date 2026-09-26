"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Memory storage for parsing files before uploading to Supabase
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
router.post("/register", upload.single("photo"), auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
exports.default = router;
