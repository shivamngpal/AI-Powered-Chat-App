const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

async function protectRoute(req, res, next) {
  try {
    const token = req.cookies.jwt;

    // if token does not exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - No Token Provided",
      });
    }

    // token exists
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized - Invalid Token" });
    }

    // Find user in DB and check if they exist
    // .select("-password") removes the password field from the user object
    const user = await UserModel.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // user found
    req.user = user;
    next();
  } catch (error) {
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { protectRoute };
