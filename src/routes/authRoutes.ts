import { Router } from "express";
import { login, register } from "../controllers/authController";
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
  (req, res, next) => {
    register(req, res, next);
  }
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
  (req, res, next) => {
    login(req, res, next);
  }
);

export default router;
