import * as mongoose from "mongoose";

interface UserDoc extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: boolean;
  createdAt: Date;
  profilePictureUrl: string;
  updatedAt: Date;
  posts: mongoose.Schema.Types.ObjectId[];
  votes: {
    vote: boolean;
    voteType: {
      type: string;
      reference: mongoose.Schema.Types.ObjectId;
    };
  }[];
}

interface UserModel extends mongoose.Model<UserDoc> {}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    profilePictureUrl: String,
    updatedAt: Date,
    // chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    votes: [
      {
        vote: {
          type: Boolean,
          required: true,
        },
        voteType: {
          type: {
            type: String,
            enum: ["post", "comment"],
            required: true,
          },
          reference: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
        },
      },
    ],
    // tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export default User;

export { UserDoc, UserModel };
