import { Router } from "express";
import * as authController from "../controllers/authController";
import { body } from "express-validator";
import User from "../models/user";

const router = Router();

router.put(
  "/register",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-mail address already exists!");
          }
        });
      }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password too short!"),
    body("firstName").trim().not().isEmpty().isLength({ min: 2 }),
    body("lastName").trim().not().isEmpty().isLength({ min: 2 }),
  ],
  authController.register
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (!userDoc) {
            return Promise.reject("E-mail address does not exist!");
          }
        });
      }),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.login
);

export default router;
