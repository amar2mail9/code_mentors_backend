import UserModel from "../models/user.model.js";
import { ApiResponse, OTPGenerator, userIDCreator } from "../utility/data.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/* ==========================================================================
   ----------------------- AUTHENTICATION CONTROLLERS -----------------------
   ========================================================================== */

/* 1.  Register a new user (Student) */
export const accountCreate = async (req, res) => {
  try {
    const { email, name, password, username } = req.body;

    /* 1. Field validation */
    if ([name, email, password, username].some((field) => !field?.trim())) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "All fields are required" }));
    }

    /* 2. Password validation */
    if (password.length < 6) {
      return res.status(400).json(
        ApiResponse(false, {
          error: "Password must be at least 6 characters",
        })
      );
    }

    /* 3. Normalize data */
    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    /* 4. Check existing user (email OR username) */
    const existingUser = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingUser) {
      return res.status(409).json(
        ApiResponse(false, {
          error: "Email or username already in use",
        })
      );
    }

    /* 5. Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 6. Create user */
    const newUser = await UserModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      name,
      username: normalizedUsername,
      otp: OTPGenerator(),
    });

    /* 7. Response payload (never send password) */
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
    };

    // TODO: Send OTP via email/SMS

    return res.status(201).json(
      ApiResponse(
        true,
        {
          message: "Account created successfully",
          otpStatus: "OTP sent",
        },
        userResponse
      )
    );
  } catch (error) {
    return res.status(500).json(
      ApiResponse(false, {
        error: error.message || "Internal Server Error",
      })
    );
  }
};

/* 2. Verify Account via OTP (After Registration) */
export const accountVerify = async (request, response) => {
  try {
    const { email, OTP } = request.body;
    if (!email)
      return response
        .status(400)
        .json(ApiResponse(false, { error: "Email Missing" }));
    if (!OTP)
      return response
        .status(400)
        .json(ApiResponse(false, { error: "OTP is required" }));
    // check user from data base
    const isUser = await UserModel.findOne({ email });
    if (!isUser)
      return response
        .status(404)
        .json(ApiResponse(false, { error: "User not found try again " }));
    if (isUser) {
      // check is user already verify
      if (isUser.isVerified)
        return response
          .status(400)
          .json(ApiResponse(false, { error: "User Already Verified " }));
      // match OTP and Verify Account
      if (isUser.otp === OTP) {
        isUser.isVerified = true;
        isUser.otp = null;
        await isUser.save();
        const token = await jwt.sign(
          {
            _id: isUser._id,
            email: isUser.email,
            role: isUser.role,
            username: isUser.username,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" }
        );
        // send Welcome E-Mail (remaining)
        return response.status(200).json(
          ApiResponse(
            true,
            {
              message: "Account Verified ",
            },
            {
              user: {
                email: isUser.email,
                name: isUser.name,
                username: isUser.username,
                token,
              },
            }
          )
        );
      } else {
        return response
          .status(400)
          .json(ApiResponse(false, { error: "Invalid OTP " }));
      }
    }
  } catch (error) {
    return response.status(500).json(
      ApiResponse(false, {
        error: error.message,
      })
    );
  }
};

/* 3. Resend OTP (If previous one expired) */
export const resendOTP = async (request, response) => {
  try {
    const { email } = request.body;
    if (!email)
      return response
        .status(400)
        .json(ApiResponse(false, { error: "Email Missing" }));
    // check user from data base
    const isUser = await UserModel.findOne({ email });
    if (!isUser)
      return response
        .status(404)
        .json(ApiResponse(false, { error: "User not found try again " }));
    if (isUser) {
      // generate new otp
      const newOTP = OTPGenerator();
      isUser.otp = newOTP;
      await isUser.save();
      // send OTP via email logic here (remaining)
      return response
        .status(200)
        .json(ApiResponse(true, { message: "OTP Resent Successfully" }));
    }
  } catch (error) {
    return response.status(500).json(
      ApiResponse(false, {
        error: error.message,
      })
    );
  }
};

/* 4.  Login with Password */
export const loginViaPassword = async (req, res) => {
  try {
    const { inputValue, password } = req.body;

    // 1. Validate input
    if (!inputValue || !password) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "All fields are required" }));
    }

    // 2. Find user by email or username
    const user = await UserModel.findOne({
      $or: [{ email: inputValue }, { username: inputValue }],
    });

    if (!user) {
      return res
        .status(404)
        .json(ApiResponse(false, { error: "User not found" }));
    }

    // 3. Compare password (IMPORTANT: await)
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json(ApiResponse(false, { error: "Invalid credentials" }));
    }

    // 4. Generate JWT
    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // 5. Success response
    return res.status(200).json(
      ApiResponse(
        true,
        { message: "Login successful" },
        {
          user: {
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
          },
          token,
        }
      )
    );
  } catch (error) {
    return res.status(500).json(
      ApiResponse(false, {
        error: error.message || "Internal Server Error",
      })
    );
  }
};

/* Login via OTP (Password less Login) */
export const loginViaOTP = async (req, res) => {
  try {
    const { email, OTP } = req.body;
    if (!OTP) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "OTP fields are required" }));
    }
    const isUser = await UserModel.findOne({ email });
    if (!isUser)
      return res
        .status(404)
        .json(ApiResponse(false, { message: "User not Sound" }));

    if (isUser) {
      // match OTP
      if (isUser.otp === OTP) {
        const token = jwt.sign(
          {
            _id: isUser._id,
            email: isUser.email,
            username: isUser.username,
            role: isUser.role,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" }
        );

        return res.status(200).json(
          ApiResponse(
            false,
            { message: "login Successfully" },
            {
              user: {
                email: isUser.email,
                name: isUser.name,
                username: isUser.username,
                token,
              },
            }
          )
        );
      }
    }
  } catch (error) {
    return res.status(500).json(
      ApiResponse(false, {
        error: error.message,
      })
    );
  }
};

/* Logout User */

/* Refresh Access Token (For keeping user logged in securely) */

/* ==========================================================================
   ----------------------- PASSWORD MANAGEMENT -----------------------
   ========================================================================== */

/* Forgot Password (Send Reset Link/OTP to Email) */
/* Reset Password (Set new password using the token/OTP) */
/* Change Password (When logged in: Old Password -> New Password) */

/* ==========================================================================
   ----------------------- PROFILE MANAGEMENT (SELF) -----------------------
   ========================================================================== */

/* Get Current User Profile (View own details) */
/* Update Profile Details (Name, Bio, Social Links, Skills) */
/* Update Avatar / Profile Picture */
/* Delete My Account (Deactivate/Soft Delete) */

/* ==========================================================================
   ----------------------- ADMIN / MENTOR OPERATIONS -----------------------
   ========================================================================== */

/* --- User Management (Admin Only) --- */
/* Get All Users (With pagination & filters) */
/* Get Single User Details (By ID) */
/* Create New User (Manually by Admin) */
/* Update Any User Details (By Admin) */
/* Delete User (Hard delete by Admin) */

/* --- Status & Role Management --- */
/* Update User Status (Active/Blocked/Suspended) - By Admin */
/* Verify Mentor Profile (Approve a Mentor's application) - By Admin */
/* Update Role (Promote Student to Mentor or Admin) */

/* --- Dashboard Specifics --- */
/* Get User Statistics (Total students, mentors, etc.) */
