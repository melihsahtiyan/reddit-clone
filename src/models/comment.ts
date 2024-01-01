import * as mongoose from "mongoose";
import { UserDoc } from "./user";
import { PostDoc } from "./post";
import { VoteDoc } from "./vote";

const Schema = mongoose.Schema;

interface CommentDoc extends mongoose.Document {
  body: string;
  creator: UserDoc;
  post: PostDoc;
  vote: {
    votes: Array<VoteDoc>;
    totalVotes: number;
  };
  createdAt: Date;
  updatedAt: Date;
  replies: Array<CommentDoc>;
  isReply: boolean;
}

interface CommentModel extends mongoose.Model<CommentDoc> {}

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
      votes: [
        {
          type: Schema.Types.ObjectId,
          ref: "Vote",
        },
      ],
      totalVotes: {
        type: Number,
        default: 0,
      },
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
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;

export { CommentDoc, CommentModel };
