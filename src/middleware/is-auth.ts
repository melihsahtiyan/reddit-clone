import * as jwt from "jsonwebtoken";
import Request from "../types/Request";
import { NextFunction, Response } from "express";
import { CustomError } from "../util/error/CustomError";

const isAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error: CustomError = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  // Get token from header
  const token = authHeader.split(" ")[1];
  let decodedToken;

  const secretKey = process.env.SECRET_KEY;
  // Verify token
  try {
    decodedToken = jwt.verify(token, secretKey);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }

  // Token is invalid
  if (!decodedToken) {
    const error: CustomError = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  // Token is valid
  req.userId = decodedToken.userId;
  next();
};

export default isAuth;
