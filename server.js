const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const morgan = require("morgan");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const { errorHandler } = require("./middlewares/errorHandler");
const app = require("./app");

dotenv.config();
const app = express();

// ✅ Connect to Database before starting the server
connectDB()
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((error) => {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  });

// ✅ Middleware Setup
app.use(express.json()); // Ensure JSON body parsing
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// ✅ Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for now (can be configured)
    frameguard: { action: "deny" }, // Prevent Clickjacking
    hidePoweredBy: true, // Hide X-Powered-By header
  })
);

// ✅ CORS Configuration (Set allowed origins via .env)
const allowedOrigins = process.env.CORS_ORIGINS?.split(",") || ["*"];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ✅ Logging Middleware (Only in Development Mode)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

// ✅ Serve API Documentation Page
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Handle Undefined Routes
app.use((req, res, next) => {
  const publicRoutes = {
    "/api/user": {
      "POST /signup": "Create a new account",
      "POST /signin": "Sign in to your account",
    },
    "/api/task": {
      "GET /": "Get all tasks (requires authentication)",
      "POST /": "Create a new task (requires authentication)",
      "GET /:id": "Get task by ID (requires authentication)",
      "PUT /:id": "Update task (requires authentication)",
      "DELETE /:id": "Delete task (requires authentication)",
    },
  };

  const requestedPath = req.path.split("/").slice(0, 3).join("/");

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

// ✅ Global Error Handling Middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ✅ Graceful Shutdown (Handles App Termination)
const shutdown = async (signal) => {
  console.log(`🛑 ${signal} received. Gracefully shutting down...`);
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed");
    server.close(() => {
      console.log("🛑 Server Shutdown Complete");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = app; // For testing purposes
