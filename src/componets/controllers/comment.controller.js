import { CommentModel } from "../models/comment.model.js";
import { ApiResponse } from "../utility/data.js";

/* ==========================================================================
   -------------------------- COMMENT CONTROLLERS ---------------------------
   ========================================================================== */

/* Create a new comment */
export const createComment = async (req, res) => {
    try {
        const { user, tutorial, content } = req.body;

        // Validate required fields
        if (!user || !tutorial || !content) {
            return res.status(400).json(ApiResponse(false, "User, tutorial and content are required"));
        }

        const comment = new CommentModel({
            user,
            tutorial,
            content
        });

        await comment.save();

        return res.status(201).json(ApiResponse(true, "Comment created successfully", comment));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to create comment", null, { error: error.message }));
    }
};

/* Get all comments for a tutorial */
export const getCommentsByTutorial = async (req, res) => {
    try {
        const { tutorialId } = req.params;
        const comments = await CommentModel.find({ tutorial: tutorialId }).populate("user", "name username");
        return res.status(200).json(ApiResponse(true, "Comments retrieved successfully", comments));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve comments", null, { error: error.message }));
    }
};

/* Update a comment */
export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        const comment = await CommentModel.findByIdAndUpdate(
            id,
            { content },
            { new: true, runValidators: true }
        );

        if (!comment) {
            return res.status(404).json(ApiResponse(false, "Comment not found"));
        }

        return res.status(200).json(ApiResponse(true, "Comment updated successfully", comment));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to update comment", null, { error: error.message }));
    }
};

/* Delete a comment */
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await CommentModel.findByIdAndDelete(id);

        if (!comment) {
            return res.status(404).json(ApiResponse(false, "Comment not found"));
        }

        return res.status(200).json(ApiResponse(true, "Comment deleted successfully"));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to delete comment", null, { error: error.message }));
    }
};
