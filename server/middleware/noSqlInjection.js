// Custom security sanitizer for Express 5+
// Removes prohibited characters from request body, query, and params
// Protects against NoSQL injection and basic XSS

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  // Remove dangerous HTML/Script tags for basic XSS protection
  return str
    .replace(/<script[^>]*>.*?<\/script>/gi, "") // Remove script tags
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, "") // Remove iframe tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ""); // Remove inline event handlers (onclick, onerror, etc.)
};

const sanitize = (payload) => {
  if (typeof payload !== "object" || payload === null) {
    return sanitizeString(payload);
  }

  if (Array.isArray(payload)) {
    return payload.map(sanitize);
  }

  const sanitized = {};
  for (const key in payload) {
    // Remove keys that start with $ or contain . (NoSQL injection)
    if (key.startsWith("$") || key.includes(".")) {
      continue;
    }

    const value = payload[key];

    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

const securityMiddleware = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === "object") {
      req.body = sanitize(req.body);
    }

    // Sanitize params
    if (req.params && typeof req.params === "object") {
      req.params = sanitize(req.params);
    }

    // Note: req.query is read-only in Express 5, but Zod validation handles query params
    // The query params are validated at the route level

    next();
  } catch (error) {
    console.error("Error in security middleware:", error);
    next(error);
  }
};

module.exports = securityMiddleware;
