const express = require("express");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

class ServerManager {
  constructor() {
    this.server = null;
  }

  async initialize() {
    try {
      // Ensure a stable database connection before starting the server
      await connectDB();

      const PORT = process.env.PORT || 3000;
      this.server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });

      this.server.on("error", this.handleServerError.bind(this));

      // Graceful shutdown handlers
      process.on("SIGTERM", () => this.shutdown("SIGTERM"));
      process.on("SIGINT", () => this.shutdown("SIGINT"));
    } catch (error) {
      console.error("❌ Server failed to start:", error);
      process.exit(1);
    }
  }

  async shutdown(signal) {
    console.log(`🛑 Received ${signal}. Shutting down server...`);
    if (this.server) {
      await new Promise((resolve) => this.server.close(resolve));
      console.log("✅ Server shut down gracefully.");
    }
    process.exit(0);
  }
}

// Start server
const serverManager = new ServerManager();
serverManager.initialize();

module.exports = app;
