const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");

// ✅ Set the port dynamically for deployment or fallback to 5000
const PORT = process.env.PORT || 5000;

// ✅ Function to start the server
const startServer = async () => {
  try {
    // ✅ Connect to the database
    await connectDB();
    console.log("✅ Database Connected Successfully");

    // ✅ Start the server
    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // ✅ Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.error("❌ Unhandled Rejection:", err.message);
      server.close(() => process.exit(1));
    });

    // ✅ Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error.message);
    process.exit(1);
  }
};

// ✅ Start the server
startServer();
