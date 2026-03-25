const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const toPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

const env = {
  appName: "MalaiDeu",
  port: toPositiveInteger(process.env.PORT, 3000),
  storage: {
    region: process.env.AWS_REGION,
    bucketName: process.env.S3_BUCKET_NAME,
    prefix: process.env.S3_PREFIX || "drops",
    maxListCount: toPositiveInteger(process.env.MAX_LIST_COUNT, 200),
  },
  upload: {
    maxFileSizeBytes: toPositiveInteger(process.env.MAX_FILE_SIZE_MB, 20) * 1024 * 1024,
  },
};

if (!env.storage.region || !env.storage.bucketName) {
  throw new Error("Missing required environment variables: AWS_REGION or S3_BUCKET_NAME");
}

module.exports = env;
