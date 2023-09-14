import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    vote: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    updatedAt: Date,
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isReply: {
      type: Boolean,
      required: true,
    },
    votes: [
      {
        point: {
          type: Number,
          default: 0,
          range: [-1, 1],
        },
        voter: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);
