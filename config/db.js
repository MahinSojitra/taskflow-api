const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      retryWrites: true,
    });

    isConnected = true;
    console.log("✅ Database Connected");
  } catch (error) {
    console.error("❌ Database Connection Error");
    throw error;
  }
};

mongoose.connection.on("connected", () => {
  isConnected = true;
});

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  connectDB(); // Auto reconnect
});

// Export both the connection status and connect function
module.exports = {
  connectDB,
  isConnected: () => isConnected,
};
