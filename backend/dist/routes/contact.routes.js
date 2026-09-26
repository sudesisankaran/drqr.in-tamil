"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controllers/contact.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/", contact_controller_1.createContactMessage);
router.get("/", auth_middleware_1.protect, (0, auth_middleware_1.authorize)("admin"), contact_controller_1.getContactMessages);
exports.default = router;
