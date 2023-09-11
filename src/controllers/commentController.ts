import { Request, Response, NextFunction } from "express";
import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Comment from "../models/comment";
import Post from "../models/post";
import User from "../models/user";

export const createPostComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  isValid(req, next);
  const postId = req.params.postId;
  const userId = req.userId || "64f9a018953d4d1d90bcd14e";

  const body = req.body.body;

  try {
    const postToComment = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!postToComment) {
      const error: CustomError = new Error("Post not found!");
      error.statusCode = 404;
      return next(error);
    }

    if (!user) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    const createdComment = await new Comment({
      body: body,
      creator: userId,
      post: postId,
    });

    const updatedPost = await Post.findByIdAndUpdate(postId, {
      $push: { comments: createdComment._id },
    });

    const savedComment = await createdComment.save();

    return res.status(201).json({
      message: "Comment created successfully!",
      comment: savedComment,
      creator: {
        _id: userId,
        name: user.firstName + " " + user.lastName,
      },
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Creating comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const voteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const userId = req.userId;

  const vote = req.body.vote;

  try {
    const commentToVote = await Comment.findById(commentId);
    const userForVote = await User.findById(userId);

    if (vote > 1 || vote < -1) {
      const error: CustomError = new Error("Vote must be between -1 and 1!");
      error.statusCode = 422;
      return next(error);
    }

    if (!commentToVote) {
      const error: CustomError = new Error("Comment not found!");
      error.statusCode = 404;
      return next(error);
    }

    if (!userForVote) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 501;
      return next(error);
    }

    const voteIndex = commentToVote.votes.findIndex(
      (vote) => vote.voter.toString() === userId.toString()
    );

    if (vote === 0 && voteIndex >= 0) {
      commentToVote.totalVotes -= commentToVote.votes[voteIndex].point;
      commentToVote.votes.splice(voteIndex, 1);
      await commentToVote.save();
      return res.status(200).json({
        message: "Comment voted successfully!",
        comment: commentToVote,
      });
    }

    if (voteIndex >= 0) {
      commentToVote.totalVotes -= commentToVote.votes[voteIndex].point;
      commentToVote.votes[voteIndex].point = vote;
      commentToVote.totalVotes += vote;
      await commentToVote.save();
    } else {
      commentToVote.votes.push({ point: vote, voter: userForVote._id });
      commentToVote.totalVotes += vote;
      await commentToVote.save();
    }

    return res.status(200).json({
      message: "Comment voted successfully!",
      comment: commentToVote,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Voting comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const replyComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await Comment.find();

    if (!comments) {
      res.status(404).json({
        message: "No comments found!",
      });
    }

    return res.status(200).json({
      message: "Comments fetched successfully!",
      comments: comments,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Fetching comments failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getCommentsByPostId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  try {
    const comments = await Comment.find({ post: postId });

    if (!comments) {
      res.status(200).json({
        message: "No comments found!",
      });
    }

    return res.status(200).json({
      message: "Comments fetched successfully!",
      comments: comments,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Fetching comments failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};
