import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Post from "./../models/post";
import User from "../models/user";

export const createPost = (req, res, next) => {
  isValid(req);

  const { title, body, isNsfw } = req.body;

  const userId =
    req.userId === undefined ? "64f9a018953d4d1d90bcd14e" : req.userId;

  const user = User.findOne({ _id: userId })
    .then((user) => {
      return user;
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

  if (!user) {
    const error: CustomError = new Error("User not found!");
    error.statusCode = 404;
    throw error;
  }

  const post = new Post({
    title,
    body,
    sourceUrls: req.file === undefined ? [] : [req.file.path],
    creator: req.userId,
    isNsfw: isNsfw === undefined ? false : isNsfw,
  });

  const createdPost = post
    .save()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      return next(err);
    });

  res.status(201).json({
    message: "Post created successfully!",
    post: createdPost,
  });
};

export const updatePost = async (req, res, next) => {};

export const deletePost = async (req, res, next) => {};

export const getPosts = async (req, res, next) => {};

export const getPost = async (req, res, next) => {};
