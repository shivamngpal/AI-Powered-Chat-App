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

    const existingUser = await UserModel.findOne({
      email: email,
    });
    if (existingUser) {
      return res.status(403).json({
        success: false,
        msg: "Email already registered! Please use a different email.",
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
      maxAge: new Date(Date.now()  + 7 * 24 * 60 * 60 * 1000), // 7 days from today
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

module.exports = {
  signinUser,
  signupUser,
};
