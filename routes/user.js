const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const router = express.Router();

// Generate API Key
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// Register User
router.post("/register", async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: "Username is required" });

  let user = await User.findOne({ username });
  if (user)
    return res.json({ message: "User already exists", apiKey: user.apiKey });

  const newUser = new User({ username, apiKey: generateApiKey() });
  await newUser.save();
  res.json({ message: "User registered successfully", apiKey: newUser.apiKey });
});

// Get API Key
router.get("/apikey", async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Username is required" });

  let user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ apiKey: user.apiKey });
});

module.exports = router;
