const express = require("express");
const { protectRoute } = require("../middleware/protectRoute");
const {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  sendFileMessage,
} = require("../controllers/messageController.js");
const upload = require("../config/multerConfig");

const router = express.Router();

// Get messages between logged-in user and another user
router.get("/:id", protectRoute, getMessages);

// Send message to another user
router.post("/send/:id", protectRoute, sendMessage);

// Send file/image message
router.post(
  "/send-file/:id",
  protectRoute,
  upload.single("file"),
  sendFileMessage
);

// Mark messages as read
router.put("/read/:id", protectRoute, markMessagesAsRead);

module.exports = router;
