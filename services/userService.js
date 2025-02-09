const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Function to generate a secure API key
const generateApiKey = () => crypto.randomBytes(32).toString("hex");

// ✅ Register a New User
const registerUser = async ({ email, password }) => {
  if (!email || !password) throw new Error("Email and password are required");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
    apiKey: generateApiKey(),
  });

  return {
    success: true,
    message: "Account created, Store your API key securely.",
    credentials: {
      email: newUser.email,
      apiKey: newUser.apiKey,
    },
  };
};

// ✅ Retrieve API Key
const getApiKey = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  return {
    message: "API key retrieved.",
    success: true,
    credentials: {
      apiKey: user.apiKey,
    },
  };
};

// ✅ Regenerate API Key
const regenerateApiKey = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return {
      success: false,
      message: "Invalid email or password.",
      data: null,
    };
  }

  user.apiKey = generateApiKey();
  await user.save();

  return {
    success: true,
    message: "A new API key has been generated. Old key is no longer valid.",
    credentials: {
      apiKey: user.apiKey,
    },
  };
};

module.exports = { registerUser, getApiKey, regenerateApiKey };
