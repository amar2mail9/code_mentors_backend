import express from "express";
import { createTutorial } from "../controllers/tutorial.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

export const tutorialRouter = express.Router();

// Define your tutorial routes here
// // For example:
// tutorialRouter.get("/", (req, res) => {
//   res.send("This is the tutorial page.");
// // });

tutorialRouter.post('/create', verifyToken, createTutorial)