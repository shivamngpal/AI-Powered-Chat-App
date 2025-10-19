const mongoose = require("mongoose");
const UserModel = require("../models/userModel");
require("dotenv").config();

// Fixed AI Bot ID
const AI_BOT_ID = "671a00000000000000000001";

async function updateAIUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Update AI user with new name and branding
    const updatedAI = await UserModel.findByIdAndUpdate(
      AI_BOT_ID,
      {
        name: "Vach AI",
        email: "vachai@assistant.bot",
        profilePic:
          "https://api.dicebear.com/7.x/bottts/svg?seed=VachAI&backgroundColor=667eea",
      },
      { new: true }
    );

    if (!updatedAI) {
      console.log("❌ AI user not found!");
      process.exit(1);
    }

    console.log("🎉 AI User updated successfully!");
    console.log({
      id: updatedAI._id,
      name: updatedAI.name,
      email: updatedAI.email,
      profilePic: updatedAI.profilePic,
    });

    console.log("\n✨ Vach AI is now ready to chat!");
  } catch (error) {
    console.error("❌ Error updating AI user:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
}

updateAIUser();
