const { getAIResponse } = require("../services/aiService");
const { getUserConversationsContext } = require("./aiHelper");

/**
 * Available slash commands for in-chat AI assistance
 */
const SLASH_COMMANDS = {
  AI: "/ai",
  SUMMARIZE: "/summarize",
  TRANSLATE: "/translate",
  EXPLAIN: "/explain",
  FIX: "/fix",
  IMPROVE: "/improve",
  HELP: "/help",
};

/**
 * Check if a message contains a slash command
 * @param {string} message - The message to check
 * @returns {Object|null} - Command object or null
 */
function parseSlashCommand(message) {
  if (!message || !message.trim().startsWith("/")) {
    return null;
  }

  const parts = message.trim().split(" ");
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(" ");

  // Check if it's a valid command
  const validCommand = Object.values(SLASH_COMMANDS).find(
    (cmd) => cmd === command
  );

  if (!validCommand) {
    return null;
  }

  return {
    command,
    args,
    fullMessage: message,
  };
}

/**
 * Execute a slash command and get AI response
 * @param {Object} commandObj - Parsed command object
 * @param {string} userId - User ID executing the command
 * @param {string} conversationId - Current conversation ID
 * @returns {Promise<string>} - AI response
 */
async function executeSlashCommand(commandObj, userId, conversationId) {
  const { command, args } = commandObj;

  try {
    switch (command) {
      case SLASH_COMMANDS.AI:
        return await handleAiCommand(args, userId);

      case SLASH_COMMANDS.SUMMARIZE:
        return await handleSummarizeCommand(userId, conversationId);

      case SLASH_COMMANDS.TRANSLATE:
        return await handleTranslateCommand(args);

      case SLASH_COMMANDS.EXPLAIN:
        return await handleExplainCommand(args);

      case SLASH_COMMANDS.FIX:
        return await handleFixCommand(args);

      case SLASH_COMMANDS.IMPROVE:
        return await handleImproveCommand(args);

      case SLASH_COMMANDS.HELP:
        return getHelpMessage();

      default:
        return "Unknown command. Type /help to see available commands.";
    }
  } catch (error) {
    console.error("❌ Error executing slash command:", error.message);
    return "Sorry, I encountered an error processing your command. Please try again!";
  }
}

/**
 * /ai - Ask AI anything
 */
async function handleAiCommand(query, userId) {
  if (!query || query.trim() === "") {
    return "Please provide a question. Example: /ai What is React?";
  }

  const prompt = `User asked: ${query}\n\nPlease provide a helpful, concise answer.`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /summarize - Summarize current or all conversations
 */
async function handleSummarizeCommand(userId, conversationId) {
  console.log("📝 Summarizing conversations for user...");

  const conversationsContext = await getUserConversationsContext(userId);

  if (
    conversationsContext === "No other conversations found." ||
    conversationsContext ===
      "No other conversations found (only AI conversation exists)."
  ) {
    return "No conversations to summarize yet!";
  }

  const prompt = `Please provide a brief summary of these conversations:\n\n${conversationsContext}\n\nSummary should be concise and highlight key topics discussed.`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /translate - Translate text to another language
 */
async function handleTranslateCommand(args) {
  if (!args || args.trim() === "") {
    return "Please provide text to translate. Example: /translate to Spanish: Hello world";
  }

  const prompt = `Translate the following text. ${args}\n\nProvide only the translation, no explanations.`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /explain - Explain a concept or code
 */
async function handleExplainCommand(args) {
  if (!args || args.trim() === "") {
    return "Please provide something to explain. Example: /explain async/await in JavaScript";
  }

  const prompt = `Explain this clearly and concisely: ${args}`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /fix - Fix grammar, spelling, or code
 */
async function handleFixCommand(args) {
  if (!args || args.trim() === "") {
    return "Please provide text or code to fix. Example: /fix This sentense has erors";
  }

  const prompt = `Fix any grammar, spelling, or code errors in the following:\n\n${args}\n\nProvide the corrected version with a brief explanation of changes.`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /improve - Improve writing or code
 */
async function handleImproveCommand(args) {
  if (!args || args.trim() === "") {
    return "Please provide text or code to improve. Example: /improve Make this email more professional: Hey, can u help?";
  }

  const prompt = `Improve the following to make it better (more professional, clearer, or more efficient):\n\n${args}`;
  const response = await getAIResponse(prompt, []);
  return response;
}

/**
 * /help - Show available commands
 */
function getHelpMessage() {
  return `🤖 **Vach AI Slash Commands**

Available commands:
• **/ai [question]** - Ask AI anything
  Example: /ai What is machine learning?

• **/summarize** - Summarize your conversations
  Example: /summarize

• **/translate [text]** - Translate text
  Example: /translate to French: Hello world

• **/explain [topic]** - Get an explanation
  Example: /explain quantum computing

• **/fix [text/code]** - Fix errors
  Example: /fix This sentense has erors

• **/improve [text/code]** - Improve quality
  Example: /improve Make this sound professional: hey whats up

• **/help** - Show this message

Use these commands in any chat to get instant AI assistance! ✨`;
}

module.exports = {
  SLASH_COMMANDS,
  parseSlashCommand,
  executeSlashCommand,
};
