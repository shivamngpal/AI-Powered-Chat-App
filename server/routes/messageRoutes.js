const express = require("express");
const { protectRoute } = require("../middleware/protectRoute");
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
} = require("../controllers/messageController.js");

const router = express.Router();

// Get messages between logged-in user and another user
router.get("/:id", protectRoute, getMessages);

// Send message to another user
router.post("/send/:id", protectRoute, sendMessage);

// Mark messages as read
router.put("/read/:id", protectRoute, markMessagesAsRead);

module.exports = router;
