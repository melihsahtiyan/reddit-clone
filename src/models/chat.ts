import * as mongoose from "mongoose";

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  messages: [
    {
      type: {
        content: String,
        sender: Schema.Types.ObjectId,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: Date,
});

export default mongoose.model("Chat", chatSchema);
