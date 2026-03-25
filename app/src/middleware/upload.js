const multer = require("multer");

const env = require("../config/env");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 1,
    fileSize: env.upload.maxFileSizeBytes,
  },
});
