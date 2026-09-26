"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
router.put("/profile", auth_middleware_1.protect, user_controller_1.updateProfile);
router.put("/profile-image", auth_middleware_1.protect, upload_middleware_1.uploadProfileImage.single("profileImage"), user_controller_1.updateProfileImage);
router.put("/medical-record", auth_middleware_1.protect, user_controller_1.updateMyMedicalRecord);
router.get("/me", auth_middleware_1.protect, user_controller_1.getMe);
router.get("/doctors", auth_middleware_1.protect, user_controller_1.getDoctors);
router.get("/patients", auth_middleware_1.protect, user_controller_1.getPatients);
router.get("/profiles/:id", auth_middleware_1.protect, user_controller_1.getAccessibleProfile);
exports.default = router;
