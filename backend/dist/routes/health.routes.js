"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const health_controller_1 = require("../controllers/health.controller");
const router = express_1.default.Router();
router.get("/", auth_middleware_1.protect, health_controller_1.getHealthRecord);
router.put("/", auth_middleware_1.protect, health_controller_1.upsertHealthRecord);
router.delete("/", auth_middleware_1.protect, health_controller_1.deleteHealthRecord);
exports.default = router;
