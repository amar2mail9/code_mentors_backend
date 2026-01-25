import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { createTopic } from "../controllers/topic.controller.js";
export const topicRouter = express.Router();
topicRouter.post("/topic/create", verifyToken, createTopic);
