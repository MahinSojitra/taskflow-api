const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// ✅ Root route - Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Import API routes
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// ✅ 404 Handler - AI-Enhanced Route Suggestion
app.use((req, res, next) => {
  if (req.path === "/api") {
    return res.redirect("/");
  }

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
      path: "/api/users/signout",
      description: "Sign out from current device",
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

  // Find exact match
  const exactRoute = availableRoutes.find(
    (r) =>
      r.path.toLowerCase() === requestedPath && r.method === requestedMethod
  );

  if (exactRoute) {
    next();
    return;
  }

  // Find similar routes using more sophisticated matching
  const similarRoutes = availableRoutes.filter((r) => {
    const routePath = r.path.toLowerCase();
    const pathSegments = requestedPath.split("/");
    const routeSegments = routePath.split("/");

    // Check for path similarity
    const similarity =
      routeSegments.filter((seg) =>
        pathSegments.some(
          (pathSeg) => pathSeg.includes(seg) || seg.includes(pathSeg)
        )
      ).length / Math.max(routeSegments.length, pathSegments.length);

    return similarity > 0.5; // Adjust threshold as needed
  });

  if (similarRoutes.length > 0) {
    // Check if method is wrong
    const samePathDifferentMethod = similarRoutes.find(
      (r) => r.path.toLowerCase() === requestedPath
    );
    if (samePathDifferentMethod) {
      const methodSuggestions = {
        GET: "retrieve",
        POST: "create",
        PUT: "update",
        DELETE: "delete",
        PATCH: "modify",
      };

      return res.status(405).json({
        success: false,
        message: `Oops! Looks like you're trying to ${
          methodSuggestions[requestedMethod] || "perform an action on"
        } this endpoint, but that's not quite right.`,
        suggestion: `This endpoint exists, but it's designed to ${
          methodSuggestions[samePathDifferentMethod.method] || "handle"
        } data. Try using ${
          samePathDifferentMethod.method
        } instead of ${requestedMethod}.`,
        hint: `Think of it like this: ${samePathDifferentMethod.description}`,
        endpoint: {
          method: samePathDifferentMethod.method,
          path: samePathDifferentMethod.path,
          description: samePathDifferentMethod.description,
        },
      });
    }

    // Group similar endpoints by functionality
    const groupedSuggestions = similarRoutes.reduce((acc, route) => {
      const category = route.path.split("/")[3] || "other"; // Group by resource type
      if (!acc[category]) acc[category] = [];
      acc[category].push(route);
      return acc;
    }, {});

    return res.status(404).json({
      success: false,
      message: `I couldn't find exactly what you're looking for at ${requestedMethod} ${req.path}`,
      suggestion:
        "But I think I know what you might need! Here are some similar endpoints:",
      context: `It looks like you're trying to work with ${
        requestedPath.includes("users") ? "user" : "task"
      } data. Here are the relevant endpoints:`,
      endpoints: groupedSuggestions,
      tips: [
        "Make sure you're using the correct HTTP method",
        "Check if you need authentication for this endpoint",
        "Verify the endpoint path spelling",
        "Consider what you're trying to achieve and match it with the endpoint description",
      ],
    });
  }

  // No similar routes found
  return res.status(404).json({
    success: false,
    message: `I couldn't find the endpoint ${requestedMethod} ${req.path}`,
    suggestion: "Let me help you find what you're looking for!",
    tips: [
      "Here's a complete list of available endpoints",
      "Each endpoint is described with its purpose",
      "You can filter by HTTP method or resource type",
    ],
    endpoints: availableRoutes.reduce((acc, route) => {
      const category = route.path.split("/")[3] || "other";
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        method: route.method,
        path: route.path,
        description: route.description,
        requiresAuth:
          route.path.includes("profile") || route.path.includes("sessions"),
      });
      return acc;
    }, {}),
    documentation:
      "For more detailed information, check out our API documentation at https://taskflowapi.vercel.app/",
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

module.exports = app;
