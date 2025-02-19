const express = require("express");
const { errorHandler, AppError } = require("./middlewares/errorHandler");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
// ... other imports ...

const app = express();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler with suggestions
app.use((req, res, next) => {
  const availableRoutes = {
    "/api/users": {
      "POST /signup": "Create a new account",
      "POST /signin": "Sign in to your account",
      "GET /profile": "Get user profile",
      "PUT /profile": "Update user profile",
      "POST /forgot-password": "Request password reset",
      "POST /reset-password": "Reset password",
      "POST /refresh-token": "Refresh access token",
    },
    "/api/tasks": {
      "GET /": "Get all tasks",
      "POST /": "Create a new task",
      "GET /:id": "Get task by ID",
      "PUT /:id": "Update task",
      "DELETE /:id": "Delete task",
    },
  };

  // Get the base path from the requested URL
  const requestedPath = req.path.split("/").slice(0, 3).join("/");

  // Find similar routes for suggestions
  const getSimilarRoutes = (path) => {
    const allPaths = Object.keys(availableRoutes).flatMap((basePath) =>
      Object.keys(availableRoutes[basePath]).map(
        (route) => basePath + route.split(" ")[1]
      )
    );

    return allPaths.filter(
      (route) =>
        route.includes(path) ||
        path.includes(route) ||
        route.toLowerCase().includes(path.toLowerCase())
    );
  };

  const similarRoutes = getSimilarRoutes(req.path);

  const errorMessage = {
    success: false,
    status: "fail",
    message: `Cannot ${req.method} ${req.path}`,
    error: "Route not found",
    suggestions: {
      message: "Here are some similar available routes:",
      routes: similarRoutes.length ? similarRoutes : "No similar routes found",
      availableEndpoints: {
        message: "All available endpoints:",
        ...availableRoutes,
      },
    },
  };

  res.status(404).json(errorMessage);
});

// Global error handler - should be last middleware
app.use(errorHandler);

module.exports = app;
