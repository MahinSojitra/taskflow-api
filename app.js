const express = require("express");
const cors = require("cors");
const path = require("path");
const hpp = require("hpp");
const { errorHandler } = require("./middlewares/errorHandler");
const {
  globalLimiter,
  authLimiter,
  apiLimiter,
} = require("./middlewares/rateLimiter");

const app = express();

// ✅ Security Middleware
app.use(cors());
app.use(hpp());
app.use(globalLimiter);

// ✅ Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Documentation Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/docs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "docs", "docs.html"));
});

app.get("/docs/rate-limits", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "docs", "rate-limits", "rate-limits.html")
  );
});

// ✅ Import API routes
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

// Apply specific rate limiters to routes
app.use("/api/users/signin", authLimiter); // Stricter rate limiting for auth endpoints
app.use("/api/users/signup", authLimiter);
app.use("/api", apiLimiter); // General API rate limiting

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ 404 Handler - Improved Route Suggestion
app.use((req, res, next) => {
  const availableRoutes = [
    {
      method: "POST",
      path: "/api/users/signup",
      description: "Create new account",
    },
    {
      method: "POST",
      path: "/api/users/signin",
      description: "Sign in to account",
    },
    {
      method: "GET",
      path: "/api/users/profile",
      description: "Get user profile",
    },
    {
      method: "PUT",
      path: "/api/users/profile",
      description: "Update profile",
    },
    {
      method: "POST",
      path: "/api/users/signout",
      description: "Sign out",
    },
    {
      method: "POST",
      path: "/api/users/forgot-password",
      description: "Request password reset",
    },
    {
      method: "POST",
      path: "/api/users/reset-password",
      description: "Reset password with OTP",
    },
    {
      method: "POST",
      path: "/api/users/refresh",
      description: "Refresh access token",
    },
    {
      method: "POST",
      path: "/api/users/signout-all",
      description: "Sign out from all devices",
    },
    {
      method: "GET",
      path: "/api/users/sessions",
      description: "Get all active sessions",
    },
    {
      method: "GET",
      path: "/api/users/all",
      description: "List all users (admin only)",
    },
    // Task routes
    { method: "GET", path: "/api/tasks", description: "List all tasks" },
    { method: "POST", path: "/api/tasks", description: "Create new task" },
    { method: "GET", path: "/api/tasks/:id", description: "Get task details" },
    { method: "PUT", path: "/api/tasks/:id", description: "Update task" },
    { method: "DELETE", path: "/api/tasks/:id", description: "Delete task" },
    {
      method: "GET",
      path: "/api/tasks/all",
      description: "List all tasks (admin only)",
    },
  ];

  const requestedPath = req.path.toLowerCase();
  const requestedMethod = req.method;

  // Function to calculate similarity between two strings
  const calculateSimilarity = (str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1)
      .fill()
      .map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    return matrix[len1][len2];
  };

  // Find routes with similar paths
  const similarRoutes = availableRoutes
    .map((route) => ({
      ...route,
      similarity: calculateSimilarity(requestedPath, route.path.toLowerCase()),
      // Check if paths share common segments
      commonSegments: requestedPath
        .split("/")
        .filter((segment) =>
          route.path.toLowerCase().includes(segment.toLowerCase())
        ).length,
    }))
    .sort((a, b) => {
      // Prioritize routes with more common segments
      if (a.commonSegments !== b.commonSegments) {
        return b.commonSegments - a.commonSegments;
      }
      // Then by similarity score
      return a.similarity - b.similarity;
    });

  const bestMatch = similarRoutes[0];

  if (
    bestMatch &&
    (bestMatch.similarity <= 3 || bestMatch.commonSegments >= 2)
  ) {
    let message = `Route ${requestedMethod} ${requestedPath} not found`;
    let suggestion = "";

    // Check if it's just a method mismatch
    if (bestMatch.path.toLowerCase() === requestedPath) {
      suggestion = `Use ${bestMatch.method} instead of ${requestedMethod}.`;
    }
    // Check if it's a very close path match (1-2 characters difference)
    else if (bestMatch.similarity <= 2) {
      suggestion = `Did you mean ${bestMatch.method} ${bestMatch.path} ?`;
    }
    // For other similar paths
    else {
      suggestion = `Did you mean ${bestMatch.method} ${bestMatch.path} ?`;
    }

    return res.status(404).json({
      message: message,
      suggestion: suggestion,
    });
  }

  // If no similar route found
  return res.status(404).json({
    message: `Route ${requestedMethod} ${requestedPath} not found`,
    suggestion: "Check API documentation at https://taskflowapi.vercel.app/",
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

module.exports = app;
