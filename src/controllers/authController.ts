import * as jwt from "jsonwebtoken";
import User from "../models/user";
import { isValid } from "../util/error/validationErrorHandler";

import * as bcrypt from "bcryptjs";
import { CustomError } from "../util/error/CustomError";

const secretKey: string | undefined = process.env.SECRET_KEY;

export const register = (req, res, next) => {
  isValid(req);

  const { email, password, firstName, lastName } = req.body;

  bcrypt
    .hash(password, 12)
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
      next(err);
    });
};

export const login = async (req, res, next) => {
  isValid(req);

  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error: CustomError = new Error("User not found!");
        error.statusCode = 401;
        throw error;
      }
      console.log("====================================");
      console.log(user);
      console.log("====================================");
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error: CustomError = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.SECRET_KEY,
        { expiresIn: "3h" }
      );

      res.status(200).json({ token: token, userId: loadedUser._id.toString(), message: "Login successful!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
