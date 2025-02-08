const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Generate API Key
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// 📌 Register a New User
exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({
        message: "User already exists",
        apiKey: existingUser.apiKey,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      apiKey: generateApiKey(),
    });

    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      apiKey: newUser.apiKey,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Retrieve API Key using Email & Password
exports.getApiKey = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({ apiKey: user.apiKey });
  } catch (error) {
    next(error);
  }
};

// 📌 Regenerate API Key
exports.regenerateApiKey = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.apiKey = generateApiKey();
    await user.save();

    res.json({
      message: "API Key regenerated successfully",
      apiKey: user.apiKey,
    });
  } catch (error) {
    next(error);
  }
};
