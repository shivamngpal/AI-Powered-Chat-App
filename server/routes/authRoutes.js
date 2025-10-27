const express = require("express");
const {
  signinUser,
  signupUser,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
  updateProfilePicture,
  updateAbout,
} = require("../controllers/authController");
const { protectRoute } = require("../middleware/protectRoute");
const upload = require("../config/multerConfig");
const {
  authLimiter,
  resetPasswordLimiter,
} = require("../middleware/rateLimiter");

// express.Router() is a built-in feature of Express that acts like a "mini-application,"
// allowing you to group related route handlers into a single, modular file.
const router = express.Router();

router.post("/signup", authLimiter, signupUser);
router.post("/signin", authLimiter, signinUser);
router.post("/forgot-password", resetPasswordLimiter, forgotPassword);
router.post("/reset-password", resetPasswordLimiter, resetPassword);
router.put("/change-password", protectRoute, changePassword);
router.delete("/delete-account", protectRoute, deleteAccount);
router.put(
  "/update-profile-picture",
  protectRoute,
  upload.single("profilePicture"),
  updateProfilePicture
);
router.put("/update-about", protectRoute, updateAbout);

module.exports = router;
