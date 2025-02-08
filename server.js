const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();
const app = express();

// ✅ Connect to Database before starting the server
connectDB()
  .then(() => console.log("✅ Database Connected Successfully"))
  .catch((error) => {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1);
  });

// ✅ Middleware
app.use(cors());
app.use(express.json()); // Ensure JSON body parsing
app.use(express.urlencoded({ extended: true })); // For URL-encoded form data
app.use(helmet()); // Security headers

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
  res.status(404).json({ error: "Route not found" });
});

// ✅ Global Error Handling Middleware
app.use(errorHandler);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
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

module.exports = app; // For testing purposes
