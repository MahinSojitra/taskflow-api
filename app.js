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

// Import routes
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

// Root route - Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

// 404 handler
app.use((req, res, next) => {
  // Redirect non-API routes to root
  if (!req.path.startsWith("/api")) {
    return res.redirect("/");
  }

  // API routes error handling
  const availableRoutes = {
    // User routes
    "POST /api/users/signup": "Create new account",
    "POST /api/users/signin": "Sign in to account",
    "GET /api/users/profile": "Get user profile (auth)",
    "PUT /api/users/profile": "Update profile (auth)",
    "POST /api/users/signout": "Sign out (auth)",

    // Task routes
    "GET /api/tasks": "List all tasks (auth)",
    "POST /api/tasks": "Create new task (auth)",
    "GET /api/tasks/:id": "Get task details (auth)",
    "PUT /api/tasks/:id": "Update task (auth)",
    "DELETE /api/tasks/:id": "Delete task (auth)",

    // Admin routes
    "GET /api/tasks/admin/all": "List all users tasks (admin)",
  };

  const similarRoute = Object.keys(availableRoutes).find((route) =>
    route.toLowerCase().includes(req.path.toLowerCase())
  );

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    suggestion: similarRoute
      ? `Did you mean ${similarRoute}?`
      : "Check documentation at /",
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
