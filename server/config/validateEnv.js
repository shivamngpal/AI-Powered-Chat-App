const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "PORT", "GEMINI_API_KEY"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
    console.error("\nPlease check your .env file and try again.");
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");
};

module.exports = validateEnv;
