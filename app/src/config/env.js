const path = require("path");
const dotenv = require("dotenv");

// Load .env from app/src/.env if available
dotenv.config({ path: path.join(__dirname, "..", ".env"), silent: true });

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const toPort = (value, fallback = 3000) => {
  const port = toPositiveInteger(value, fallback);
  if (port > 65535) {
    return fallback;
  }
  return port;
};

const normalizeOptionalString = (value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || "";
};

const toNonNegativeInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }

  return parsed;
};

const toUploadLimitBytes = (value) => {
  const megabytes = toNonNegativeInteger(value, 0);

  if (!megabytes) {
    return 0;
  }

  return megabytes * 1024 * 1024;
};

const storageBucketName = normalizeOptionalString(process.env.S3_BUCKET_NAME);
const storageEnabled = Boolean(storageBucketName);
const storageMode = storageEnabled ? "live" : "local";
const storagePreviewMessage =
  "Storage is not connected. Files and folders appear automatically wherever S3 access is available.";

const env = Object.freeze({
  appName: "MalaiDeu",
  assetVersion: String(Date.now()),
  port: toPort(process.env.PORT),
  server: Object.freeze({
    requestTimeoutMs: toNonNegativeInteger(process.env.UPLOAD_REQUEST_TIMEOUT_MS, 30 * 60 * 1000),
    keepAliveTimeoutMs: toNonNegativeInteger(process.env.KEEP_ALIVE_TIMEOUT_MS, 5 * 1000),
  }),
  upload: Object.freeze({
    maxFileSizeBytes: toUploadLimitBytes(process.env.UPLOAD_MAX_FILE_SIZE_MB),
  }),
  storage: Object.freeze({
    mode: storageMode,
    enabled: storageEnabled,
    previewMessage: storagePreviewMessage,
    region: normalizeOptionalString(process.env.AWS_REGION) || "us-east-1",
    bucketName: storageBucketName,
  }),
});

module.exports = env;
