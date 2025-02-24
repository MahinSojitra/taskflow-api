const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("./emailService");
const mongoose = require("mongoose");

const generateSessionId = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Helper function to generate tokens
const generateTokens = (userId, sessionId) => {
  const accessToken = jwt.sign(
    {
      id: userId,
      sessionId: sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

  const refreshToken = jwt.sign(
    {
      id: userId,
      sessionId: sessionId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE,
    }
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
  signin: async ({ email, password, deviceInfo, ipAddress }) => {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        success: false,
        message:
          "We couldn't verify your credentials. Please ensure your email and password are correct.",
        statusCode: 401,
      };
    }

    // Simplified device matching using the standardized device info and IP
    const existingSession = user.sessions.find(
      (session) =>
        session.deviceInfo.name === deviceInfo.name &&
        session.deviceInfo.client.name === deviceInfo.client.name &&
        session.deviceInfo.os.name === deviceInfo.os.name &&
        session.ipAddress.type === ipAddress.type &&
        ((ipAddress.type === "ipv4" &&
          session.ipAddress.ipv4 === ipAddress.ipv4) ||
          (ipAddress.type === "ipv6" &&
            session.ipAddress.ipv6 === ipAddress.ipv6)) &&
        session.isValid
    );

    if (existingSession) {
      // Update last active time for existing session
      existingSession.lastActive = new Date(Date.now());
      await user.save();

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
            accessToken: existingSession.accessToken,
            refreshToken: existingSession.refreshToken,
          },
          isExistingSession: true,
        },
      };
    }

    // Create a new session with secure session ID
    const sessionId = generateSessionId();
    const { accessToken, refreshToken } = generateTokens(user._id, sessionId);

    // Add new session with the deviceInfo and ipAddress
    user.sessions.push({
      _id: sessionId,
      refreshToken,
      accessToken,
      deviceInfo,
      ipAddress,
      lastActive: new Date(Date.now()),
      isValid: true,
    });
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
        isExistingSession: false,
      },
    };
  },

  // Token refresh
  refreshToken: async (oldRefreshToken) => {
    if (!oldRefreshToken) {
      return {
        success: false,
        message:
          "Looks like your session ticket is missing. Mind signing in again? It's like getting a fresh VIP pass to continue using our services.",
        statusCode: 400,
      };
    }

    try {
      const decoded = jwt.verify(
        oldRefreshToken,
        process.env.JWT_REFRESH_SECRET
      );
      const user = await User.findById(decoded.id);

      const session = user.sessions.find(
        (s) => s.refreshToken === oldRefreshToken && s.isValid
      );

      if (!session) {
        return {
          success: false,
          message:
            "Your session has expired or is no longer valid. Time for a quick sign-in to get back to the action!",
          statusCode: 401,
        };
      }

      // Generate new access token only
      const { accessToken } = generateTokens(user._id, session._id);

      // Update the session with new access token
      session.accessToken = accessToken;
      session.lastActive = new Date(Date.now());
      await user.save();

      return {
        success: true,
        message:
          "Your session has been renewed. Enjoy using our services again!",
        statusCode: 200,
        data: {
          tokens: {
            accessToken,
            refreshToken: oldRefreshToken,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message:
          "Something's not quite right with your session. Let's start fresh with a new sign-in!",
        statusCode: 401,
      };
    }
  },

  // User logout
  signout: async (userId, sessionId) => {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message:
          "Unable to sign out as no active session was found. You might have already signed out or your session has expired.",
        statusCode: 401,
      };
    }

    // Find and invalidate specific session
    const session = user.sessions.find((s) => s._id === sessionId);
    if (session) {
      // Keep the session but mark it as invalid and clear sensitive data
      session.isValid = false;
      session.lastActive = new Date(Date.now());
      // Keep the tokens but invalidate them by setting to a constant value
      session.accessToken = "SIGNED_OUT";
      session.refreshToken = "SIGNED_OUT";
      await user.save();
    }

    return {
      success: true,
      message: "You've been signed out. Have a great day!",
      statusCode: 200,
    };
  },

  signoutAllDevices: async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message:
          "Unable to sign out as no active sessions were found. You might have already signed out or your sessions have expired.",
        statusCode: 401,
      };
    }

    // Invalidate all sessions but keep them for history
    user.sessions.forEach((session) => {
      session.isValid = false;
      session.lastActive = new Date(Date.now());
      session.accessToken = "SIGNED_OUT";
      session.refreshToken = "SIGNED_OUT";
    });

    await user.save();

    return {
      success: true,
      message: "You've been signed out from all devices. Have a great day!",
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

  // Add this new method to userService
  getActiveSessions: async (userId, currentSessionId, clientTimeZone) => {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "Unable to retrieve your sessions. Please sign in again.",
        statusCode: 401,
      };
    }

    const formatDate = (date, timeZone = "Asia/Kolkata") => {
      try {
        const options = {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone,
        };

        const formatted = new Date(date).toLocaleString("en-US", options);

        // Split into components
        const [weekdayAndDate, timeStr] = formatted.split(" at ");
        const [weekday, month, day, year] = weekdayAndDate
          .split(/[,\s]+/)
          .filter(Boolean);
        const time = timeStr ? timeStr.trim() : "";

        // Reconstruct in desired format
        return `${weekday}, ${month} ${day}, ${year} | ${time}`;
      } catch (error) {
        // Fallback to IST if timezone is invalid
        console.error(`Invalid timezone: ${timeZone}, falling back to IST`);
        return formatDate(date, "Asia/Kolkata");
      }
    };

    const activeSessions = user.sessions
      .filter((session) => session.isValid)
      .map((session) => ({
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        current: session._id === currentSessionId,
        lastActive: formatDate(session.lastActive, clientTimeZone),
      }));

    return {
      success: true,
      message: "Your currently active sessions have been retrieved.",
      statusCode: 200,
      data: activeSessions,
    };
  },
};

module.exports = userService;
