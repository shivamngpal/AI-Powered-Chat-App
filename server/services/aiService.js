const { GoogleGenerativeAI } = require("@google/generative-ai");
const { AI_CONFIG, SYSTEM_PROMPT } = require("../config/aiConfig");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get AI response from Gemini
 * @param {string} userMessage - The user's message
 * @param {Array} conversationHistory - Previous messages for context
 * @param {string} userChatsContext - User's other conversations context (optional)
 * @returns {Promise<string>} - AI's response
 */
async function getAIResponse(
  userMessage,
  conversationHistory = [],
  userChatsContext = ""
) {
  try {
    // Initialize the model with system instruction (Vach AI identity)
    const model = genAI.getGenerativeModel({
      model: AI_CONFIG.model,
      systemInstruction: SYSTEM_PROMPT, // This sets the AI's identity and behavior
      generationConfig: {
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxOutputTokens,
      },
    });

    // Build the conversation history for context
    // Ensure first message is from user (Gemini requirement)
    let chatHistory = conversationHistory.map((msg) => ({
      role: msg.role, // 'user' or 'model'
      parts: [{ text: msg.text }],
    }));

    // If history exists and first message is from model, remove it
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory = chatHistory.slice(1);
    }

    // Check if user's other conversations context is available
    const hasUserChatsContext =
      userChatsContext &&
      userChatsContext.trim() !== "" &&
      userChatsContext !== "No other conversations found." &&
      userChatsContext !==
        "No other conversations found (only AI conversation exists).";

    // Start a chat session with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        temperature: AI_CONFIG.temperature,
        maxOutputTokens: AI_CONFIG.maxOutputTokens,
      },
    });

    // Build the message to send
    let fullMessage = userMessage;

    // Add user's chat context if available
    if (hasUserChatsContext) {
      // Don't lose context - add the chat data as additional context to the current message
      fullMessage = `I need to answer a question about the user's chat conversations. Here is their conversation data:\n\n${userChatsContext}\n\nUser's Question: ${userMessage}\n\nPlease provide a helpful and concise answer based on the conversation data above.`;
    }

    console.log("📝 Message length:", fullMessage.length);
    console.log("� Chat history length:", chatHistory.length);

    // Send message and get response
    const result = await chat.sendMessage(fullMessage);
    const response = result.response;
    const text = response.text();

    console.log("🤖 AI Response generated successfully");
    console.log("📏 Response length:", text?.length);
    return text;
  } catch (error) {
    console.error("❌ Error getting AI response:", error.message);

    // Handle specific errors with user-friendly messages
    if (
      error.message.includes("API_KEY_INVALID") ||
      error.message.includes("API key")
    ) {
      return "Sorry, I'm having trouble connecting to my AI service. Please contact support. 🔧";
    }

    if (
      error.message.includes("quota") ||
      error.message.includes("RATE_LIMIT")
    ) {
      return "I'm getting too many requests right now. Please wait a moment and try again. ⏳";
    }

    if (error.message.includes("SAFETY")) {
      return "I can't respond to that message due to safety guidelines. Let's talk about something else! 😊";
    }

    // Generic fallback
    return "Sorry, I encountered an error processing your message. Please try again! 🤔";
  }
}

/**
 * Check if Gemini API is configured correctly
 * @returns {boolean}
 */
function isAIConfigured() {
  return !!process.env.GEMINI_API_KEY;
}

module.exports = {
  getAIResponse,
  isAIConfigured,
};
