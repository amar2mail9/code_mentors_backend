import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema({
    // ----------------- Basic Auth & Identity -----------------
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
            'Please fill a valid email address'
        ]
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false // Important: Do not return password by default in queries
    },

    // ----------------- Security & Verification -----------------
    otp: {
        type: Number,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "inactive", "suspended"],
        default: "active"
    },
    lastLogin: {
        type: Date,
        default: null
    },

    // ----------------- Profile Details -----------------
    avatar: {
        public_id: { type: String }, // For Cloudinary/AWS S3
        url: { type: String, default: "https://placehold.co/400" }
    },
    role: {
        type: String,
        enum: ["student", "mentor", "admin", "editor"],
        default: "student"
    },
    bio: {
        type: String,
        maxlength: 250,
        default: ""
    },

    // ----------------- CodesMentors Specifics -----------------
    // Useful for a coding platform to show what stacks the user knows
    skills: [{
        type: String,
        trim: true
    }],

    // Links to showcase work (crucial for mentors/devs)
    socialLinks: {
        github: { type: String },
        linkedin: { type: String },
        portfolio: { type: String },
        twitter: { type: String }
    },


    // ----------------- Address (As Requested) -----------------
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true }
    }

}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

// Create the model
const UserModel = mongoose.models.User || model("User", userSchema);

export default UserModel;