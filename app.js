const express = require("express");
const cors = require("cors");
const path = require("path");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Root route - Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Import routes
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

// API routes (place before 404 handler)
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res, next) => {
  if (req.path === "/api") {
    return res.redirect("/");
  }

  // API routes error handling
  const availableRoutes = {
    // User routes
    "POST /api/users/signup": "Create new account",
    "POST /api/users/signin": "Sign in to account",
    "GET /api/users/profile": "Get user profile",
    "PUT /api/users/profile": "Update profile",
    "POST /api/users/signout": "Sign out",

    // Task routes
    "GET /api/tasks": "List all tasks",
    "POST /api/tasks": "Create new task",
    "GET /api/tasks/:id": "Get task details",
    "PUT /api/tasks/:id": "Update task",
    "DELETE /api/tasks/:id": "Delete task",

    // Admin routes
    "GET /api/users/all": "List all users (only admin can access)",
    "GET /api/tasks/all": "List all users tasks (only admin can access)",
  };

  // Check if the route exists in our available routes
  const similarRoute = Object.keys(availableRoutes).find(
    (route) =>
      route.toLowerCase().includes(req.path.toLowerCase()) ||
      req.path.toLowerCase().includes(route.split(" ")[1].toLowerCase())
  );

  // If no similar route found, send 404
  if (!similarRoute) {
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      suggestion: "Check documentation at /",
    });
  }

  // If similar route found, suggest it
  if (req.path !== similarRoute.split(" ")[1]) {
    return res.status(404).json({
      success: false,
      message: `Route ${req.method} ${req.path} not found`,
      suggestion: `Did you mean ${similarRoute}?`,
    });
  }

  // If route exists but method doesn't match
  if (req.method !== similarRoute.split(" ")[0]) {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed for ${req.path}`,
      suggestion: `Use ${similarRoute.split(" ")[0]} instead`,
    });
  }

  next();
});

// Global error handler
app.use(errorHandler);

module.exports = app;
