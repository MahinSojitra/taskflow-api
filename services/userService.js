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
          "This email is already in use. Sign in to your account or pick a different email to proceed with Sign Up.",
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
      message: "You're good to go! Sign in and start exploring our services.",
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
          "We couldn't verify your credentials. Please ensure your email and password are correct. If you've forgotten your password, you can reset it to regain access.",
        statusCode: 401,
      };
    }

    // If the user already has a refresh token, return the same tokens
    if (user.refreshToken) {
      return {
        success: true,
        message:
          "Looks like you're already signed in! No need to knock twice, your session is still active.",
        statusCode: 200,
        data: {
          user: {
            name: user.name,
            email: user.email,
          },
          tokens: {
            accessToken: user.accessToken, // Return the existing access token
            refreshToken: user.refreshToken, // Return the existing refresh token
          },
        },
      };
    }

    // Generate new tokens only if the user is signing in for the first time or refreshToken is missing
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.accessToken = accessToken; // Store the access token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      success: true,
      message: "You've signed in. Glad to have you back.",
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
        message: "No refresh token detected. Please sign in again to continue.",
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
          message:
            "Your session has expired or the refresh token provided is invalid. Please log in again to restore access and continue using our services.",
          statusCode: 401,
        };
      }

      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      await user.save();

      return {
        success: true,
        message:
          "Your token has been refreshed. You can continue using our services without interruption.",
        statusCode: 200,
        data: {
          tokens: { accessToken, refreshToken },
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          "Something went wrong. Please try again later or contact support if the issue persists.",
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
        message:
          "We couldn't find your account. Please sign up or check your details and try again.",
        statusCode: 404,
      };
    }

    if (!user.refreshToken) {
      return {
        success: false,
        message: "You're not signed in. Please sign in first to continue.",
        statusCode: 400,
      };
    }

    user.refreshToken = null;
    await user.save();

    return {
      success: true,
      message: "You've been signed out. Have a great day!",
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
        message:
          "We couldn't find your account. Please sign up or check your details and try again.",
        statusCode: 404,
      };
    }

    return {
      success: true,
      message:
        "Your profile has been updated. All changes have been saved and are now in effect.",
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
          "We couldn't find an account with this email address. Please verify and try again.",
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
      user.passwordResetOTPExpires = Date.now() + 30 * 60 * 1000;
      await user.save();

      // Return the successful email service response
      return emailResult;
    } catch (error) {
      return {
        success: false,
        message:
          "Unable to save the reset token. Please try again or contact support if the issue persists.",
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
          "We couldn't complete your password reset. Please request a fresh OTP and try again.",
        statusCode: 400,
      };
    }

    const isValidOTP = await bcrypt.compare(otp, user.passwordResetOTP);
    if (!isValidOTP) {
      return {
        success: false,
        message:
          "Incorrect OTP. Please re-enter the correct code and continue.",
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
        "Your password has been updated. You can now sign in with your new password.",
      statusCode: 200,
    };
  },

  getAllUsers: async () => {
    const users = await User.find().select("-password -refreshToken");
    return {
      success: true,
      message:
        "User's data has been retrieved. Manage responsibly to safeguard sensitive user information.",
      statusCode: 200,
      data: users,
    };
  },
};

module.exports = userService;
