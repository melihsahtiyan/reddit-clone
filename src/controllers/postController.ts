import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Post from "./../models/post";
import User from "./../models/user";

export const createPost = (req, res, next) => {
  isValid(req);

  const { title, body, isNsfw } = req.body;

  const post = new Post({
    title,
    body,
    isNsfw,
    creator: req.userId,
    updatedAt: Date.now(),
  });
};

export const updatePost = async (req, res, next) => {};

export const deletePost = async (req, res, next) => {};

export const getPosts = async (req, res, next) => {};

export const getPost = async (req, res, next) => {};
