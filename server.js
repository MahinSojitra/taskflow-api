const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB, getConnectionStatus } = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

class ServerManager {
  constructor() {
    this.server = null;
    this.isShuttingDown = false;
    this.connectionCheckInterval = null;
  }

  async initialize() {
    try {
      // Connect to database
      await connectDB();

      // Start server
      const PORT = process.env.PORT || 3000;
      this.server = app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });

      // Server error handler
      this.server.on("error", this.handleServerError.bind(this));

      // Start connection monitoring
      this.startConnectionMonitoring();

      // Setup cleanup handlers
      this.setupCleanupHandlers();
    } catch (error) {
      console.error("❌ Server initialization failed:", error);
      this.handleFatalError(error);
    }
  }

  startConnectionMonitoring() {
    // Check connection status every 30 seconds
    this.connectionCheckInterval = setInterval(() => {
      const status = getConnectionStatus();
      if (!status.isConnected) {
        console.log("⚠️ Database connection lost, attempting to reconnect...");
        connectDB().catch(console.error);
      }
    }, 30000);
  }

  setupCleanupHandlers() {
    // Graceful shutdown handlers
    const signals = ["SIGTERM", "SIGINT", "SIGHUP"];
    signals.forEach((signal) => {
      process.on(signal, () => this.shutdown(signal));
    });

    // Uncaught error handlers
    process.on("unhandledRejection", (error) => {
      console.error("❌ Unhandled Rejection:", error);
      this.handleFatalError(error);
    });

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      this.handleFatalError(error);
    });
  }

  handleServerError(error) {
    console.error("❌ Server error:", error);
    if (!this.isShuttingDown) {
      this.shutdown("SERVER_ERROR");
    }
  }

  handleFatalError(error) {
    console.error("💥 Fatal error:", error);
    if (!this.isShuttingDown) {
      this.shutdown("FATAL_ERROR");
    }
  }

  async shutdown(signal) {
    if (this.isShuttingDown) return;

    this.isShuttingDown = true;
    console.log(
      `\n🛑 Received ${signal} signal. Starting graceful shutdown...`
    );

    try {
      // Clear monitoring interval
      if (this.connectionCheckInterval) {
        clearInterval(this.connectionCheckInterval);
      }

      // Close server
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve);
        });
        console.log("✅ Server closed successfully");
      }

      // Exit process
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during shutdown:", error);
      process.exit(1);
    }
  }
}

// Start server
const serverManager = new ServerManager();
serverManager.initialize();

module.exports = app;
