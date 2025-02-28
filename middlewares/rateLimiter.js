const rateLimit = require("express-rate-limit");

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    message: "Whoa there! You've reached the request limit.",
    details:
      "Our servers need a quick breather. You can make 100 requests every 15 minutes.",
    tip: "Consider caching responses or implementing request batching to optimize your API usage.",
    nextValidRequestTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Auth endpoints rate limiter (more strict)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    status: "error",
    message: "Security Alert: Too many authentication attempts",
    details:
      "For your security, we limit authentication attempts to 5 per hour.",
    tip: 'If you forgot your password, use the "Forgot Password" option instead of multiple login attempts.',
    nextValidRequestTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    supportEmail: "support@taskflow.com",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API endpoints rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    status: "error",
    message: "API Rate Limit Reached",
    details: "You've reached the limit of 50 API requests per 15 minutes.",
    tips: [
      "Cache frequently accessed data on your end",
      "Batch multiple operations into single requests when possible",
      "Implement exponential backoff for retries",
    ],
    nextValidRequestTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    upgradeInfo: "Need higher limits? Contact us about our premium plans.",
    documentation: "https://taskflowapi.vercel.app/docs/rate-limits",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
};
