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
      required: true,
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt timestamps

const MessageModel = mongoose.model("messages", messageSchema);
module.exports = MessageModel;
