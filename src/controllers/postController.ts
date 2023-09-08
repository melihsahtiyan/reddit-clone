import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Post from "./../models/post";
import User from "./../models/user";

export const createPost = (req, res, next) => {
  // isValid(req);

  const { title, body, isNsfw } = req.body;

  const userId =
    req.userId === undefined ? "64f9a018953d4d1d90bcd14e" : req.userId;

  console.log("====================================");
  console.log("req.files ", req.files);
  console.log("====================================");

  const uploadedFiles: Array<String> = req.files.map(
    (file) => "src/sources/" + file.filename
  );

  console.log("====================================");
  console.log("uploadedFiles ", uploadedFiles);
  console.log("====================================");

  const post = new Post({
    title: title,
    body: body,
    isNsfw: isNsfw,
    creator: userId,
    sourceUrls: uploadedFiles,
    updatedAt: Date.now(),
  });

  User.findOne({ _id: userId }).then((user) => {
    if (!user) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 401;
      throw error;
    }

    user.posts.push(post._id);

    return user.save();
  });

  res.status(201).json({
    message: "Post created successfully!",
    post: post,
    creator: { _id: userId },
  });
};

export const updatePost = async (req, res, next) => {};

export const deletePost = async (req, res, next) => {};

export const getPosts = async (req, res, next) => {};

export const getPost = async (req, res, next) => {};
