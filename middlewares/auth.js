const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("./errorHandler");

const protect = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(
        "Looks like you're trying to access a protected area! Please sign in first to unlock all features.",
        401
      );
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and check if session is valid
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError(
        "Hmm... we couldn't find your account. It might have been deleted or deactivated. Please contact support if you think this is a mistake.",
        401
      );
    }

    // Find the specific session
    const session = user.sessions.find(
      (s) => s._id === decoded.sessionId && s.isValid
    );

    if (!session) {
      throw new AppError(
        "Oops! Your session has taken a coffee break. Please sign in again to continue your journey.",
        401
      );
    }

    // Update session's last active timestamp
    session.lastActive = new Date();
    await user.save();

    // Attach user and session info to request
    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(
        new AppError(
          "Hold on! Your access pass seems invalid. Let's get you a fresh one - please sign in again.",
          401
        )
      );
    } else if (error.name === "TokenExpiredError") {
      next(
        new AppError(
          "Time flies! Your session has expired. A quick sign-in will get you back on track.",
          401
        )
      );
    } else {
      next(error);
    }
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "Sorry, it looks like you don't have permission to access this feature.",
        403
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
