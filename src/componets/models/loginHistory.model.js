import mongoose, { Schema, model } from "mongoose";

const loginHistorySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"]
    },
    loginTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    ipAddress: {
        type: String,
        required: [true, "IP address is required"]
    },
    userAgent: {
        type: String,
        trim: true
    },
    deviceInfo: {
        type: String,
        trim: true
    },
    location: {
        city: { type: String },
        country: { type: String },
        region: { type: String }
    },
    success: {
        type: Boolean,
        default: true
    },
    failureReason: {
        type: String,
        enum: ["invalid_credentials", "account_blocked", "account_not_verified", "other"],
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for efficient queries
loginHistorySchema.index({ user: 1, loginTime: -1 });
loginHistorySchema.index({ ipAddress: 1 });
loginHistorySchema.index({ createdAt: -1 });

// Create the model
const LoginHistoryModel = mongoose.models.LoginHistory || model("LoginHistory", loginHistorySchema);

export default LoginHistoryModel;
