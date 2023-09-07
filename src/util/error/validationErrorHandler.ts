import { validationResult } from "express-validator";
import { CustomError } from "./CustomError";

export const isValid = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // 422 is validation error
    const error: CustomError = {
      name: "Validation Error",
      message: errors.array()[0].msg,
      data: errors.array(),
      statusCode: 422,
    };
    throw error;
  }
};
