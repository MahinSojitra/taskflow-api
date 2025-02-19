const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

// Start server
const startServer = () => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

// Initialize application
const initialize = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start server
    startServer();
  } catch (error) {
    console.error("❌ Server initialization failed");
    process.exit(1);
  }
};

// Handle uncaught errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled Rejection:", error.message);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error.message);
});

// Start application
initialize();

module.exports = app;
