import { CategoryModel } from "../models/category.model.js";
import { ApiResponse } from "../utility/data.js";

/* ==========================================================================
   -------------------------- CATEGORY CONTROLLERS --------------------------
   ========================================================================== */

/* Create a new category */
export const createCategory = async (req, res) => {
    try {
        const { name, slug, description, icon, isPublished, createdBy } = req.body;

        // Validate required fields
        if (!name || !slug || !icon || !createdBy) {
            return res.status(400).json(ApiResponse(false, "Name, slug, icon and createdBy are required"));
        }

        const category = new CategoryModel({
            name,
            slug,
            description,
            icon,
            isPublished,
            createdBy
        });

        await category.save();

        return res.status(201).json(ApiResponse(true, "Category created successfully", category));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to create category", null, { error: error.message }));
    }
};

/* Get all categories */
export const getAllCategories = async (req, res) => {
    try {
        const categories = await CategoryModel.find({ isPublished: true });
        return res.status(200).json(ApiResponse(true, "Categories retrieved successfully", categories));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve categories", null, { error: error.message }));
    }
};

/* Get a specific category by ID */
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findById(id);

        if (!category) {
            return res.status(404).json(ApiResponse(false, "Category not found"));
        }

        return res.status(200).json(ApiResponse(true, "Category retrieved successfully", category));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve category", null, { error: error.message }));
    }
};

/* Update a category */
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const category = await CategoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json(ApiResponse(false, "Category not found"));
        }

        return res.status(200).json(ApiResponse(true, "Category updated successfully", category));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to update category", null, { error: error.message }));
    }
};

/* Delete a category */
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json(ApiResponse(false, "Category not found"));
        }

        return res.status(200).json(ApiResponse(true, "Category deleted successfully"));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to delete category", null, { error: error.message }));
    }
};
