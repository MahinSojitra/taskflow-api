const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

// ✅ Register a New User
const registerUser = async ({ email, password, name }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    name,
  });

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return {
    success: true,
    message: "Account created.",
    data: {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
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

// Add more authentication-related functions...

module.exports = { registerUser, getApiKey, regenerateApiKey };
