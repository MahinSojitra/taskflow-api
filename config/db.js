const mongoose = require("mongoose");

class DatabaseConnection {
  constructor() {
    this.isConnected = false;
    this.connection = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectInterval = 5000; // 5 seconds
  }

  async connect() {
    try {
      // Return existing connection if valid
      if (
        this.isConnected &&
        this.connection &&
        mongoose.connection.readyState === 1
      ) {
        return this.connection;
      }

      // Reset connection state
      this.isConnected = false;
      this.connection = null;

      // Connect with robust options
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        keepAliveInitialDelay: 300000, // 5 minutes
        connectTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 45000, // 45 seconds
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        heartbeatFrequencyMS: 10000, // 10 seconds
        autoIndex: true,
        retryWrites: true,
        w: "majority",
        maxIdleTimeMS: 60000, // 1 minute
      });

      // Cache connection
      this.connection = conn;
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log("✅ Database Connected");

      // Connection event handlers
      mongoose.connection.on("connected", () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log("🔄 MongoDB connected");
      });

      mongoose.connection.on("disconnected", () => {
        this.isConnected = false;
        console.log("⚠️ MongoDB disconnected");
        this.handleDisconnect();
      });

      mongoose.connection.on("error", (error) => {
        console.error("❌ MongoDB connection error:", error);
        this.handleError(error);
      });

      // Cleanup handlers
      process.on("SIGINT", () => this.cleanup("SIGINT"));
      process.on("SIGTERM", () => this.cleanup("SIGTERM"));
      process.on("SIGHUP", () => this.cleanup("SIGHUP"));

      return this.connection;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );
      setTimeout(() => this.connect(), this.reconnectInterval);
    } else {
      console.error("❌ Max reconnection attempts reached");
    }
  }

  async handleError(error) {
    this.isConnected = false;
    this.connection = null;
    console.error("❌ Database Error:", error.message);
    await this.handleDisconnect();
    throw error;
  }

  async cleanup(signal) {
    try {
      console.log(`📥 Received ${signal} signal`);
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
        console.log("✅ Database connection closed gracefully");
      }
    } catch (error) {
      console.error("❌ Error during cleanup:", error);
    } finally {
      process.exit(0);
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

module.exports = {
  connectDB: () => dbConnection.connect(),
  getConnectionStatus: () => dbConnection.getStatus(),
};
