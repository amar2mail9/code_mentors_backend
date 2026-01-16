import express from "express";
import {
  allPrivateTechnology,
  allPublicTechnology,
  createTechnology,
} from "../controllers/technology.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
export const technologyRouter = express.Router();

technologyRouter.post("/technology/create", verifyToken, createTechnology);
technologyRouter.get("/public/technologies", allPublicTechnology);
technologyRouter.get("/private/technologies", verifyToken, allPrivateTechnology);
