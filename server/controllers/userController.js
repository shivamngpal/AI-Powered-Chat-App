const UserModel = require("../models/userModel");
const ConversationModel = require("../models/conversationModel");

async function getUsersForSidebar(req, res) {
  try {
    const loggedInUser = req.user._id;
    const loggedInUserStr = loggedInUser.toString();

    // Find all users except the one who is logged in
    // The "ne" in $ne stands for "not equal"
    const allUsers = await UserModel.find({
      _id: { $ne: loggedInUser },
    }).select("-password");

    // For each user, fetch their conversation data (unread count and last message)
    const usersWithConversationData = await Promise.all(
      allUsers.map(async (user) => {
        const conversation = await ConversationModel.findOne({
          participants: { $all: [loggedInUser, user._id] },
        }).populate("lastMessage");

        // Get unread count for the logged-in user
        const unreadCount = conversation
          ? conversation.unreadCount.get(loggedInUserStr) || 0
          : 0;

        // Get last message data
        const lastMessage = conversation?.lastMessage || null;

        return {
          ...user.toObject(),
          unreadCount,
          lastMessage,
        };
      })
    );

    res.status(200).json(usersWithConversationData);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getUsersForSidebar };
