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

      // Connect with supported options
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        family: 4,
        directConnection: false,
        retryWrites: true,
        w: "majority",
        ssl: true,
        authSource: "admin",
        replicaSet: "atlas-4g7cgb-shard-0",
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
      if (error.message.includes("IP whitelist")) {
        console.error(
          "🔒 IP Whitelist Error: Please add Vercel IP ranges to MongoDB Atlas"
        );
        console.error("Add these IPs: 76.76.21.0/24, 76.76.21.21");
      }
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
