import express from "express";
import {loginViaOTP, 
  accountCreate,
  accountVerify,
  loginViaPassword,
  resendOTP,
} from "../controllers/user.controller.js";
export const userRouter = express.Router();
// create new Account
userRouter.post("/user/new-account", accountCreate);
// Account Verify
userRouter.post("/user/account-verify", accountVerify);
// resend OTP
userRouter.post("/account/resend-otp", resendOTP);

userRouter.post("/login/via-password", loginViaPassword);
userRouter.post("/login/via-otp", loginViaOTP);
