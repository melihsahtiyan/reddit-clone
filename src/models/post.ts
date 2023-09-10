import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

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
  votes: [
    {
      point: {
        type: Number,
        default: 0,
        Range: [-1, 1],
      },
      voters: { type: Schema.Types.ObjectId, ref: "User" },
    },
  ],
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
  // comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

export default mongoose.model("Post", postSchema);
