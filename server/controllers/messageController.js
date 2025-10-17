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
      status: "sent", // default status
    });

    // Add the message's ID to the conversation's messages array
    if (newMessage) {
      conversation.messages.push(newMessage._id);

      // Update last message reference
      conversation.lastMessage = newMessage._id;

      // Increment unread count for receiver
      const receiverIdStr = receiverId.toString();
      const currentUnreadCount =
        conversation.unreadCount.get(receiverIdStr) || 0;
      conversation.unreadCount.set(receiverIdStr, currentUnreadCount + 1);
    }

    // This will run both save operations in parallel for better performance
    await Promise.all([conversation.save(), newMessage.save()]);

    // Real-time message delivery via Socket.IO
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId.toString());

    // Emit to receiver and update status to delivered if receiver is online
    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // Send unread count update to receiver
      const receiverIdStr = receiverId.toString();
      const unreadCount = conversation.unreadCount.get(receiverIdStr) || 0;
      io.to(receiverSocketId).emit("unreadCountUpdate", {
        conversationId: conversation._id,
        senderId: senderId.toString(),
        unreadCount: unreadCount,
      });

      // Notify sender about status change
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
        });
      }
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

async function markMessagesAsRead(req, res) {
  try {
    const senderId = req.params.id; // The person who sent the messages
    const receiverId = req.user._id; // The logged-in user (receiver)

    // Find all unread messages sent by senderId to receiverId
    const updatedMessages = await MessageModel.updateMany(
      {
        senderId: senderId,
        receiverId: receiverId,
        status: { $ne: "read" }, // Only update if not already read
      },
      {
        status: "read",
      }
    );

    // Reset unread count for this receiver in the conversation
    const conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (conversation) {
      const receiverIdStr = receiverId.toString();
      conversation.unreadCount.set(receiverIdStr, 0);
      await conversation.save();
    }

    // Emit real-time update to sender about read receipts
    const io = getIO();
    const senderSocketId = getReceiverSocketId(senderId);

    if (senderSocketId && updatedMessages.modifiedCount > 0) {
      // Notify sender that their messages were read
      io.to(senderSocketId).emit("messagesRead", {
        receiverId: receiverId.toString(),
      });
    }

    res.status(200).json({
      success: true,
      modifiedCount: updatedMessages.modifiedCount,
    });
  } catch (error) {
    console.log("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// this is named export
module.exports = { sendMessage, getMessages, markMessagesAsRead };
