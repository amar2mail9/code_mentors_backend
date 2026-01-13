import express from "express";
import { createTechnology } from "../controllers/technology.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
export const technologyRouter = express.Router();

technologyRouter.post("/technology/create", verifyToken, createTechnology);
