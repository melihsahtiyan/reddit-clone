import express from "express";
import bodyParser from "body-parser";
import * as dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen({ port: 3000 });
