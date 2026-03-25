const express = require("express");
const { pipeline } = require("stream/promises");

const env = require("../config/env");
const upload = require("../middleware/upload");
const storage = require("../services/storage-service");
const { buildContentDisposition } = require("../utils/file-utils");
const { asyncHandler, getFlash, redirectWithMessage } = require("../utils/http");

const router = express.Router();

const toStorageMessage = (error, fallback) => {
  if (!error) {
    return fallback;
  }

  if (error.code === "INVALID_FILE_ID" || error.name === "NoSuchKey") {
    return "That file link is no longer valid.";
  }

  if (error.name === "CredentialsProviderError") {
    return "Storage is unavailable right now. Please check the server credentials and try again.";
  }

  if (error.name === "AccessDenied") {
    return "This server cannot access storage right now.";
  }

  if (error.name === "NoSuchBucket") {
    return "The storage location could not be found.";
  }

  return fallback;
};

router.get("/", (req, res) => {
  res.render("index", {
    pageTitle: "Simple file drop",
    flash: getFlash(req),
  });
});

router.post(
  "/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return redirectWithMessage(res, "/", "error", "Choose a file before uploading.");
    }

    try {
      const savedFile = await storage.uploadFile(req.file);
      return redirectWithMessage(res, "/files", "success", `${savedFile.displayName} is ready.`);
    } catch (error) {
      console.error("Upload error:", error);
      return redirectWithMessage(res, "/", "error", toStorageMessage(error, "We could not upload your file."));
    }
  })
);

router.get(
  "/files",
  asyncHandler(async (req, res) => {
    const search = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const flash = getFlash(req);

    try {
      const library = await storage.listFiles(search);

      return res.render("files", {
        pageTitle: "File library",
        flash,
        files: library.files,
        search,
        hasMore: library.hasMore,
        storageError: "",
      });
    } catch (error) {
      console.error("List files error:", error);

      return res.status(503).render("files", {
        pageTitle: "File library",
        flash,
        files: [],
        search,
        hasMore: false,
        storageError: toStorageMessage(error, "We could not load your files right now."),
      });
    }
  })
);

const streamFile = async (req, res, disposition) => {
  try {
    const file = await storage.getFileById(req.params.fileId);

    if (!file.body) {
      throw new Error("Storage returned an empty file stream");
    }

    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", buildContentDisposition(disposition, file.displayName));

    if (file.contentLength) {
      res.setHeader("Content-Length", String(file.contentLength));
    }

    await pipeline(file.body, res);
  } catch (error) {
    console.error(`${disposition} error:`, error);

    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    return redirectWithMessage(
      res,
      "/files",
      "error",
      toStorageMessage(
        error,
        disposition === "inline" ? "We could not open that file." : "We could not download that file."
      )
    );
  }
};

router.get(
  "/files/:fileId/open",
  asyncHandler(async (req, res) => {
    await streamFile(req, res, "inline");
  })
);

router.get(
  "/files/:fileId/download",
  asyncHandler(async (req, res) => {
    await streamFile(req, res, "attachment");
  })
);

router.get("/health", (req, res) => {
  res.json({
    app: env.appName,
    status: "ok",
  });
});

module.exports = router;
