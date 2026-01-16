import slugify from "slugify";
import { TechnologyModel } from "../models/technology.model.js";
import { ApiResponse } from "../utility/data.js";
import UserModel from "../models/user.model.js";
import { Aggregate } from "mongoose";

export const createTechnology = async (req, res) => {
  try {
    const {
      name,

      description,
      url,
      metaTitle,
      metaDescription,
      keywords,

      isPublished,
    } = req.body;
    const isUser = await UserModel.findById(req.user._id);
    // console.log(icon.url);

    if (!isUser) {
      return res.status(401).json(ApiResponse(false, { error: "Login Again" }));
    }
    if (isUser.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse(false, { error: "user not Authorized" }));
    }

    if (!name) {
      return res
        .status(409)
        .json(ApiResponse(false, { error: `Technology Field is required` }));
    }
    const isExitsTechnology = await TechnologyModel.findOne({ name });
    if (isExitsTechnology) {
      return res
        .status(409)
        .json(ApiResponse(false, { error: `${name} is Already Exists` }));
    } else {
      const newTechnology = new TechnologyModel({
        name: name.toLowerCase(),
        slug: slugify(name, {
          replacement: "-",
          remove: undefined,
          lower: false,
          strict: false,
          locale: "vi",
          trim: true,
        }),
        icon: {
          url: url,
        },
        description,
        metaTitle,
        metaDescription,
        keywords: [keywords],
        topics: [],
        isPublished,
        createdBy: {
          id: isUser._id,
          author: {
            name: isUser.name,
            email: isUser.email,
            username: isUser.username,
          },
        },
        canonicalUrl: `https:domain.com/technology/${name}`,
      });
      await newTechnology.save();

      return res
        .status(201)
        .json(
          ApiResponse(
            true,
            { message: `${name}  Add Successfully` },
            { newTechnology }
          )
        );
    }
  } catch (error) {
    return res.status(500).json(ApiResponse(false, { error: error.message }));
  }
};

export const allPublicTechnology = async (req, res) => {
  // 1. Parse string query params to Integers
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    // 2. Run two queries: One for data, one for total count (for pagination UI)
    // Using Promise.all allows them to run in parallel for speed
    const [allTechnology, totalDocs] = await Promise.all([
      TechnologyModel.find({ isPublished: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      TechnologyModel.countDocuments({ isPublished: true }),
    ]);

    // 3. Handle Empty State (200 OK is better than 400 for empty lists)
    if (allTechnology.length === 0) {
      return res.status(200).json(
        ApiResponse(
          true,
          { message: "No records found" },
          {
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
            },
            technologies: [],
          }
        )
      );
    }

    // 4. Success Response
    return res.status(200).json(
      ApiResponse(
        true,
        { message: "Data fetched Successfully" },
        {
          pagination: {
            currentPage: page,
            limit,
            totalItems: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
          },
          technologies: allTechnology,
          // Sending full pagination details helps the frontend build "Page 1 of 5" buttons
        }
      )
    );
  } catch (error) {
    // 5. Handle Errors (NEVER leave catch empty)
    console.error("Error in allPublicTechnology:", error);
    return res
      .status(500)
      .json(ApiResponse(false, { error: "Internal Server Error" }, null));
  }
};

export const allPrivateTechnology = async (req, res) => {
  try {
    // 1. Auth Check
    const isUser = await UserModel.findById(req.user._id);
    if (!isUser) {
      return res.status(401).json(ApiResponse(false, { error: "Login Again" }));
    }
    if (isUser.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse(false, { error: "Not Authorized" }));
    }

    // 2. Pagination Setup
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // 3. 🔍 Build the Multi-Filter Object
    const filter = {};
    filter["createdBy.id"] = isUser._id;
    // A. Filter by Search Term (Name)
    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: "i" }; // "i" = case insensitive
    }
    // B. Filter by Status (Published vs Draft)
    // Check if 'isPublished' is in the URL (it will be a string "true" or "false")
    if (req.query.isPublished !== undefined) {
      // Convert the string "true"/"false" to an actual Boolean
      filter.isPublished = req.query.isPublished === "true";
    }

    // C. Filter by Topic/Category (if you have topic IDs)
    if (req.query.topic) {
      filter["topics.id"] = req.query.topic;
    }

    // 4. Execute Queries in Parallel
    const [allTechnology, totalDocs] = await Promise.all([
      TechnologyModel.find(filter)
        .sort({ createdAt: -1 }) // Newest first
        .skip(skip)
        .limit(limit)
        .populate("createdBy.id", "name email") // Optional: show who created it
        .lean(),

      TechnologyModel.countDocuments(filter),
    ]);

    // 5. Return Response
    if (allTechnology.length === 0) {
      return res.status(200).json(
        ApiResponse(
          true,
          { message: "No records found matching criteria" },
          {
            technologies: [],
            pagination: {
              totalDocs: 0,
              totalPages: 0,
              currentPage: page,
              limit,
            },
          }
        )
      );
    }

    return res.status(200).json(
      ApiResponse(
        true,
        { message: "Data fetched Successfully" },
        {
          technologies: allTechnology,
          pagination: {
            totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
            currentPage: page,
            limit,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error in allPrivateTechnology:", error);
    return res
      .status(500)
      .json(
        ApiResponse(false, { error: "Internal Server Error" }, error.message)
      );
  }
};
