import { Request } from "express";

declare module "express" {
  interface Request {
    userId: string;
  }
}

export default Request;
