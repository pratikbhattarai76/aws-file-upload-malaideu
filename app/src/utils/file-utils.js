const crypto = require("crypto");
const path = require("path");

const sanitizeDisplayName = (value) => {
  const baseName = path.basename(String(value || "").trim());
  const stripped = baseName.replace(/[\u0000-\u001F\u007F]+/g, "").replace(/\s+/g, " ").trim();

  if (!stripped) {
    return "untitled-file";
  }

  const extension = path.extname(stripped);
  const stem = extension ? stripped.slice(0, -extension.length) : stripped;
  const limitedStem = stem.slice(0, 120).trim() || "untitled-file";
  const limitedExtension = extension.slice(0, 20);

  return `${limitedStem}${limitedExtension}`;
};

const buildObjectKey = (displayName, prefix) => {
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const uniquePart = `${Date.now()}-${crypto.randomUUID()}`;
  const encodedName = encodeURIComponent(displayName);

  return [prefix, year, month, day, uniquePart, encodedName].join("/");
};

const parseDisplayNameFromKey = (key) => {
  const lastSegment = String(key || "")
    .split("/")
    .filter(Boolean)
    .pop();

  if (!lastSegment) {
    return "untitled-file";
  }

  try {
    return sanitizeDisplayName(decodeURIComponent(lastSegment));
  } catch (error) {
    return lastSegment.replace(/^\d{10,}-/, "") || "untitled-file";
  }
};

const encodeFileId = (key) => Buffer.from(String(key), "utf8").toString("base64url");

const decodeFileId = (token) => {
  if (!/^[A-Za-z0-9_-]+$/.test(String(token || ""))) {
    const error = new Error("Invalid file id");
    error.code = "INVALID_FILE_ID";
    error.statusCode = 400;
    throw error;
  }

  const key = Buffer.from(token, "base64url").toString("utf8");
  const normalizedToken = Buffer.from(key, "utf8").toString("base64url");

  if (!key || normalizedToken !== token || !key.includes("/")) {
    const error = new Error("Invalid file id");
    error.code = "INVALID_FILE_ID";
    error.statusCode = 400;
    throw error;
  }

  return key;
};

const normalizeSearch = (value) => String(value || "").trim().toLowerCase();

const formatBytes = (bytes = 0) => {
  if (!bytes) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / 1024 ** exponent;
  const decimals = amount >= 10 || exponent === 0 ? 0 : 1;

  return `${amount.toFixed(decimals)} ${units[exponent]}`;
};

const formatDate = (value) => {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
};

const buildContentDisposition = (type, fileName) => {
  const safeName = sanitizeDisplayName(fileName);
  const fallback = safeName.replace(/[^\x20-\x7E]+/g, "_").replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(safeName);

  return `${type}; filename="${fallback}"; filename*=UTF-8''${encoded}`;
};

const getFileKind = (fileName) => {
  const extension = path.extname(fileName).slice(1).toLowerCase();

  if (!extension) {
    return "FILE";
  }

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(extension)) {
    return "IMG";
  }

  if (["pdf", "doc", "docx", "txt", "md", "rtf"].includes(extension)) {
    return "DOC";
  }

  if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
    return "ZIP";
  }

  if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension)) {
    return "VID";
  }

  return extension.toUpperCase().slice(0, 4);
};

module.exports = {
  buildContentDisposition,
  buildObjectKey,
  decodeFileId,
  encodeFileId,
  formatBytes,
  formatDate,
  getFileKind,
  normalizeSearch,
  parseDisplayNameFromKey,
  sanitizeDisplayName,
};
