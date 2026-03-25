const {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const env = require("../config/env");
const {
  buildObjectKey,
  decodeFileId,
  encodeFileId,
  getFileKind,
  normalizeSearch,
  parseDisplayNameFromKey,
  sanitizeDisplayName,
} = require("../utils/file-utils");

const s3 = new S3Client({ region: env.storage.region });

const prefix = `${env.storage.prefix}/`;

const toFileSummary = (object) => {
  const displayName = parseDisplayNameFromKey(object.Key);

  return {
    id: encodeFileId(object.Key),
    displayName,
    size: object.Size || 0,
    uploadedAt: object.LastModified || null,
    kind: getFileKind(displayName),
  };
};

const listFiles = async (search) => {
  const response = await s3.send(
    new ListObjectsV2Command({
      Bucket: env.storage.bucketName,
      Prefix: prefix,
      MaxKeys: env.storage.maxListCount,
    })
  );

  const searchNeedle = normalizeSearch(search);

  const files = (response.Contents || [])
    .filter((object) => object.Key && !object.Key.endsWith("/"))
    .map(toFileSummary)
    .filter((file) => !searchNeedle || normalizeSearch(file.displayName).includes(searchNeedle))
    .sort((left, right) => {
      const leftTime = left.uploadedAt ? new Date(left.uploadedAt).getTime() : 0;
      const rightTime = right.uploadedAt ? new Date(right.uploadedAt).getTime() : 0;

      return rightTime - leftTime;
    });

  return {
    files,
    hasMore: Boolean(response.IsTruncated),
  };
};

const uploadFile = async (file) => {
  const displayName = sanitizeDisplayName(file.originalname);
  const key = buildObjectKey(displayName, env.storage.prefix);

  await s3.send(
    new PutObjectCommand({
      Bucket: env.storage.bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || "application/octet-stream",
    })
  );

  return {
    id: encodeFileId(key),
    displayName,
  };
};

const getFileById = async (fileId) => {
  const key = decodeFileId(fileId);
  const displayName = parseDisplayNameFromKey(key);

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: env.storage.bucketName,
      Key: key,
    })
  );

  return {
    body: response.Body,
    contentLength: response.ContentLength,
    contentType: response.ContentType || "application/octet-stream",
    displayName,
  };
};

module.exports = {
  getFileById,
  listFiles,
  uploadFile,
};
