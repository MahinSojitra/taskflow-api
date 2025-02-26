const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const { sendPasswordResetEmail } = require("./emailService");
const { formatDate } = require("../utils/dateFormatter");

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

// Add new helper function to calculate token expiration
const calculateTokenExpiration = () => {
  return new Date(Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRE) * 1000);
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
  signin: async ({ email, password, device, ip }) => {
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return {
        success: false,
        message:
          "We couldn't verify your credentials. Please ensure your email and password are correct.",
        statusCode: 401,
      };
    }

    // Simplified session matching using only device ID
    const existingSession = user.sessions.find(
      (session) =>
        session.device.id === device.id &&
        session.isValid &&
        session.status === "active"
    );

    if (existingSession) {
      // Update last active time and check session expiration
      existingSession.lastActive = new Date(Date.now());
      if (existingSession.expiresAt < new Date()) {
        existingSession.status = "expired";
        existingSession.isValid = false;
      } else {
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
    }

    // Create a new session with secure session ID
    const sessionId = generateSessionId();
    const { accessToken, refreshToken } = generateTokens(user._id, sessionId);

    // Add new session with updated schema structure
    user.sessions.push({
      _id: sessionId,
      refreshToken,
      accessToken,
      device,
      ip,
      lastActive: new Date(Date.now()),
      createdAt: new Date(Date.now()),
      expiresAt: calculateTokenExpiration(),
      status: "active",
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
        (s) =>
          s.refreshToken === oldRefreshToken &&
          s.isValid &&
          s.status === "active" &&
          s.expiresAt > new Date()
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
      session.isValid = false;
      session.status = "revoked";
      session.lastActive = new Date(Date.now());
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

    // Invalidate all sessions
    user.sessions.forEach((session) => {
      session.isValid = false;
      session.status = "revoked";
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
    const users = await User.find({ role: "user" }).select(
      "-password -refreshToken"
    );
    return {
      success: true,
      message:
        "Here's your admin dashboard view of all users! Remember to handle user data with care - it's like having the keys to everyone's digital lockers.",
      statusCode: 200,
      data: {
        users: users.map((user) => ({
          _id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          createdAt: formatDate(user.createdAt),
          updatedAt: formatDate(user.updatedAt),
        })),
        total: users.length,
      },
    };
  },

  getActiveSessions: async (userId, currentSessionId, clientTimeZone) => {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        message: "Unable to retrieve your sessions. Please sign in again.",
        statusCode: 401,
      };
    }

    const activeSessions = user.sessions
      .filter((session) => session.isValid && session.status === "active")
      .map((session) => ({
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        current: session._id === currentSessionId,
        lastActive: formatDate(session.lastActive, clientTimeZone),
        createdAt: formatDate(session.createdAt, clientTimeZone),
        expiresAt: formatDate(session.expiresAt, clientTimeZone),
        status: session.status,
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
