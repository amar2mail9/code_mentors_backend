import slugify from "slugify";
import { TechnologyModel } from "../models/technology.model.js";
import { ApiResponse } from "../utility/data.js";

export const createTechnology = async (req, res) => {
  try {
    // 1. Auth & Role Check
    const isLoggedIn = req.user;
    if (!isLoggedIn) {
      return res
        .status(401)
        .json(ApiResponse(false, { error: "Unauthorized" }));
    }
    if (isLoggedIn.role !== "admin") {
      return res.status(403).json(ApiResponse(false, { error: "Forbidden" }));
    }

    // 2. Destructure new fields from req.body
    const { name, description, icon, seo, topics, isPublished } = req.body;

    // 3. Basic Validation
    if (!name) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "Technology name is required" }));
    }

    // 4. Check for existing technology
    const existingTech = await TechnologyModel.findOne({ name });
    if (existingTech) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "Technology already exists" }));
    }

    // 5. Intelligent Defaults for SEO (Automatic SEO Generation)
    const seoData = {
      metaTitle: seo?.metaTitle || name, // Default: Technology Name
      metaDescription: seo?.metaDescription || description?.substring(0, 160), // Default: First 160 chars of description
      keywords: seo?.keywords || [name, "Learn " + name, name + " tutorial"], // Default Keywords
      canonicalUrl: seo?.canonicalUrl || "",
    };

    // 6. Icon Handling (Schema expects object {url, altText})
    const iconData = {
      url: icon?.url || "",
      altText: icon?.altText || `${name} logo`, // Auto-generate alt text if missing
    };

    // 7. Create New Document
    const newTechnology = new TechnologyModel({
      name,
      slug: slugify(name, { lower: true, strict: true }), // "React JS" -> "react-js"
      description,
      icon: iconData,
      seo: seoData,
      topics: topics || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      createdBy: {
        id: isLoggedIn._id, // Ensure your JWT payload has 'id' or '_id'
        user: {
          name: isLoggedIn.name,
          email: isLoggedIn.email,
          username: isLoggedIn.username,
        },
      },
    });

    await newTechnology.save();

    return res.status(201).json(
      ApiResponse(true, {
        message: "Technology created successfully",
        data: newTechnology,
      })
    );
  } catch (error) {
    console.error("Create Tech Error:", error); // Debugging ke liye
    return res.status(500).json(ApiResponse(false, { error: error.message }));
  }
};
