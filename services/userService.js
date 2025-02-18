const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const crypto = require("crypto");

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

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
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
      tokens,
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

exports.refreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Refresh token is required.");
  }

  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token.");
  }

  const tokens = generateTokens(user._id);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return {
    success: true,
    data: { tokens },
  };
};

exports.logout = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  user.refreshToken = null;
  await user.save();
};

exports.updateProfile = async (userId, updateData) => {
  const allowedUpdates = ["name", "email"];
  const updates = Object.keys(updateData)
    .filter((key) => allowedUpdates.includes(key))
    .reduce((obj, key) => {
      obj[key] = updateData[key];
      return obj;
    }, {});

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  }).select("-password -refreshToken");

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};

exports.forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // Here you would typically send an email with the reset token
  // For now, we'll just return success
};

exports.resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token.");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
};

module.exports = {
  registerUser,
  getApiKey,
  regenerateApiKey,
  refreshToken,
  logout,
  updateProfile,
  forgotPassword,
  resetPassword,
};
