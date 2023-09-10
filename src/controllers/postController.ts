import { isValid } from "../util/error/validationErrorHandler";
import { CustomError } from "../util/error/CustomError";
import Post from "./../models/post";
import User from "./../models/user";
import { clearImage } from "../util/fileUtil";

export const createPost = async (req, res, next) => {
  isValid(req);

  const title = req.body.title;
  const body = req.body.body;
  const isNsfw = req.body.isNsfw;
  const userId = req.userId || "64f9a018953d4d1d90bcd14e";

  if (req.files.length > 10) {
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
    creator: req.userId || "64f9a018953d4d1d90bcd14e",
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

export const updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId || "64f9a018953d4d1d90bcd14e";

  isValid(req);

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

export const deletePost = async (req, res, next) => {
  const postId = req.params.postId || "64fde2043eac31e8705ff24b";
  const userId = req.userId || "64f9a018953d4d1d90bcd14e";

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

export const getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    const totalItems = await Post.countDocuments();

    const posts = await Post.find()
      .populate("creator")
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

export const getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findOne({ _id: postId }).populate("creator");

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

export const votePost = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId || "64face123996b3eeb0df4245";

  // "64f9a018953d4d1d90bcd14e";

  const vote = req.body.vote;

  try {
    const postToVote = await Post.findById(postId);
    const votedUser = await User.findById(userId);

    checkIfPostAndUserConfirms(postToVote, votedUser, next);

    const userVoted = postToVote.votes.find(
      (vote) => vote.voters.toString() === votedUser._id.toString()
    );

    if (userVoted) {
      userVoted.point = vote;
    } else {
      postToVote.votes.push({ point: vote, voters: votedUser._id });
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

const checkIfPostAndUserConfirms = (post, user, next) => {
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
