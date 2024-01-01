import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

interface PostDoc extends mongoose.Document {
  title: string;
  body: string;
  sourceUrls: Array<String>;
  creator: mongoose.Types.ObjectId;
  vote?: {
    votes: Array<mongoose.Types.ObjectId>;
    totalVotes: number;
  };
  createdAt: Date;
  isNsfw: boolean;
  updatedAt?: Date;
  // tags: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
}

interface PostModel extends mongoose.Model<PostDoc> {}

const postSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  sourceUrls: {
    type: Array<String>,
    required: true,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
  isNsfw: {
    type: Boolean,
    default: false,
  },
  updatedAt: Date,
  // tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

const Post = mongoose.model("Post", postSchema);

export default Post;

export { PostDoc, PostModel };
