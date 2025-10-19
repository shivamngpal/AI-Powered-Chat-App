const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
require("dotenv").config();

const AI_BOT_ID = "671a00000000000000000001"; // Last char changed from 'ai' to '01'

async function createAIUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Check if AI user already exists
    const existingAI = await UserModel.findById(AI_BOT_ID);

    if (existingAI) {
      console.log("ℹ️  AI user already exists:");
      console.log({
        id: existingAI._id,
        name: existingAI.name,
        email: existingAI.email,
      });
      process.exit(0);
    }

    // Create AI bot user
    const aiUser = await UserModel.create({
      _id: AI_BOT_ID, // Fixed ID so we can easily identify it
      name: "AI Assistant",
      email: "ai@assistant.bot",
      password: "$2a$10$dummyHashNotUsedForAIBot1234567890", // Dummy hash, AI can't login
      profilePic:
        "https://api.dicebear.com/7.x/bottts/svg?seed=AIBot&backgroundColor=b6e3f4",
    });

    console.log("🤖 AI User created successfully!");
    console.log({
      id: aiUser._id,
      name: aiUser.name,
      email: aiUser.email,
      profilePic: aiUser.profilePic,
    });

    console.log("\n✨ You can now chat with the AI Assistant!");
    console.log(`📝 AI Bot ID to use in code: ${AI_BOT_ID}`);
  } catch (error) {
    console.error("❌ Error creating AI user:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the script
createAIUser();
