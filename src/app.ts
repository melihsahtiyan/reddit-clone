import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes";
import mongoose from "mongoose";
import path from "path";
import { handleError } from "./middleware/errorHandlingMiddleware";
import { fileUpload } from "./util/fileUtil";

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(fileUpload);
app.use("/media", express.static(path.join(__dirname, "/media")));

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
