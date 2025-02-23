const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("./emailService");

// Helper function to generate tokens
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

const userService = {
  // User signup
  signup: async ({ email, password, name }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        message:
          "This email is already registered. Please use a different email or try logging in.",
        statusCode: 409,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashedPassword,
      name,
    });

    return {
      success: true,
      message:
        "Account created successfully! Please login to access your account.",
      statusCode: 201,
    };
  },

  // User signin
  signin: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        success: false,
        message:
          "The email or password you entered is incorrect. Please try again.",
        statusCode: 401,
      };
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      message: "Welcome back! You've successfully signed in.",
      statusCode: 200,
      data: {
        user: {
          name: user.name,
          email: user.email,
        },
        tokens: { accessToken, refreshToken },
      },
    };
  },

  // Token refresh
  refreshToken: async (oldRefreshToken) => {
    if (!oldRefreshToken) {
      return {
        success: false,
        message: "No refresh token provided. Please login again.",
        statusCode: 400,
      };
    }

    try {
      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      const user = await User.findById(decoded.id);

      if (!user || user.refreshToken !== oldRefreshToken) {
        return {
          success: false,
          message: "Invalid or expired refresh token. Please login again.",
          statusCode: 401,
        };
      }

      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      return {
        success: true,
        message: "Token refreshed successfully.",
        statusCode: 200,
        data: {
          tokens: { accessToken, refreshToken },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: "Invalid or expired refresh token. Please login again.",
        statusCode: 401,
      };
    }
  },

  // User logout
  signout: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      return {
        success: false,
        message: "We couldn't find your account. Please login again.",
        statusCode: 404,
      };
    }

    user.refreshToken = null;
    await user.save();

    return {
      success: true,
      message: "You've been successfully signed out. Have a great day!",
      statusCode: 200,
    };
  },

  // Update profile
  updateProfile: async (userId, updateData) => {
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
      return {
        success: false,
        message: "We couldn't find your account. Please login again.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message: "Your profile has been updated successfully!",
      statusCode: 200,
      data: user,
    };
  },

  // Password reset request
  forgotPassword: async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
      return {
        success: false,
        message:
          "No account exists with this email address. Please check and try again.",
        statusCode: 404,
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Try to send email and get response
    const emailResult = await sendPasswordResetEmail(email, otp);

    // If email sending failed, return the error response directly
    if (!emailResult.success) {
      return emailResult;
    }

    // Only save OTP if email was sent successfully
    try {
      user.passwordResetOTP = await bcrypt.hash(otp, 10);
      user.passwordResetOTPExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
      await user.save();

      // Return the successful email service response
      return emailResult;
    } catch (error) {
      return {
        success: false,
        message: "Failed to save reset token. Please try again.",
        error: error.message,
        statusCode: 500,
      };
    }
  },

  // Reset password
  resetPassword: async (email, otp, newPassword) => {
    const user = await User.findOne({
      email,
      passwordResetOTPExpires: { $gt: Date.now() },
    });

    if (!user) {
      return {
        success: false,
        message:
          "Password reset failed. Please request a new OTP and try again.",
        statusCode: 400,
      };
    }

    const isValidOTP = await bcrypt.compare(otp, user.passwordResetOTP);
    if (!isValidOTP) {
      return {
        success: false,
        message:
          "The OTP you entered is incorrect. Please check and try again.",
        statusCode: 400,
      };
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOTP = undefined;
    user.passwordResetOTPExpires = undefined;
    await user.save();

    return {
      success: true,
      message:
        "Your password has been reset! You can now login with your new password.",
      statusCode: 200,
    };
  },

  getAllUsers: async () => {
    const users = await User.find().select("-password -refreshToken");
    return {
      success: true,
      message: "Users retrieved successfully.",
      statusCode: 200,
      data: users,
    };
  },
};

module.exports = userService;
