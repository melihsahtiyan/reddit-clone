import { validationResult } from "express-validator";
import { CustomError } from "./CustomError";
import { NextFunction, Request } from "express";

export const isValid = (req: Request, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 is validation error
    const error: CustomError = {
      name: "Validation Error",
      message: errors.array()[0].msg,
      data: errors.array(),
      statusCode: 422,
    };
    return next(error);
  }
};
