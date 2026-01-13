import { Schema, model } from "mongoose";

const categorySchema = new Schema(
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
      url: {
        type: String,
        required: true,
      },
      altText: {
        type: String,
        default: function () {
          return `${this.name} icon`;
        },
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      user: {
        name: { type: String },
        email: { type: String },
        username: { type: String },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

categorySchema.index({ slug: 1, isPublished: 1 });

export const CategoryModel = model("Category", categorySchema);
