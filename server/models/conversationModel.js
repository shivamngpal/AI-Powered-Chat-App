const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: ObjectId,
        ref: "users", // Must match the collection name in UserModel
        required: true,
      },
    ],

    messages: [
      {
        type: ObjectId,
        ref: "messages", // Must match the collection name in MessageModel
      },
    ],

    // Track unread count for each participant
    // Key: userId (as string), Value: unread count
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },

    // Store reference to last message for quick preview
    lastMessage: {
      type: ObjectId,
      ref: "messages",
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt timestamps

const ConversationModel = mongoose.model("conversations", conversationSchema);
module.exports = ConversationModel;
