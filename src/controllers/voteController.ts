import { Request, Response, NextFunction } from "express";
import User, { UserDoc } from "../models/user";
import Vote, { VoteDoc } from "../models/vote";
import { CustomError } from "../util/error/CustomError";
import { ResponseBase } from "../types/res/ResponseBase";
import Post, { PostDoc } from "../models/post";
import Comment, { CommentDoc } from "../models/comment";

export const handleVote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const value: boolean = req.body.value;
  const voteType: string = req.body.type;
  const referenceId: string = req.body.referenceId;
  const userId: string = req.userId;

  try {
    const user: UserDoc = await User.findById(userId);

    if (!user) {
      const error: CustomError = new Error("User not found!");
      error.statusCode = 404;
      return next(error);
    }

    const vote: VoteDoc = await Vote.findOne({
      voter: userId,
      voteType: { type: voteType, reference: referenceId },
    });

    //if the user already voted
    if (vote) {
      //if the vote same as the previous one, delete it
      if (vote.value === value) {
        const response = deleteVote(vote._id, user);

        return res.status(201).json(response);
        //if the vote is different, update it
      } else {
        updateVote(vote, value, user);
      }
    }

    //if the user didn't vote before, create a new vote
    const createdVote = await new Vote({
      value: value,
      voter: userId,
      voteType: { type: voteType, reference: referenceId },
    });

    //if the vote is for a post
    if (voteType === "post") {
      const postToUpdate: PostDoc = await Post.findById(referenceId);

      if (!postToUpdate) {
        const error: CustomError = new Error("Post not found!");
        error.statusCode = 404;
        return next(error);
      }

      //if the vote is upvote, increase the total votes by 1

      if (value) {
        postToUpdate.vote.totalVotes += 1;
        //if the vote is downvote, decrease the total votes by 1
      } else {
        postToUpdate.vote.totalVotes -= 1;
      }

      postToUpdate.vote.votes.push(createdVote._id);
      await postToUpdate.save();
    } else if (voteType === "comment") {
      const commentToUpdate: CommentDoc = await Comment.findById(referenceId);

      if (!commentToUpdate) {
        const error: CustomError = new Error("Comment not found!");
        error.statusCode = 404;
        return next(error);
      }

      //if the vote is upvote, increase the total votes by 1
      if (value) {
        commentToUpdate.vote.totalVotes += 1;
        //if the vote is downvote, decrease the total votes by 1
      } else {
        commentToUpdate.vote.totalVotes -= 1;
      }

      commentToUpdate.vote.votes.push(createdVote._id);
      await commentToUpdate.save();
    }

    const savedVote = await createdVote.save();

    user.votes.push(savedVote._id);
    await user.save();

    const response: ResponseBase = {
      status: 201,
      message: "Vote created successfully!",
      data: {
        vote: savedVote,
        creator: {
          _id: userId,
          name: user.firstName + " " + user.lastName,
        },
      },
    };

    return res.status(response.status).json(response);
  } catch (err) {
    const error: CustomError = new Error(
      "Creating vote failed: " + err.message
    );
    error.statusCode = 500;
    return next(error);
  }
};

const deleteVote = async (voteId: string, user: UserDoc) => {
  try {
    const vote: VoteDoc = await Vote.findById(voteId);

    if (!vote) {
      const error: CustomError = new Error("Vote not found!");
      error.statusCode = 404;
      throw error;
    }

    if (vote.voter !== user._id) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    const voteType = vote.voteType.type;

    if (voteType === "post") {
      const post: PostDoc = await Post.findById(vote.voteType.reference);

      if (!post) {
        const error: CustomError = new Error("Post not found!");
        error.statusCode = 404;
        throw error;
      }

      //if the vote is upvote, decrease the total votes by 1
      if (vote.value) {
        post.vote.totalVotes -= 1;
        //if the vote is downvote, increase the total votes by 1
      } else {
        post.vote.totalVotes += 1;
      }

      post.vote.votes = post.vote.votes.filter(
        (v) => v.toString() !== vote._id.toString()
      );

      await post.save();
    }

    if (voteType === "comment") {
      const comment: CommentDoc = await Comment.findById(
        vote.voteType.reference
      );

      if (!comment) {
        const error: CustomError = new Error("Comment not found!");
        error.statusCode = 404;
        throw error;
      }

      //if the vote is upvote, decrease the total votes by 1
      if (vote.value) {
        comment.vote.totalVotes -= 1;
        //if the vote is downvote, increase the total votes by 1
      } else {
        comment.vote.totalVotes += 1;
      }

      comment.vote.votes = comment.vote.votes.filter(
        (v) => v.toString() !== vote._id.toString()
      );

      await comment.save();
    }

    user.votes = user.votes.filter((v) => v.toString() !== vote._id.toString());

    await user.save();

    await Vote.findByIdAndDelete(voteId);

    const response: ResponseBase = {
      status: 200,
      message: "Vote deleted successfully!",
      data: null,
    };

    return response;
  } catch (err) {
    const response: ResponseBase = {
      status: err.statusCode || 500,
      message: err.message,
      data: null,
    };

    throw response;
  }
};

const updateVote = async (vote: VoteDoc, value: boolean, user: UserDoc) => {
  try {
    if (vote.voter !== user._id) {
      const error: CustomError = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    vote.value = value;
    const voteType = vote.voteType.type;

    if (voteType === "post") {
      const post: PostDoc = await Post.findById(vote.voteType.reference);

      if (!post) {
        const error: CustomError = new Error("Post not found!");
        error.statusCode = 404;
        throw error;
      }

      //if the vote is upvote, increase the total votes by 1
      if (value) {
        post.vote.totalVotes += 1;
        //if the vote is downvote, decrease the total votes by 1
      } else {
        post.vote.totalVotes -= 1;
      }

      await post.save();
    } else if (voteType === "comment") {
      const comment = await Comment.findById(vote.voteType.reference);

      if (!comment) {
        const error: CustomError = new Error("Comment not found!");
        error.statusCode = 404;
        throw error;
      }

      //if the vote is upvote, increase the total votes by 1
      if (value) {
        comment.vote.totalVotes += 1;
        //if the vote is downvote, decrease the total votes by 1
      } else {
        comment.vote.totalVotes -= 1;
      }

      await comment.save();
    }

    //update the vote in the user's votes array
    user.votes[user.votes.indexOf(vote._id)].vote = value;

    const savedVote = await vote.save();

    const response: ResponseBase = {
      status: 200,
      message: "Vote updated successfully!",
      data: {
        vote: savedVote,
        creator: {
          _id: user._id,
          name: user.firstName + " " + user.lastName,
        },
      },
    };

    return response;
  } catch (err) {
    const response: ResponseBase = {
      status: err.statusCode || 500,
      message: err.message,
      data: null,
    };
    throw response;
  }
};
