import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const mimeTypes = {
      "image/png": ".png",
      "image/jpg": ".jpg",
      "image/jpeg": ".jpeg",
      "image/webp": ".webp",
      "image/heic": ".heic",
      "image/gif": ".gif",
      "video/mp4": ".mp4",
      "video/mov": ".mov",
      "video/avi": ".avi",
    };

    const mimeType = mimeTypes[file.mimetype];

    if (mimeType === ".mp4" || mimeType === ".mov" || mimeType === ".avi") {
      cb(null, "media/videos");
    } else {
      cb(null, "media/images");
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = uuidv4() + "-" + Math.round(Math.random() * 1e9);

    const mimeTypes = {
      "image/png": ".png",
      "image/jpg": ".jpg",
      "image/jpeg": ".jpeg",
      "image/webp": ".webp",
      "image/heic": ".heic",
      "image/gif": ".gif",
      "video/mp4": ".mp4",
      "video/mov": ".mov",
      "video/avi": ".avi",
    };

    const mimeType = mimeTypes[file.mimetype];

    cb(null, uniqueSuffix + mimeType);
  },
});

const fileFilter = (req, file, cb) => {
  const imageMimetypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/gif",
  ];

  const videoMimetypes = ["video/mp4", "video/mov", "video/avi"];

  if (
    imageMimetypes.find((mimetype) => mimetype === file.mimetype) ||
    videoMimetypes.find((mimetype) => mimetype === file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const fileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
}).array("sources", 10);

export const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
