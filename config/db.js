const mongoose = require("mongoose");

class DatabaseConnection {
  constructor() {
    if (!globalThis._mongoose) {
      globalThis._mongoose = {
        conn: null,
        promise: null,
      };
    }
  }

  async connect() {
    if (globalThis._mongoose.conn) {
      console.log("✅ Using existing database connection");
      return globalThis._mongoose.conn;
    }

    if (!globalThis._mongoose.promise) {
      console.log("🚀 Establishing new database connection...");
      globalThis._mongoose.promise = mongoose
        .connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10, // Reduce pool size for serverless environment
          serverSelectionTimeoutMS: 30000, // Lower timeout to prevent long delays
          socketTimeoutMS: 45000, // Keep socket timeout lower
          ssl: true,
          authSource: "admin",
          retryWrites: true,
          w: "majority",
        })
        .then((mongoose) => {
          console.log("✅ Database Connected Successfully");
          return mongoose;
        })
        .catch((error) => {
          console.error("❌ Database Connection Failed:", error);
          globalThis._mongoose.promise = null;
          throw error;
        });
    }

    globalThis._mongoose.conn = await globalThis._mongoose.promise;
    return globalThis._mongoose.conn;
  }
}

// Singleton instance
const dbConnection = new DatabaseConnection();

module.exports = {
  connectDB: () => dbConnection.connect(),
};
