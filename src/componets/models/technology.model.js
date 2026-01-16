import mongoose, { Schema, model } from "mongoose";

const technologySchema = new Schema(
  {
    // 1. URL & Heading (Essential for SEO)
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    slug: {
      type: String, // URL friendly version (e.g., "react-js-tutorial")
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    // 2. Main Content
    description: {
      type: String,
      trim: true,
    },

    icon: {
      url: {
        type: String, // Cloudinary/S3 URL
        required: true,
      },
      altText: {
        type: String, // fro SEO
        default: function () {
          return `${this.name} logo`; // Fallback alt text
        },
      },
    },

    // 4. Dedicated SEO Fields (Meta Tags)
    seo: {
      metaTitle: {
        type: String,
        trim: true,
        maxLength: 60,
        default: function () {
          return `${this.name}`;
        },
      },
      metaDescription: {
        type: String, // Google Result
        trim: true,
        maxLength: 160, // Recommended length for SEO
        default: function () {
          return `${this.description}`;
        },
      },
      keywords: [
        {
          type: String, // e.g., ["React Tutorial", "Learn MERN", "Javascript"]
          trim: true,
        },
      ],
      canonicalUrl: {
        type: String,
        trim: true,
      },
    },

    // 5. Categorization (Site Structure/Breadcrumbs )
    topics: [
      {
        id: {
          type: Schema.Types.ObjectId,
          ref: "Topic",
        },
        name: { type: String, default: null },
        slug: { type: String },
      },
    ],

    // 6. Metrics
    usageCount: {
      type: Number,
      default: 0,
    },

    // 7. Control
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },

    createdBy: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
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
    timeseries: true,
  }
);

technologySchema.index({ slug: 1, isPublished: 1 });

export const TechnologyModel = model("Technology", technologySchema);
