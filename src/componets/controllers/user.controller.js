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
    /********* check filed validation ************ */
    if (
      [name, email, password, username].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "All fields are required" }));
    }

    if (password.length < 6) {
      return res.status(400).json(
        ApiResponse(false, {
          error: "Password must be at least 6 characters",
        })
      );
    }

    const isUser = await UserModel.findOne({
      $or: [{ email: email.toLowerCase(), username: username.toLowerCase() }],
    });

    /************* Check user or not **************** */
    if (isUser) {
      // if user already exits
      return res.status(409).json(
        ApiResponse(false, "User with this email already exists", null, {
          error: "Email or username already in use ",
        })
      );
    } else {
      // if user not exits
      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = await UserModel({
        email,
        password: hashPassword,
        name,
        username,
        otp: OTPGenerator(),
      });

      newUser.save();
      const user = {
        _id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      };
      // send opt logic here (Reaming)

      return res
        .status(201)
        .json(
          ApiResponse(
            true,
            { message: "Account Created", send: "Opt sent Successfully" },
            user
          )
        );
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
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
    if ([inputValue, password].some((field) => !field || field.trim() === "")) {
      return res
        .status(400)
        .json(ApiResponse(false, { error: "All fields are required" }));
    }

    const isUser = await UserModel.findOne({
      $or: [{ email: inputValue }, { username: inputValue }],
    });

    if (!isUser)
      return res.status(404).json(
        ApiResponse(false, {
          error: "User Not Found",
        })
      );

    if (isUser) {
      // match Password
      if (bcrypt.compare(password, isUser?.password)) {
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
        return res.status(200).json(
          ApiResponse(
            true,
            { message: "Login Successfully" },
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
        return res.status(401).json(false, { error: "Invalid credentials" });
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
