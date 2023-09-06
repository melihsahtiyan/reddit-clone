import { sign } from "jsonwebtoken";
import User from "../models/user";
import { validationErrorHandler } from "../util/customValidationErrorHandler";

import { compare, hash } from "bcryptjs";

export const register = async (req, res, next) => {
  validationErrorHandler(req);

  const { email, password, firstName, lastName } = req.body;

  hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        updatedAt: Date.now(),
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

export const login = async (req, res, next) => {
  validationErrorHandler(req);

  const { email, password } = req.body;

  const loadedUser = User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error: any = new Error(
          "A user with this email could not be found."
        );
        error.statusCode = 401;
        throw error;
      }
      return user;
    })
    .then((user) => {
      return compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error: any = new Error("Wrong email or password!");
        error.statusCode = 401;
        throw error;
      }
      return loadedUser;
    })
    .then((user) => {
      user.updatedAt = Date.now();
      user.save();

      sign(
        {
          email: user.email,
          userId: user._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "3h" }
      );

      res.status(200).json({
        message: "User logged in!",
        userId: user._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
