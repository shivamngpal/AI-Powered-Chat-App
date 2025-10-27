const rateLimit = require("express-rate-limit");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    msg: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    msg: "Too many authentication attempts, please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Password reset limiter
const resetPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 reset requests per hour
  message: {
    success: false,
    msg: "Too many password reset attempts, please try again after 1 hour.",
  },
});

// Message sending limiter
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 messages per minute
  message: {
    success: false,
    msg: "You're sending messages too quickly. Please slow down.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  resetPasswordLimiter,
  messageLimiter,
};
