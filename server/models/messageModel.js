const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: ObjectId,
      ref: "users", // This references the 'users' collection
      required: true,
    },
    receiverId: {
      type: ObjectId,
      ref: "users", // This also references the 'users' collection
      required: true,
    },
    message: {
      type: String,
      required: false, // Changed to false because file messages might not have text
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: {
      type: String,
      required: false,
    },
    fileName: {
      type: String,
      required: false,
    },
    fileSize: {
      type: Number,
      required: false,
    },
    mimeType: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt timestamps

const MessageModel = mongoose.model("messages", messageSchema);
module.exports = MessageModel;
