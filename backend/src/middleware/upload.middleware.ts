import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.join(process.cwd(), "uploads");
const recordsDir = path.join(uploadsRoot, "records");
const avatarsDir = path.join(uploadsRoot, "avatars");

for (const dir of [uploadsRoot, recordsDir, avatarsDir]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const createStorage = (destinationDir: string, fallbackName: string) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname);
      const baseName = path
        .basename(file.originalname, ext)
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .slice(0, 50);

      cb(null, `${Date.now()}-${baseName || fallbackName}${ext}`);
    },
  });

export const uploadRecord = multer({
  storage: createStorage(recordsDir, "record"),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const uploadProfileImage = multer({
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

export const uploadToMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
