import LoginHistoryModel from "../models/loginHistory.model.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utility/data.js";

/* ==========================================================================
   ----------------------- LOGIN HISTORY CONTROLLERS -----------------------
   ========================================================================== */

/* Create a new login history entry (Typically called during login) */
export const createLoginHistory = async (req, res) => {
    try {
        const { userId, ipAddress, userAgent, deviceInfo, location, success, failureReason } = req.body;

        // Validate required fields
        if (!userId || !ipAddress) {
            return res.status(400).json(ApiResponse(false, "User ID and IP address are required"));
        }

        const loginHistory = new LoginHistoryModel({
            user: userId,
            ipAddress,
            userAgent,
            deviceInfo,
            location,
            success: success !== undefined ? success : true,
            failureReason: success === false ? failureReason : null
        });

        await loginHistory.save();

        return res.status(201).json(ApiResponse(true, "Login history recorded successfully", loginHistory));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to record login history", null, { error: error.message }));
    }
};

/* Get all login history for a specific user */
export const getUserLoginHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, startDate, endDate } = req.query;

        if (!userId) {
            return res.status(400).json(ApiResponse(false, "User ID is required"));
        }

        // Build query
        const query = { user: userId };
        if (startDate || endDate) {
            query.loginTime = {};
            if (startDate) query.loginTime.$gte = new Date(startDate);
            if (endDate) query.loginTime.$lte = new Date(endDate);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { loginTime: -1 },
            populate: {
                path: 'user',
                select: 'name email username'
            }
        };

        const loginHistories = await LoginHistoryModel.find(query)
            .sort(options.sort)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .populate(options.populate.path, options.populate.select);

        const total = await LoginHistoryModel.countDocuments(query);

        return res.status(200).json(ApiResponse(true, "Login history retrieved successfully", {
            loginHistories,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                hasNext: options.page * options.limit < total,
                hasPrev: options.page > 1
            }
        }));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve login history", null, { error: error.message }));
    }
};

/* Get all login history (Admin only) */
export const getAllLoginHistory = async (req, res) => {
    try {
        const { page = 1, limit = 10, userId, startDate, endDate, success } = req.query;

        // Build query
        const query = {};
        if (userId) query.user = userId;
        if (success !== undefined) query.success = success === 'true';
        if (startDate || endDate) {
            query.loginTime = {};
            if (startDate) query.loginTime.$gte = new Date(startDate);
            if (endDate) query.loginTime.$lte = new Date(endDate);
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { loginTime: -1 },
            populate: {
                path: 'user',
                select: 'name email username'
            }
        };

        const loginHistories = await LoginHistoryModel.find(query)
            .sort(options.sort)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .populate(options.populate.path, options.populate.select);

        const total = await LoginHistoryModel.countDocuments(query);

        return res.status(200).json(ApiResponse(true, "All login history retrieved successfully", {
            loginHistories,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                hasNext: options.page * options.limit < total,
                hasPrev: options.page > 1
            }
        }));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve login history", null, { error: error.message }));
    }
};

/* Get a specific login history entry by ID */
export const getLoginHistoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const loginHistory = await LoginHistoryModel.findById(id).populate('user', 'name email username');

        if (!loginHistory) {
            return res.status(404).json(ApiResponse(false, "Login history entry not found"));
        }

        return res.status(200).json(ApiResponse(true, "Login history entry retrieved successfully", loginHistory));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve login history entry", null, { error: error.message }));
    }
};

/* Update a login history entry (Rarely used, but for admin corrections) */
export const updateLoginHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove fields that shouldn't be updated
        delete updateData._id;
        delete updateData.createdAt;

        const loginHistory = await LoginHistoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'name email username');

        if (!loginHistory) {
            return res.status(404).json(ApiResponse(false, "Login history entry not found"));
        }

        return res.status(200).json(ApiResponse(true, "Login history entry updated successfully", loginHistory));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to update login history entry", null, { error: error.message }));
    }
};

/* Delete a specific login history entry */
export const deleteLoginHistory = async (req, res) => {
    try {
        const { id } = req.params;

        const loginHistory = await LoginHistoryModel.findByIdAndDelete(id);

        if (!loginHistory) {
            return res.status(404).json(ApiResponse(false, "Login history entry not found"));
        }

        return res.status(200).json(ApiResponse(true, "Login history entry deleted successfully"));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to delete login history entry", null, { error: error.message }));
    }
};

/* Delete all login history for a specific user */
export const deleteUserLoginHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json(ApiResponse(false, "User ID is required"));
        }

        const result = await LoginHistoryModel.deleteMany({ user: userId });

        return res.status(200).json(ApiResponse(true, `Deleted ${result.deletedCount} login history entries for user`));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to delete user login history", null, { error: error.message }));
    }
};

/* Get login statistics */
export const getLoginStatistics = async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;

        const matchStage = {};
        if (userId) matchStage.user = mongoose.Types.ObjectId(userId);
        if (startDate || endDate) {
            matchStage.loginTime = {};
            if (startDate) matchStage.loginTime.$gte = new Date(startDate);
            if (endDate) matchStage.loginTime.$lte = new Date(endDate);
        }

        const stats = await LoginHistoryModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalLogins: { $sum: 1 },
                    successfulLogins: { $sum: { $cond: ["$success", 1, 0] } },
                    failedLogins: { $sum: { $cond: ["$success", 0, 1] } },
                    uniqueIPs: { $addToSet: "$ipAddress" },
                    lastLogin: { $max: "$loginTime" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalLogins: 1,
                    successfulLogins: 1,
                    failedLogins: 1,
                    uniqueIPCount: { $size: "$uniqueIPs" },
                    lastLogin: 1
                }
            }
        ]);

        const statistics = stats.length > 0 ? stats[0] : {
            totalLogins: 0,
            successfulLogins: 0,
            failedLogins: 0,
            uniqueIPCount: 0,
            lastLogin: null
        };

        return res.status(200).json(ApiResponse(true, "Login statistics retrieved successfully", statistics));
    } catch (error) {
        return res.status(500).json(ApiResponse(false, "Failed to retrieve login statistics", null, { error: error.message }));
    }
};