const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet"); // Security middleware
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const errorHandler = require("./middlewares/errorHandler");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Security headers

// Connect to Database
(async () => {
  try {
    await connectDB();
    console.log("✅ Database Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed:", error);
    process.exit(1); // Stop the app if DB connection fails
  }
})();

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

// Serve API Documentation Page
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error Handling Middleware
app.use(errorHandler); // Handles all errors

// Port Configuration
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);

// Graceful Shutdown (Handles App Termination)
process.on("SIGINT", async () => {
  console.log("🛑 Graceful Shutdown Initiated...");
  try {
    await mongoose.connection.close();
    console.log("✅ MongoDB Connection Closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

module.exports = app; // For testing purposes
