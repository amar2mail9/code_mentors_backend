import express from "express";
import {
    createLoginHistory,
    getUserLoginHistory,
    getAllLoginHistory,
    getLoginHistoryById,
    updateLoginHistory,
    deleteLoginHistory,
    deleteUserLoginHistory,
    getLoginStatistics
} from "../controllers/loginHistory.controller.js";

export const loginHistoryRouter = express.Router();

// Create a new login history entry
loginHistoryRouter.post('/login-history', createLoginHistory);

// Get login history for a specific user
loginHistoryRouter.get('/login-history/user/:userId', getUserLoginHistory);

// Get all login history (Admin only)
loginHistoryRouter.get('/login-history', getAllLoginHistory);

// Get a specific login history entry by ID
loginHistoryRouter.get('/login-history/:id', getLoginHistoryById);

// Update a login history entry
loginHistoryRouter.put('/login-history/:id', updateLoginHistory);

// Delete a specific login history entry
loginHistoryRouter.delete('/login-history/:id', deleteLoginHistory);

// Delete all login history for a specific user
loginHistoryRouter.delete('/login-history/user/:userId', deleteUserLoginHistory);

// Get login statistics
loginHistoryRouter.get('/login-history/stats', getLoginStatistics);