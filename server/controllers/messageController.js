const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");
const { getIO, getReceiverSocketId } = require("../socket/socket.js");

async function sendMessage(req, res) {
  try {
    const message = req.body.message;
    const receiverId = req.params.id;
    const senderId = req.user._id; // We get this from the protectRoute middleware

    // Find if a conversation already exists between these two users
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    // create a new message
    const newMessage = new MessageModel({
      senderId,
      receiverId,
      message,
    });

    // Add the message's ID to the conversation's messages array
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // This will run both save operations in parallel for better performance
    await Promise.all([conversation.save(), newMessage.save()]);

    // Real-time message delivery via Socket.IO
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId.toString());

    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Also emit to sender so their UI updates without refresh
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getMessages(req, res) {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id; // we get this from protectRoute middleware

    // find the convo between sender and receiver
    // .populate("messages") tells Mongoose to replace the ObjectId(s)
    // stored in the conversation’s messages field with the actual Message documents
    // (from the Message collection) referenced by those ids.
    const conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    // if no convo found
    if (!conversation) {
      return res.status(200).json([]);
    }
    // else case
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}
// this is named export
module.exports = { sendMessage, getMessages };
