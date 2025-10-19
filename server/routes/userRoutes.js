const express = require("express");
const { protectRoute } = require("../middleware/protectRoute");
const {
  getUsersForSidebar,
  searchUsers,
} = require("../controllers/userController");

const router = express.Router();

// This route is protected, so only logged-in users can see the list
router.get("/", protectRoute, getUsersForSidebar);

// Search for users by name or email
router.get("/search", protectRoute, searchUsers);

module.exports = router;
