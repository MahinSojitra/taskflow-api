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

// ✅ 404 Handler - Improved Route Suggestion
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
    { method: "POST", path: "/api/users/signout", description: "Sign out" },
    { method: "GET", path: "/api/tasks", description: "List all tasks" },
    { method: "POST", path: "/api/tasks", description: "Create new task" },
    { method: "GET", path: "/api/tasks/:id", description: "Get task details" },
    { method: "PUT", path: "/api/tasks/:id", description: "Update task" },
    { method: "DELETE", path: "/api/tasks/:id", description: "Delete task" },
    {
      method: "GET",
      path: "/api/users/all",
      description: "List all users (admin only)",
    },
    {
      method: "GET",
      path: "/api/tasks/all",
      description: "List all tasks (admin only)",
    },
  ];

  const requestedRoute = `${req.method} ${req.path}`;
  const similarRoute = availableRoutes.find(
    (r) => r.path.toLowerCase() === req.path.toLowerCase()
  );

  if (!similarRoute) {
    return res.status(404).json({
      success: false,
      message: `Route ${requestedRoute} not found`,
      suggestion: "Check API documentation at /",
    });
  }

  if (req.method !== similarRoute.method) {
    return res.status(405).json({
      success: false,
      message: `Method ${req.method} not allowed for ${req.path}`,
      suggestion: `Use ${similarRoute.method} instead`,
    });
  }

  next();
});

// ✅ Global Error Handler
app.use(errorHandler);

module.exports = app;
