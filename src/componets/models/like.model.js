import { Schema, model } from "mongoose";

const likeSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LikeModel = model("Like", likeSchema);
