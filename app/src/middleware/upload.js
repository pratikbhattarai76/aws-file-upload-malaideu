const crypto = require("crypto");
const fs = require("fs");
const multer = require("multer");
const os = require("os");
const path = require("path");

const env = require("../config/env");

const uploadTempDir = path.join(os.tmpdir(), "malaideu-uploads");

fs.mkdirSync(uploadTempDir, { recursive: true });

const uploadConfig = {
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadTempDir);
    },
    filename: (req, file, cb) => {
      const safeExtension = path.extname(file.originalname || "").slice(0, 20);
      cb(null, `${Date.now()}-${crypto.randomUUID()}${safeExtension}`);
    },
  }),
  limits: {
    files: Infinity,
    ...(env.upload.maxFileSizeBytes > 0 ? { fileSize: env.upload.maxFileSizeBytes } : {}),
  },
};

module.exports = multer(uploadConfig);
