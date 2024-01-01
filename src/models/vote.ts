import * as mongoose from "mongoose";

interface VoteDoc extends mongoose.Document {
  value: boolean;
  voter: mongoose.Types.ObjectId;
  voteType: {
    type: string;
    enum: ["post", "comment"];
    reference: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface VoteModel extends mongoose.Model<VoteDoc> {}

const Schema = mongoose.Schema;

const voteSchema = new Schema(
  {
    vote: {
      type: Boolean,
      required: true,
    },
    voter: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    voteType: {
      type: {
        type: String,
        enum: ["post", "comment"],
        required: true,
      },
      reference: {
        type: Schema.Types.ObjectId,
        required: true,
      },
    },
  },
  { timestamps: true }
);

const Vote = mongoose.model<VoteDoc, VoteModel>("Vote", voteSchema);

export default Vote;

export { VoteDoc, VoteModel };
