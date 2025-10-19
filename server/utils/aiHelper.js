const { AI_BOT_ID, AI_CONFIG } = require("../config/aiConfig");
const ConversationModel = require("../models/conversationModel");

/**
 * Check if a user ID is the AI bot
 * @param {string} userId - User ID to check
 * @returns {boolean}
 */
function isAIBot(userId) {
  return userId && userId.toString() === AI_BOT_ID;
}

/**
 * Extract conversation context for AI
 * Fetches recent messages and formats them for Gemini API
 *
 * @param {string} senderId - User sending the message
 * @param {string} receiverId - AI bot ID
 * @returns {Promise<Array>} - Formatted conversation history
 */
async function getConversationContext(senderId, receiverId) {
  try {
    // Find conversation between user and AI
    const conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages",
      options: {
        sort: { createdAt: 1 }, // Oldest first
        limit: AI_CONFIG.contextMessageLimit * 2, // Get more, then filter
      },
      populate: {
        path: "senderId",
        select: "name",
      },
    });

    if (
      !conversation ||
      !conversation.messages ||
      conversation.messages.length === 0
    ) {
      console.log("📭 No conversation history found");
      return [];
    }

    // Get last N messages (configured limit)
    const recentMessages = conversation.messages.slice(
      -AI_CONFIG.contextMessageLimit
    );

    // Format for Gemini API
    const formattedHistory = recentMessages.map((msg) => ({
      role: isAIBot(msg.senderId._id || msg.senderId) ? "model" : "user",
      text: msg.message,
    }));

    console.log(`📚 Extracted ${formattedHistory.length} messages for context`);
    return formattedHistory;
  } catch (error) {
    console.error("❌ Error getting conversation context:", error.message);
    return []; // Return empty context on error, AI will still respond
  }
}

/**
 * Get all user conversations (excluding AI conversation) for context
 * @param {string} userId - User ID to get conversations for
 * @returns {Promise<string>} - Formatted conversation summaries
 */
async function getUserConversationsContext(userId) {
  try {
    // Find all conversations for this user (exclude AI bot conversation)
    const conversations = await ConversationModel.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "name email",
      })
      .populate({
        path: "messages",
        options: {
          sort: { createdAt: -1 }, // Most recent first
          limit: 30, // Last 30 messages per conversation (increased for better context)
        },
        populate: {
          path: "senderId",
          select: "name",
        },
      })
      .sort({ updatedAt: -1 })
      .limit(5); // Get last 5 active conversations

    if (!conversations || conversations.length === 0) {
      console.log("📭 No conversations found for user");
      return "No other conversations found.";
    }

    // Format conversations for AI
    let contextText = "Here are your recent conversations:\n\n";
    let conversationCount = 0;

    conversations.forEach((conv) => {
      try {
        // Skip if no participants or messages
        if (
          !conv.participants ||
          !conv.messages ||
          conv.messages.length === 0
        ) {
          return;
        }

        // Get the other participant (not the current user and not AI bot)
        const otherParticipant = conv.participants.find(
          (p) =>
            p &&
            p._id &&
            p._id.toString() !== userId.toString() &&
            !isAIBot(p._id)
        );

        if (!otherParticipant) return; // Skip AI conversation or invalid participant

        conversationCount++;
        contextText += `Conversation ${conversationCount} - with ${
          otherParticipant.name || "Unknown"
        }:\n`;

        // Get last 15 messages (increased for better context)
        const recentMessages = conv.messages.slice(0, 15).reverse(); // Show oldest to newest
        recentMessages.forEach((msg) => {
          if (!msg || !msg.senderId || !msg.message) return; // Skip invalid messages

          const senderId = msg.senderId._id || msg.senderId;
          const senderName =
            senderId.toString() === userId.toString()
              ? "You"
              : msg.senderId.name || "Unknown";
          contextText += `  ${senderName}: ${msg.message}\n`;
        });

        contextText += "\n";
      } catch (convError) {
        console.error("❌ Error processing conversation:", convError.message);
        // Continue with next conversation
      }
    });

    if (conversationCount === 0) {
      return "No other conversations found (only AI conversation exists).";
    }

    console.log(
      `✅ Formatted ${conversationCount} conversations for AI context`
    );
    return contextText;
  } catch (error) {
    console.error("❌ Error getting user conversations:", error.message);
    console.error("Stack trace:", error.stack);
    return "Unable to access your conversations at the moment.";
  }
}

/**
 * Simulate typing delay for more natural AI responses
 * @param {string} message - The message to calculate typing time for
 * @returns {number} - Delay in milliseconds
 */
function calculateTypingDelay(message) {
  // Simulate ~50 words per minute typing speed
  const wordsPerMinute = 50;
  const words = message.split(" ").length;
  const minutes = words / wordsPerMinute;
  const milliseconds = minutes * 60 * 1000;

  // Cap between 500ms and 3000ms for better UX
  return Math.min(Math.max(milliseconds, 500), 3000);
}

module.exports = {
  isAIBot,
  getConversationContext,
  getUserConversationsContext,
  calculateTypingDelay,
};
