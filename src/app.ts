import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import mongoose from "mongoose";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { handleError } from "./middleware/errorHandlingMiddleware";

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "sources");
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

const app = express();

app.use(bodyParser.json());
app.use(
  multer({ storage: storage, fileFilter: fileFilter }).array("sources", 10)
);
app.use("/sources", express.static(path.join(__dirname, "/sources")));

// CORS error handling
app.use((req, res, next) => {
  // Allow access to any client
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Allow these headers
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin"
  );
  // Allow these methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  next();
});

app.use("/auth", authRoutes);
app.use(postRoutes);

app.use((error, req, res, next) => {
  handleError(error, req, res, next);
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    app.listen({ port: 3000 });
    console.log("Server running at http://localhost:3000");
  })
  .catch((err) => {
    console.log(err.message);
  });
