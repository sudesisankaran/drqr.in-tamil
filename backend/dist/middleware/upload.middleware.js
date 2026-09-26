"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToMemory = exports.uploadProfileImage = exports.uploadRecord = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const uploadsRoot = path_1.default.join(process.cwd(), "uploads");
const recordsDir = path_1.default.join(uploadsRoot, "records");
const avatarsDir = path_1.default.join(uploadsRoot, "avatars");
for (const dir of [uploadsRoot, recordsDir, avatarsDir]) {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
}
const createStorage = (destinationDir, fallbackName) => multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .slice(0, 50);
        cb(null, `${Date.now()}-${baseName || fallbackName}${ext}`);
    },
});
exports.uploadRecord = (0, multer_1.default)({
    storage: createStorage(recordsDir, "record"),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
});
exports.uploadProfileImage = (0, multer_1.default)({
    storage: createStorage(avatarsDir, "avatar"),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});
exports.uploadToMemory = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
