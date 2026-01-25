import mongoose, { Schema, Types, model } from "mongoose";

const TopicSchema = new Schema(
  {
    // ===== BASIC INFO =====
    name: {
      type: String,
      required: [true, "Topic name is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    technology: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Technology",
      required: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: function () {
        return `${this.name} complete tutorials, guides, and examples.`;
      },
    },

    // ===== SEO SECTION =====
    seo: {
      title: {
        type: String,
        default: function () {
          return `${this.name} Tutorials & Guides`;
        },
        maxlength: 60, // Google best practice
      },

      metaDescription: {
        type: String,
        default: function () {
          return `Learn ${this.name} with step-by-step tutorials, examples, and best practices.`;
        },
        maxlength: 160,
      },

      keywords: {
        type: [String],
        default: function () {
          return [
            this.name,
            `${this.name} tutorial`,
            `${this.name} examples`,
            `${this.name} guide`,
          ];
        },
      },

      canonicalUrl: {
        type: String,
        default: function () {
          return `https://yourdomain.com/topic/${this.slug}`;
        },
      },
    },

    // ===== RELATION =====
    tutorials: [
      {
        type: Types.ObjectId,
        ref: "Tutorial",
      },
    ],

    // ===== ICON / IMAGE =====
    icon: {
      alt: {
        type: String,
        default: function () {
          return `${this.name} icon`;
        },
      },
      url: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/11468/11468994.png",
      },
    },

    ogImage: {
      type: String,
      default: "https://yourdomain.com/assets/default-og-image.png",
    },

    // ===== STATUS =====
    isActive: {
      type: Boolean,
      default: true,
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
  },
);

export const TopicModel = model("Topic", TopicSchema);
