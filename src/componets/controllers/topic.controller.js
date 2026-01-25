import slugify from "slugify";
import { TechnologyModel } from "../models/technology.model.js";
import { TopicModel } from "../models/topic.model.js";
import { ApiResponse } from "../utility/data.js";
import UserModel from "../models/user.model.js";

export const createTopic = async (req, res) => {
  try {
    const {
      name,
      description,
      title,
      metaDescription,
      keyword,
      canonicalUrl,
      tutorials,
      icon,
      technology,
      url,
      ogImage,
      isActive,
    } = req.body;
    const isUser = await UserModel.findById(req.user._id);
    if (!isUser) {
      return res.status(401).json(ApiResponse(false, { error: "Login Again" }));
    }

    if (isUser.role !== "admin") {
      return res
        .status(403)
        .json(ApiResponse(false, { error: "user not Authorized" }));
    } else {
      if (!name) {
        return res
          .status(409)
          .json(ApiResponse(false, { error: `Topic Field is required` }));
      }
      // check technology
      console.log(technology);
      const isExitsTechnology = await TechnologyModel.findOne({
        slug: technology,
      });
      console.log(isExitsTechnology);

      if (!isExitsTechnology) {
        return res
          .status(404)
          .json(ApiResponse(false, { error: "Technology Not Found" }));
      }

      const isExitsTopic = await TopicModel.findOne({ name });
      if (isExitsTopic) {
        return res
          .status(409)
          .json(ApiResponse(false, { error: `${name} is Already Exists` }));
      }

      const newTopic = new TopicModel({
        name,
        slug: slugify(name, {
          replacement: "-",
          remove: undefined,
          lower: false,
          strict: false,
          locale: "vi",
        }),
        description,
        title,
        metaDescription,
        keyword,
        canonicalUrl,
        tutorials,
        icon,
        technology: isExitsTechnology._id,
        url,
        ogImage,
        isActive,
        createdBy: {
          id: isUser._id,
          author: {
            name: isUser.name,
            email: isUser.email,
            username: isUser.username,
          },
        },
      });
      await newTopic.save();

      isExitsTechnology.topics.push({
        ...newTopic,
        id: newTopic._id,
        slug: newTopic.slug,
        name: newTopic.name,
      });
      await isExitsTechnology.save();

      return res
        .status(201)
        .json(ApiResponse(true, { message: `${name} Add Successfully` }));
    }
  } catch (error) {
    return res.status(201).json(ApiResponse(false, { error: error.message }));
  }
};
