const ConversationModel = require("../models/conversationModel");
const MessageModel = require("../models/messageModel");
const { getIO, getReceiverSocketId } = require("../socket/socket.js");
const {
  isAIBot,
  getConversationContext,
  getUserConversationsContext,
  calculateTypingDelay,
} = require("../utils/aiHelper");
const { getAIResponse, isAIConfigured } = require("../services/aiService");
const {
  parseSlashCommand,
  executeSlashCommand,
} = require("../utils/slashCommands");

async function sendMessage(req, res) {
  try {
    const message = req.body.message;
    const receiverId = req.params.id;
    const senderId = req.user._id; // We get this from the protectRoute middleware

    // ============================================
    // SLASH COMMAND DETECTION
    // ============================================
    const slashCommand = parseSlashCommand(message);
    if (slashCommand && isAIConfigured()) {
      console.log(`⚡ Slash command detected: ${slashCommand.command}`);

      try {
        // Execute slash command
        const aiResponse = await executeSlashCommand(
          slashCommand,
          senderId.toString(),
          null // We'll add conversation ID support later if needed
        );

        // Return AI response immediately without saving as message
        return res.status(200).json({
          isSlashCommand: true,
          command: slashCommand.command,
          response: aiResponse,
        });
      } catch (error) {
        console.error("❌ Slash command error:", error.message);
        return res.status(200).json({
          isSlashCommand: true,
          command: slashCommand.command,
          response: "Sorry, I couldn't process that command. Please try again!",
        });
      }
    }

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

    // ============================================
    // AI INTEGRATION: Handle AI Bot Responses
    // ============================================

    // Check if the message is sent to AI bot
    if (isAIBot(receiverId)) {
      console.log("🤖 Message sent to AI bot, generating response...");

      try {
        // Check if AI is configured
        if (!isAIConfigured()) {
          console.error("❌ AI not configured - missing API key");
          return;
        }

        // Emit typing indicator to user
        if (senderSocketId) {
          io.to(senderSocketId).emit("aiTyping", {
            userId: receiverId.toString(),
            isTyping: true,
          });
        }

        // Get conversation context (last 10 messages)
        const conversationHistory = await getConversationContext(
          senderId,
          receiverId
        );

        // Check if user wants to summarize current conversation or all chats
        const wantsCurrentConvoSummary = /^\/(summarize|summary)$/i.test(
          message.trim()
        );
        const isAskingAboutAllChats =
          !wantsCurrentConvoSummary &&
          /summarize|summary|chat|conversation|talk|discuss|said|tell me about|what did/i.test(
            message
          );

        let userChatsContext = "";
        if (isAskingAboutAllChats) {
          console.log(
            "💬 User asking about all chats, fetching conversation context..."
          );
          try {
            userChatsContext = await getUserConversationsContext(senderId);
            console.log("✅ Fetched all conversations context successfully");
          } catch (contextError) {
            console.error(
              "❌ Error fetching conversation context:",
              contextError.message
            );
            userChatsContext = ""; // Continue without context
          }
        } else if (wantsCurrentConvoSummary) {
          console.log("📝 User wants summary of current conversation");
          // The conversationHistory already has the current conversation
          // We'll add a note to the AI to specifically summarize this conversation
          userChatsContext =
            "User requested a summary of THIS current conversation. Please provide a concise summary of the conversation history above.";
        }

        // Get AI response from Gemini
        const aiResponseText = await getAIResponse(
          message,
          conversationHistory,
          userChatsContext
        );

        console.log(
          "🤖 AI Response:",
          aiResponseText?.substring(0, 100) + "..."
        );
        console.log("📏 Full AI Response length:", aiResponseText?.length);

        // Validate AI response
        if (
          !aiResponseText ||
          aiResponseText.trim() === "" ||
          aiResponseText.trim() === "..."
        ) {
          throw new Error(`AI response is invalid: "${aiResponseText}"`);
        }

        // Calculate realistic typing delay
        const typingDelay = calculateTypingDelay(aiResponseText);

        // Wait for typing delay to simulate human-like response time
        await new Promise((resolve) => setTimeout(resolve, typingDelay));

        // Stop typing indicator
        if (senderSocketId) {
          io.to(senderSocketId).emit("aiTyping", {
            userId: receiverId.toString(),
            isTyping: false,
          });
        }

        // Create AI response message
        const aiMessage = new MessageModel({
          senderId: receiverId, // AI is the sender
          receiverId: senderId, // User is the receiver
          message: aiResponseText,
          status: "delivered", // AI messages are always delivered
        });

        // Save AI message
        await aiMessage.save();

        // Update conversation
        conversation.messages.push(aiMessage._id);
        conversation.lastMessage = aiMessage._id;

        // Reset user's unread count (they're viewing the conversation)
        const senderIdStr = senderId.toString();
        conversation.unreadCount.set(senderIdStr, 0);

        await conversation.save();

        // Emit AI response to user
        if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", aiMessage);
        }

        console.log("✅ AI response sent successfully");
      } catch (error) {
        console.error("❌ Error generating AI response:", error.message);

        // Send error message to user
        const errorMessage = new MessageModel({
          senderId: receiverId,
          receiverId: senderId,
          message: "Sorry, I encountered an error. Please try again! 🤔",
          status: "delivered",
        });

        await errorMessage.save();
        conversation.messages.push(errorMessage._id);
        await conversation.save();

        if (senderSocketId) {
          io.to(senderSocketId).emit("newMessage", errorMessage);
          io.to(senderSocketId).emit("aiTyping", {
            userId: receiverId.toString(),
            isTyping: false,
          });
        }
      }
    }
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

async function sendFileMessage(req, res) {
  try {
    const receiverId = req.params.id;
    const senderId = req.user._id;
    const file = req.file;
    const caption = req.body.caption || "";

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Determine message type based on mimetype
    let messageType = "file";
    if (file.mimetype.startsWith("image/")) {
      messageType = "image";
    }

    // Find or create conversation
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    // Convert receiverId to string for unread count map
    const receiverIdStr = receiverId.toString();

    // Create file message
    const newMessage = new MessageModel({
      senderId,
      receiverId,
      message: caption,
      messageType: messageType,
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      status: "sent",
    });

    // Add to conversation
    if (newMessage) {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;

      // Increment unread count for receiver
      const currentUnreadCount =
        conversation.unreadCount.get(receiverIdStr) || 0;
      conversation.unreadCount.set(receiverIdStr, currentUnreadCount + 1);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    // Real-time delivery via Socket.IO
    const io = getIO();
    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId.toString());

    // Emit to receiver
    if (receiverSocketId) {
      newMessage.status = "delivered";
      await newMessage.save();
      io.to(receiverSocketId).emit("newMessage", newMessage);

      // Send unread count update
      const unreadCount = conversation.unreadCount.get(receiverIdStr) || 0;
      io.to(receiverSocketId).emit("unreadCountUpdate", {
        conversationId: conversation._id,
        senderId: senderId.toString(),
        unreadCount: unreadCount,
      });

      // Notify sender about delivery
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageStatusUpdate", {
          messageId: newMessage._id,
          status: "delivered",
        });
      }
    }

    // Emit to sender
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendFileMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

// this is named export
module.exports = {
  sendMessage,
  getMessages,
  markMessagesAsRead,
  sendFileMessage,
};
