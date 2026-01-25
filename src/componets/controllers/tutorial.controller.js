import slugify from "slugify";
import { TechnologyModel } from "../models/technology.model.js";
import { TopicModel } from "../models/topic.model.js";
import { TutorialModel } from "../models/tutorial.model.js";
import { ApiResponse } from "../utility/data.js";
import UserModel from "../models/user.model.js";

export const createTutorial = async (req, res) => {
  try {
    const {
      title,
      content,
      topic,
      technology,
      excerpt,
      // Seo Parameters
      metaTitle,
      metaDescription,
      keywords, // Expecting an array ["js", "react"]
      canonicalUrl,
      // Media Parameters
      featuredImage,
    } = req.body;

    // 1. User Authentication & Authorization
    if (!req.user || !req.user._id) {
      return res.status(401).json(ApiResponse(false, { error: "Login Again" }));
    }

    const isUser = await UserModel.findById(req.user._id);

    if (!isUser) {
      return res
        .status(401)
        .json(ApiResponse(false, { error: "User not found" }));
    }
    if (isUser.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse(false, { error: "User not Authorized" }));
    }

    // 2. Validation
    if (!title || !content || !topic || !technology || !excerpt) {
      return res
        .status(409)
        .json(
          ApiResponse(false, {
            error: "All Fields are required to create Tutorial",
          }),
        );
    }

    // 3. Check Existence
    const isExitsTopic = await TopicModel.findOne({ slug: topic });
    const isExitsTechnology = await TechnologyModel.findOne({
      slug: technology,
    });

    if (!isExitsTopic)
      return res
        .status(404)
        .json(ApiResponse(false, { error: "Topic Not Found" }));
    if (!isExitsTechnology)
      return res
        .status(404)
        .json(ApiResponse(false, { error: "Technology Not Found" }));

    const isExitsTutorial = await TutorialModel.findOne({ title });
    if (isExitsTutorial) {
      return res
        .status(409)
        .json(ApiResponse(false, { error: `${title} already exists` }));
    }

    // 4. Prepare Data
    // Merge user keywords with auto-generated tags
    const finalKeywords = [
      ...(Array.isArray(keywords) ? keywords : []), // Spread user keywords
      title,
      "tutorial",
      "guide",
      isExitsTopic.name,
      isExitsTechnology.name,
    ];

    // 5. Create Instance
    const newTutorial = new TutorialModel({
      title,
      slug: slugify(title, { lower: true, strict: true }),
      content,
      topic: {
        _id: isExitsTopic._id,
        slug: isExitsTopic.slug,
        name: isExitsTopic.name,
      },
      technology: {
        _id: isExitsTechnology._id,
        slug: isExitsTechnology.slug,
        name: isExitsTechnology.name,
      },
      excerpt,

      // SEO: We pass explicitly provided values.
      // If metaTitle is undefined, Mongoose Schema default will kick in.
      seo: {
        metaTitle,
        metaDescription,
        keywords: finalKeywords,
        canonicalUrl,
      },

      // Media
      featuredImage: {
        url: featuredImage, // Schema default handles 'alt' using title
      },
      ogImage: featuredImage, // Use featured image as OG image by default

      // Metadata
      isPublished: true,
      readingTime: Math.ceil(content.split(" ").length / 200),
      views: 0,
      createdBy: {
        id: isUser._id,
        author: {
          name: isUser.name,
          email: isUser.email,
          username: isUser.username,
        },
      },
    });

    await newTutorial.save();

    return res.status(201).json(
      ApiResponse(true, {
        message: `${title} Added Successfully`,
        data: newTutorial, // Return the full object (cleaner)
      }),
    );
  } catch (error) {
    return res.status(500).json(ApiResponse(false, { error: error.message }));
  }
};
