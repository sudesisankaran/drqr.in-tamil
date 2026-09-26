"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_controller_1 = require("../controllers/settings.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.put("/change-password", auth_middleware_1.protect, settings_controller_1.changePassword);
router.put("/notifications", auth_middleware_1.protect, settings_controller_1.updateNotifications);
router.delete("/delete-account", auth_middleware_1.protect, settings_controller_1.deleteAccount);
exports.default = router;
