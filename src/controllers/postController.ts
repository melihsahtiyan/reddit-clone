import { Response, NextFunction } from "express";
import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Post from "./../models/post";
import User from "./../models/user";
import { clearImage } from "../util/fileUtil";
import Request from "../types/Request";
import user from "./../models/user";

export const createPost = async (req, res, next) => {
  isValid(req, next);

  const title = req.body.title;
  const body = req.body.body;
  const isNsfw = req.body.isNsfw;
  const userId = req.userId;

  if (req.files.values.length > 10) {
    const error: CustomError = new Error("Too many files!");
    error.statusCode = 422;
    return next(error);
  }

  const uploadedFiles: Array<String> = req.files.map((file) => {
    const extension = file.mimetype.split("/")[1];
    if (extension === "mp4" || extension === "mov" || extension === "avi") {
      return "media/videos/" + file.filename;
    } else {
      return "media/images/" + file.filename;
    }
  });

  const post = await new Post({
    title: title,
    body: body,
    isNsfw: isNsfw,
    creator: req.userId,
    sourceUrls: uploadedFiles,
    updatedAt: Date.now(),
  });

  try {
    await post.save();
    const user = await User.findOne({ _id: userId });

    if (!user) {
      const error: CustomError = new Error("Could not find user.");
      error.statusCode = 404;
      return next(error);
    }

    const userToUpdate = await User.findOne({
      _id: userId,
    });
    const creator = userToUpdate;
    userToUpdate.posts.push(post._id);

    const savedUser = await userToUpdate.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: {
        _id: userId,
        name: creator.firstName + " " + creator.lastName,
      },
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Creating post failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const userId = req.userId;

  isValid(req, next);

  const title = req.body.title;
  const body = req.body.body;
  const isNsfw = req.body.isNsfw;

  try {
    const postToUpdate = await Post.findOne({ _id: postId });
    const user = await User.findOne({ _id: userId });

    checkIfPostAndUserConfirms(postToUpdate, user, next);

    if (postToUpdate.creator._id.toString() !== user._id.toString()) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      return next(error);
    }

    if (postToUpdate.title === title && postToUpdate.body === body) {
      const error: CustomError = new Error("Nothing to update!");
      error.statusCode = 403;
      return next(error);
    }

    postToUpdate.title = title;
    postToUpdate.body = body;
    postToUpdate.isNsfw = isNsfw || postToUpdate.isNsfw;
    postToUpdate.updatedAt = new Date(Date.now());

    const updatedPost = await postToUpdate.save();

    return res
      .status(200)
      .json({ message: "Post updated!", post: updatedPost });
  } catch (err) {
    const error: CustomError = new Error(
      "Updating post failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const userId = req.userId;

  try {
    const postToDelete = await Post.findOne({ _id: postId });
    const user = await User.findById(userId);

    checkIfPostAndUserConfirms(postToDelete, user, next);

    if (postToDelete.creator._id.toString() !== user._id.toString()) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      return next(error);
    }

    const sourceUrls = postToDelete.sourceUrls;

    const deletedPost = await Post.findOneAndRemove({ _id: postId });

    await User.updateOne(
      { _id: deletedPost.creator },
      { $pull: { posts: postId } }
    );

    if (sourceUrls.length > 0) {
      sourceUrls.forEach((url) => {
        clearImage("../" + url);
      });
    }

    res.status(200).json({
      message: "Deleted post.",
      post: deletedPost,
      userPosts: user.posts,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Deleting post failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentPage = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 4;

    const totalItems = await Post.countDocuments();

    const posts = await Post.find()
      .populate({ path: "creator", select: "firstName lastName" })
      .populate({
        path: "comments",
        select: "body",
        populate: { path: "creator", select: "firstName lastName" },
      })
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Fetching posts failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findOne({ _id: postId })
      .populate("creator")
      .populate("comments");

    if (!post) {
      const error: CustomError = new Error("Could not find post.");
      error.statusCode = 404;
      return next(error);
    }

    return res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    const error: CustomError = new Error(
      "Fetching post failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const votePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const userId = req.userId;

  // "64f9a018953d4d1d90bcd14e";

  const vote = req.body.vote;

  try {
    const postToVote = await Post.findById(postId);
    const votedUser = await User.findById(userId);

    checkIfPostAndUserConfirms(postToVote, votedUser, next);

    if (vote < -1 || vote > 1) {
      const error: CustomError = new Error("Vote must be between -1 and 1.");
      error.statusCode = 422;
      return next(error);
    }

    const userVoted = postToVote.votes.find(
      (vote) => vote.voter.toString() === votedUser._id.toString()
    );

    if (userVoted) {
      postToVote.totalVotes -= userVoted.point;
      userVoted.point = vote;
      postToVote.totalVotes += userVoted.point;
    } else {
      postToVote.votes.push({ point: vote, voter: votedUser._id });
      postToVote.totalVotes += vote;
    }

    if (vote === 0) {
      postToVote.votes.filter((vote) => {
        console.log("====================================");
        console.log("if (vote === 0)", vote.voter);
        console.log("====================================");
        vote.voter.toString() !== votedUser._id.toString();
      });

      return res.status(200).json({
        message: "Post unvoted!",
        post: { title: postToVote.title, votes: postToVote.votes },
      });
    }

    const updatedPost = await postToVote.save();

    return res.status(200).json({
      message: "Post voted!",
      post: { title: updatedPost.title, votes: updatedPost.votes },
    });
  } catch (err) {
    const error: CustomError = new Error("Voting post failed: " + err.message);
    error.statusCode = 500;
    return next(error);
  }
};

const checkIfPostAndUserConfirms = (post, user, next: NextFunction) => {
  if (!user) {
    const error: CustomError = new Error("Could not find user.");
    error.statusCode = 404;
    return next(error);
  }

  if (!post) {
    const error: CustomError = new Error("Could not find post.");
    error.statusCode = 404;
    return next(error);
  }
};
