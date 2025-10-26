const express = require("express");
const {
  signinUser,
  signupUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

// express.Router() is a built-in feature of Express that acts like a "mini-application,"
// allowing you to group related route handlers into a single, modular file.
const router = express.Router();

router.post("/signup", signupUser);
router.post("/signin", signinUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
