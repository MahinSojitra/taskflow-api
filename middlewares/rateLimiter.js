const rateLimit = require("express-rate-limit");
const { RateLimiterMemory } = require("rate-limiter-flexible");

// Sliding window rate limiter for memory
const rateLimiterMemory = new RateLimiterMemory({
  points: 100, // Number of points
  duration: 60, // Per 60 seconds
});

// Global rate limiter - General purpose protection
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: "error",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Request limit exceeded",
    details: {
      limit: 100,
      windowSize: "15 minutes",
      reason:
        "You have exceeded the maximum number of allowed requests for this time period.",
      impact:
        "This limit helps protect our servers from excessive traffic and ensures fair usage for all users.",
    },
    recommendations: [
      "Implement client-side caching for frequently accessed resources",
      "Reduce polling frequency for real-time updates",
      "Batch multiple requests into single API calls where possible",
    ],
    nextAllowedRequest: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    documentation: "https://taskflowapi.vercel.app/docs/rate-limits",
    support: {
      email: "taskflow.api@gmail.com",
      documentation: "https://taskflowapi.vercel.app/docs",
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
});

// Authentication rate limiter - Strict protection against brute force
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Stricter limit: 5 attempts per hour per IP
  message: {
    status: "error",
    code: "AUTH_RATE_LIMIT_EXCEEDED",
    message: "Authentication attempt limit exceeded",
    details: {
      limit: 5,
      windowSize: "1 hour",
      reason:
        "Multiple authentication attempts detected. This limitation protects user accounts from unauthorized access attempts.",
      impact:
        "Additional authentication attempts will be blocked until the cooling period expires.",
    },
    securityAdvice: [
      "Verify your credentials before attempting again",
      "Use the password reset function if you're having trouble accessing your account",
      "Enable two-factor authentication for enhanced security",
    ],
    nextAllowedAttempt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    documentation: "https://taskflowapi.vercel.app/docs/rate-limits",
    support: {
      email: "taskflow.api@gmail.com",
      resetPassword: "https://taskflowapi.vercel.app/api/users/reset-password",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests against the rate limit
});

// API endpoints rate limiter - Balanced protection for API resources
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 API requests per 15 minutes
  message: {
    status: "error",
    code: "API_RATE_LIMIT_EXCEEDED",
    message: "API request limit exceeded",
    details: {
      limit: 50,
      windowSize: "15 minutes",
      reason:
        "You have reached the maximum number of allowed API requests for this time period.",
      impact:
        "This limit ensures fair API usage and maintains service quality for all users.",
    },
    technicalGuidance: [
      "Implement response caching using ETags or Cache-Control headers",
      "Use bulk endpoints for multiple operations when available",
      "Implement exponential backoff for failed requests",
      "Consider using webhooks for real-time updates instead of polling",
    ],
    nextAllowedRequest: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    documentation: "https://taskflowapi.vercel.app/docs/rate-limits",
    upgradeOptions: {
      description: "Need higher limits? Consider our premium plans:",
      plans: {
        professional: "200 requests per 15 minutes",
        enterprise: "Custom limits available",
      },
      contact: "taskflow.api@gmail.com",
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests against the rate limit
});

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  rateLimiterMemory,
};
