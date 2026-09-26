"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emergency_controller_1 = require("../controllers/emergency.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.get("/me", auth_middleware_1.protect, emergency_controller_1.getMyEmergencyQr);
router.post("/me", auth_middleware_1.protect, emergency_controller_1.ensureMyEmergencyQr);
router.put("/me", auth_middleware_1.protect, emergency_controller_1.ensureMyEmergencyQr);
router.get("/:qrCodeId", auth_middleware_1.optionalProtect, emergency_controller_1.getEmergencyPatient);
exports.default = router;
