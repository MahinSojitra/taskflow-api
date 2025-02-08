const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateApiKey = () => crypto.randomBytes(32).toString("hex");

const registerUser = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("Invalid email format");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { message: "User already exists", apiKey: existingUser.apiKey };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    apiKey: generateApiKey(),
  });

  await newUser.save();
  return { message: "User registered successfully", apiKey: newUser.apiKey };
};

const getApiKey = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return { apiKey: user.apiKey };
};

const regenerateApiKey = async (email, password) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  user.apiKey = generateApiKey();
  await user.save();

  return { message: "API Key regenerated successfully", apiKey: user.apiKey };
};

module.exports = { registerUser, getApiKey, regenerateApiKey };
