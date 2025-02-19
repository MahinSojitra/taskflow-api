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

// 404 handler with suggestions (only public routes)
app.use((req, res, next) => {
  const publicRoutes = {
    "/api/users": {
      "POST /signup": "Create a new account",
      "POST /signin": "Sign in to your account",
    },
    "/api/tasks": {
      "GET /": "Get all tasks (requires authentication)",
      "POST /": "Create a new task (requires authentication)",
      "GET /:id": "Get task by ID (requires authentication)",
      "PUT /:id": "Update task (requires authentication)",
      "DELETE /:id": "Delete task (requires authentication)",
    },
  };

  // Get the base path from the requested URL
  const requestedPath = req.path.split("/").slice(0, 3).join("/");

  // Find similar routes for suggestions
  const getSimilarRoutes = (path) => {
    const allPaths = Object.keys(publicRoutes).flatMap((basePath) =>
      Object.keys(publicRoutes[basePath]).map(
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
      message: "Available public endpoints:",
      routes: similarRoutes.length ? similarRoutes : "No similar routes found",
      note: "Some routes require authentication. Please refer to the API documentation for complete details.",
      publicEndpoints: publicRoutes,
    },
  };

  res.status(404).json(errorMessage);
});

// Global error handler - should be last middleware
app.use(errorHandler);

module.exports = app;
