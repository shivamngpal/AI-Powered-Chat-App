// const express = require("express");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function signupUser(req, res) {
  const requiredBody = z.object({
    email: z.email(),
    password: z
      .string()
      .min(6)
      .max(12)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
    name: z.string().min(3).max(100),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    console.log("Invalid Input:", parsedData.error.errors);
    return res.status(400).json({
      success: false,
      msg: "Invalid Input",
      errors: parsedData.error.errors,
    });
  }

  try {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    // Check if email already exists
    const existingUserByEmail = await UserModel.findOne({ email: email });
    if (existingUserByEmail) {
      return res.status(403).json({
        success: false,
        msg: "Email already registered! Please use a different email.",
      });
    }

    // Check if username (name) already exists
    const existingUserByName = await UserModel.findOne({ name: name });
    if (existingUserByName) {
      return res.status(403).json({
        success: false,
        msg: "Username already taken! Please choose a different username.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });

    // Send the success response right here!
    res.status(201).json({
      success: true,
      msg: "You are signed up successfully",
    });
  } catch (e) {
    // This catch block now only handles unexpected server errors
    console.log("Error in signupUser controller: ", e.message);
    return res.status(500).json({
      success: false,
      msg: "An internal server error occurred.",
    });
  }
}
// if we have not caught error already in catch block then this block executes
//   if (!errorCaught) {
//     res.json({
//       success: true,
//       msg: "You are signed up",
//     });
//   }
// }

async function signinUser(req, res) {
  const requiredBody = z.object({
    email: z.email(),
    password: z
      .string()
      .min(6)
      .max(12)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    console.log("Invalid Input:", parsedData.error.errors);
    return res.status(400).json({
      success: false,
      msg: "Invalid Input",
      errors: parsedData.error.errors,
    });
  }
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
  });

  // find the user with provided email
  // if it exists then compare hashed password and the password user sent
  // else, user is not signed up...so throw a warning and tell them to signup before logging in.
  if (!user) {
    return res.status(403).json({
      success: false,
      msg: "User does not exist in our database..Please Sign Up first",
    });
  }

  // compare hashed password with the password user sent.
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (passwordMatch) {
    const token = jwt.sign(
      {
        // as _id is object so converting it to string and then creating a jwt
        id: user._id.toString(),
      },
      JWT_SECRET
    );

    // Set the JWT token as a cookie
    res.cookie("jwt", token, {
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: "strict", // CSRF protection
      maxAge: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from today
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } else {
    res.status(403).json({
      success: false,
      msg: "Incorrect email or password",
    });
  }
}

// Forgot Password - Send reset token
async function forgotPassword(req, res) {
  const requiredBody = z.object({
    email: z.string().email(),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      success: false,
      msg: "Invalid email format",
      errors: parsedData.error.errors,
    });
  }

  try {
    const { email } = req.body;

    // Find user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.status(200).json({
        success: true,
        msg: "If that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token (6-digit code for simplicity)
    const crypto = require("crypto");
    const resetToken = crypto.randomInt(100000, 999999).toString();

    // Hash the token before saving
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Save token and expiry (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // TODO: In production, send email with nodemailer instead of console log
    // For development/testing only - check server console for the code
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `🔐 [DEV ONLY] Password reset code for ${email}: ${resetToken}`
      );
      console.log(`⚠️  This code will expire in 15 minutes`);
    }

    // Send email (to be implemented)
    // await sendResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      msg: "If that email exists, a password reset code has been sent to your email.",
    });
  } catch (error) {
    console.log("Error in forgotPassword controller:", error.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred. Please try again.",
    });
  }
}

// Reset Password - Verify token and update password
async function resetPassword(req, res) {
  const requiredBody = z.object({
    email: z.string().email(),
    token: z.string().length(6),
    newPassword: z
      .string()
      .min(6)
      .max(12)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/),
  });

  const parsedData = requiredBody.safeParse(req.body);
  if (!parsedData.success) {
    return res.status(400).json({
      success: false,
      msg: "Invalid input",
      errors: parsedData.error.errors,
    });
  }

  try {
    const { email, token, newPassword } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid or expired reset token.",
      });
    }

    // Check if token exists and hasn't expired
    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        msg: "No reset token found. Please request a new one.",
      });
    }

    // Check if token has expired
    if (Date.now() > user.resetPasswordExpires) {
      return res.status(400).json({
        success: false,
        msg: "Reset token has expired. Please request a new one.",
      });
    }

    // Verify token
    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      return res.status(400).json({
        success: false,
        msg: "Invalid reset token.",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.log("Error in resetPassword controller:", error.message);
    res.status(500).json({
      success: false,
      msg: "An error occurred. Please try again.",
    });
  }
}

module.exports = {
  signinUser,
  signupUser,
  forgotPassword,
  resetPassword,
};
