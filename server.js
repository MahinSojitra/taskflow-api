const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure MongoDB connection doesn't crash app
connectDB().catch((err) => {
  console.error("Database Connection Failed:", err);
  process.exit(1);
});

// API Routes
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);

// Serve Documentation Page
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Port Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
