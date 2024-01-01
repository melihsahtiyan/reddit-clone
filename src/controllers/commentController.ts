import { Request, Response, NextFunction } from "express";
import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Comment, { CommentDoc } from "../models/comment";
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
      isReply: false,
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

export const replyComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const userId = req.userId;

  const body = req.body.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    const commentToReply = await Comment.findById(commentId);

    if (!commentToReply) {
      const error: CustomError = new Error("Comment not found!");
      error.statusCode = 404;
      return next(error);
    }

    const createdComment = await new Comment({
      body: body,
      creator: userId,
      post: commentToReply.post,
      isReply: true,
    });

    commentToReply.replies.push(createdComment._id);

    await createdComment.save();

    await commentToReply.save();

    return res.status(201).json({
      message: "Comment replied successfully!",
      comment: commentToReply,
      creator: {
        _id: userId,
        name: user.firstName + " " + user.lastName,
      },
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Replying comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const userId = req.userId;

  isValid(req, next);

  const body = req.body.body;

  try {
    const commentToUpdate = await Comment.findById(commentId);
    const user = await User.findById(userId);

    if (!commentToUpdate) {
      const error: CustomError = new Error("Comment not found!");
      error.statusCode = 404;
      return next(error);
    }

    if (!user) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    if (commentToUpdate.creator.toString() !== userId.toString()) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      return next(error);
    }

    commentToUpdate.body = body;
    commentToUpdate.updatedAt = new Date();

    const updatedComment = await commentToUpdate.save();

    return res.status(200).json({
      message: "Comment updated successfully!",
      comment: updatedComment,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Updating comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const userId = req.userId;
  const deletedByAdmin = req.body.deletedByAdmin;

  try {
    const commentToDelete = await Comment.findById(commentId);

    if (!commentToDelete) {
      const error: CustomError = new Error("Comment not found!");
      error.statusCode = 404;
      return next(error);
    }

    if (commentToDelete.creator.toString() !== userId.toString()) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      return next(error);
    }

    if (deletedByAdmin) {
      const deletedComment = await Comment.updateOne({
        _id: commentId,
        body: "[deleted]",
        updatedAt: new Date(),
      });

      return res.status(200).json({
        message: "Comment deleted successfully!",
        comment: deletedComment,
      });
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res.status(200).json({
      message: "Comment deleted successfully!",
      comment: deletedComment,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Deleting comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments: Array<CommentDoc> = await Comment.find().populate("creator");

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
) => {
  const commentId = req.params.commentId;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      res.status(404).json({
        message: "No comment found!",
      });
    }

    return res.status(200).json({
      message: "Comment fetched successfully!",
      comment: comment,
    });
  } catch (err) {
    const error: CustomError = new Error(
      "Fetching comment failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

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

