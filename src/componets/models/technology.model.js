import { Schema, model } from "mongoose";

const technologySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
    },
    topic: [String],
    usageCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true, // Filter out inactive docs quickly
    },
    createdBy: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      user: {
        type: Object,
        required: true,
      },
    },
  },
  {
    timestamps: true,

    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

technologySchema.index({ name: 1, isPublished: 1 });

export default model("Technology", technologySchema);
