import mongoose from "mongoose";
const { Schema, Types } = mongoose;

const TutorialSchema = new Schema(
  {
    // ===== BASIC CONTENT =====
    title: {
      type: String,
      required: [true, "Tutorial title is required"],
      trim: true,
      index: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    excerpt: {
      type: String,
      maxlength: 160,
      default: function () {
        return `${this.title} – step by step tutorial with examples.`;
      },
    },

    content: {
      type: String,
      required: [true, "Tutorial content is required"],
    },

    // ===== RELATION =====
    topic: {
      type: Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    technology: {
      type: Types.ObjectId,
      ref: "Technology",
      required: true,
    },

    // ===== SEO =====
    seo: {
      title: {
        type: String,
        default: function () {
          return `${this.title} | Complete Guide`;
        },
        maxlength: 60,
      },

      metaDescription: {
        type: String,
        default: function () {
          return this.excerpt;
        },
        maxlength: 160,
      },

      keywords: {
        type: [String],
        default: function () {
          return [this.title, "tutorial", "guide", "examples", "step by step"];
        },
      },

      canonicalUrl: {
        type: String,
        default: function () {
          return `https://yourdomain.com/tutorial/${this.slug}`;
        },
      },
    },

    // ===== MEDIA =====
    featuredImage: {
      url: {
        type: String,
        default: "https://yourdomain.com/assets/default-tutorial.png",
      },
      alt: {
        type: String,
        default: function () {
          return this.title;
        },
      },
    },

    ogImage: {
      type: String,
      default: "https://yourdomain.com/assets/default-og.png",
    },

    // ===== STATUS & METRICS =====
    views: {
      type: Number,
      default: 0,
    },

    readingTime: {
      type: Number, // minutes
      default: 5,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },

    publishedAt: {
      type: Date,
      default: Date.now,
    },
    // author
    createdBy: {
      id: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
      author: {
        name: {
          type: String,
        },
        email: {
          type: String,
        },
        username: {
          type: String,
        },
        icon: {
          type: String,
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const TutorialModel = mongoose.model("Tutorial", TutorialSchema);
