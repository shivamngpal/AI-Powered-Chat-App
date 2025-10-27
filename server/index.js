const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const { initSocket } = require("./socket/socket.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");
const validateEnv = require("./config/validateEnv");
const securityMiddleware = require("./middleware/noSqlInjection");

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
validateEnv();

// we can use env variables using process.env.VARIABLE_NAME
const port = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Create HTTP server from Express app
const server = http.createServer(app);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(() => console.log("Error occured"));

// INIT Socket.io
const io = initSocket(server);

// Security middleware - Helmet.js adds security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Needed for Socket.IO
  })
);

// CORS configuration
const allowedOrigins = process.env.CLIENT_URL
  ? [process.env.CLIENT_URL]
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// middlewares
app.use(express.json());
app.use(cookieParser());

// Security sanitization middleware (protects against NoSQL injection & basic XSS)
app.use(securityMiddleware); // Express 5 compatible

// Rate limiting for API routes
app.use("/api", apiLimiter);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

// Instead of app.listen, use server.listen
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  server.close(() => {
    mongoose.connection.close();
    console.log("Server closed");
    process.exit(0);
  });
});

// No need to export io - it's available through getIO() from socket/socket.js
