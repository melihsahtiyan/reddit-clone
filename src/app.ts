import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import mongoose from "mongoose";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".png");
  },
});

const fileFilter = (req, file, cb) => {
  // Accepted mimetypes for images
  const imageMimetypes = [
    "image/png",
    "image/jpg",
    "image/jpeg",
    "image/webp",
    "image/heic",
    "image/gif",
  ];

  // Accepted mimetypes for videos
  const videoMimetypes = ["video/mp4", "video/mov", "video/avi"];

  if (
    imageMimetypes.includes(file.mimetype) ||
    videoMimetypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

app.use(bodyParser.json());
app.use(
  multer({
    storage: storage,
    fileFilter: fileFilter,
  }).single("file")
);

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
app.use("/post", postRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
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
