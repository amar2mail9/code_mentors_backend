import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const DOMAIN = process.env.DOMAIN || "https://yourdomain.com";

const TutorialSchema = new Schema(
  {
    // ===== BASIC CONTENT =====
    title: { type: String, required: true, trim: true, index: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      maxlength: 160,
      default: function () {
        return `${this.title} – step by step tutorial.`;
      },
    },
    content: { type: String, required: true },

    // ===== RELATION =====
    topic: {
      _id: { type: Types.ObjectId, ref: "Topic", required: true },
      name: String,
      slug: String,
    },
    technology: {
      _id: { type: Types.ObjectId, ref: "Technology", required: true },
      name: String,
      slug: String,
    },

    // ===== SEO =====
    seo: {
      metaTitle: {
        type: String,
        maxlength: 60,
        default: function () {
          return `${this.title} | Complete Guide`;
        },
      },
      metaDescription: {
        type: String,
        maxlength: 160,
        default: function () {
          return this.excerpt;
        },
      },
      keywords: {
        type: [String], // Array of Strings
        default: function () {
          return [this.title, "tutorial", "guide"];
        },
      },
      canonicalUrl: {
        type: String,
        default: function () {
          return `${DOMAIN}/tutorial/${this.slug}`;
        },
      },
    },

    // ===== MEDIA =====
    featuredImage: {
      url: { type: String, default: `${DOMAIN}/assets/default-tutorial.png` },
      alt: {
        type: String,
        default: function () {
          return this.title;
        },
      },
    },
    ogImage: { type: String, default: `${DOMAIN}/assets/default-og.png` },

    // ===== METRICS =====
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 5 },
    isPublished: { type: Boolean, default: true },

    // ===== AUTHOR =====
    createdBy: {
      id: { type: Types.ObjectId, ref: "User", required: true },
      author: {
        name: String,
        email: String,
        username: String,
        icon: String,
      },
    },
  },
  { timestamps: true },
);

export const TutorialModel = mongoose.model("Tutorial", TutorialSchema);
