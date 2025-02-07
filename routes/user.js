const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const router = express.Router();

// Generate API Key
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// Register User & Generate API Key
router.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  let user = await User.findOne({ email });
  if (user)
    return res.json({ message: "User already exists", apiKey: user.apiKey });

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    apiKey: generateApiKey(),
  });

  await newUser.save();
  res.json({ message: "User registered successfully", apiKey: newUser.apiKey });
});

// Get API Key using Email & Password
router.post("/apikey", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  let user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ apiKey: user.apiKey });
});

// Regenerate API Key (Replace Old Key)
router.post("/regenerate-key", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  let user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  user.apiKey = generateApiKey();
  await user.save();

  res.json({
    message: "API Key regenerated successfully",
    apiKey: user.apiKey,
  });
});

module.exports = router;
