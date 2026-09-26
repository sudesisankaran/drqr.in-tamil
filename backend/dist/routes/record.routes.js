"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const record_controller_1 = require("../controllers/record.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = express_1.default.Router();
router.use(auth_middleware_1.protect);
router.get("/", record_controller_1.getRecords);
router.post("/", upload_middleware_1.uploadRecord.array("attachments", 10), record_controller_1.createRecord);
exports.default = router;
