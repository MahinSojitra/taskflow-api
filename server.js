const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

// Database connection
const startDatabase = async () => {
  try {
    await connectDB();
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error.message);
    process.exit(1);
  }
};

// Server configuration
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📄 Documentation available at http://localhost:${PORT}`);
  });

  // Handle server errors
  server.on("error", (error) => {
    console.error("Server Error:", error);
    process.exit(1);
  });
};

// Global error handlers
const setupErrorHandlers = () => {
  process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
  });
};

// Start application
const startApplication = async () => {
  setupErrorHandlers();
  await startDatabase();
  startServer();
};

startApplication();

module.exports = app;
