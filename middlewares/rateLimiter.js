const rateLimit = require("express-rate-limit");
const { formatDate } = require("../utils/dateFormatter");

// Flag to enable/disable rate limiting globally
let RATE_LIMIT_ENABLED = true;

/**
 * Helper to create detailed rate limit error responses.
 */
function createRateLimitMessage(
  code,
  message,
  details,
  recommendations,
  nextAllowedTime,
  documentation,
  support
) {
  return {
    status: "error",
    code,
    message,
    details,
    recommendations,
    nextAllowedRequest: formatDate({
      date: nextAllowedTime,
      shouldFormatToAppStandard: true,
    }),
    documentation,
    support,
  };
}

/**
 * Conditional rate limiter middleware — activates only if enabled.
 */
function createRateLimiter(options) {
  const limiter = rateLimit(options);
  return (req, res, next) => {
    if (RATE_LIMIT_ENABLED) {
      return limiter(req, res, next);
    }
    next();
  };
}

/**
 * Global limiter — protects overall traffic.
 */
const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: createRateLimitMessage(
    "RATE_LIMIT_EXCEEDED",
    "Request limit exceeded",
    {
      limit: 100,
      windowSize: "15 minutes",
      reason:
        "You have exceeded the maximum number of allowed requests for this time period.",
      impact:
        "This limit helps protect our servers from excessive traffic and ensures fair usage for all users.",
    },
    [
      "Implement client-side caching for frequently accessed resources",
      "Reduce polling frequency for real-time updates",
      "Batch multiple requests into single API calls where possible",
    ],
    new Date(Date.now() + 15 * 60 * 1000),
    "https://taskflowapi.vercel.app/docs/rate-limits",
    {
      email: "taskflow.api@gmail.com",
      documentation: "https://taskflowapi.vercel.app/docs",
    }
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
});

/**
 * Auth limiter — defends against brute-force.
 */
const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: createRateLimitMessage(
    "AUTH_RATE_LIMIT_EXCEEDED",
    "Authentication attempt limit exceeded",
    {
      limit: 5,
      windowSize: "1 hour",
      reason:
        "Multiple authentication attempts detected. This limitation protects user accounts from unauthorized access attempts.",
      impact:
        "Additional authentication attempts will be blocked until the cooling period expires.",
    },
    [
      "Verify your credentials before attempting again",
      "Use the password reset function if you're having trouble accessing your account",
      "Enable two-factor authentication for enhanced security",
    ],
    new Date(Date.now() + 60 * 60 * 1000),
    "https://taskflowapi.vercel.app/docs/rate-limits",
    {
      email: "taskflow.api@gmail.com",
      resetPassword: "https://taskflowapi.vercel.app/api/users/reset-password",
    }
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
});

/**
 * API limiter — protects general API routes.
 */
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: createRateLimitMessage(
    "API_RATE_LIMIT_EXCEEDED",
    "API request limit exceeded",
    {
      limit: 50,
      windowSize: "15 minutes",
      reason:
        "You have reached the maximum number of allowed API requests for this time period.",
      impact:
        "This limit ensures fair API usage and maintains service quality for all users.",
    },
    [
      "Implement response caching using ETags or Cache-Control headers",
      "Use bulk endpoints for multiple operations when available",
      "Implement exponential backoff for failed requests",
      "Consider using webhooks for real-time updates instead of polling",
    ],
    new Date(Date.now() + 15 * 60 * 1000),
    "https://taskflowapi.vercel.app/docs/rate-limits",
    {
      description: "Need higher limits? Consider our premium plans:",
      plans: {
        professional: "200 requests per 15 minutes",
        enterprise: "Custom limits available",
      },
      contact: "taskflow.api@gmail.com",
    }
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false,
});

/**
 * Allows toggling rate limit behavior dynamically.
 */
function toggleRateLimit(enable) {
  RATE_LIMIT_ENABLED = enable;
}

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  toggleRateLimit,
};
