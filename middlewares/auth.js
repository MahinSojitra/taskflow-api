const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("./errorHandler");

const protect = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    const authHeader = req.headers.authorization;

    // More detailed token extraction and validation
    if (authHeader) {
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader;
      }
    }

    // If no token found at all
    if (!token) {
      throw new AppError(
        "Looks like you're trying to access a protected area! Please sign in first to unlock all features.",
        401
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user and check if session is valid
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new AppError(
          "We couldn't find your account. It might have been deleted or deactivated.",
          401
        );
      }

      // Find the specific session
      const session = user.sessions.find(
        (s) => s._id === decoded.sessionId && s.isValid
      );

      if (!session) {
        throw new AppError(
          "Looks like your session has ended! Sign back in to restore access and pick up right where you left off.",
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
    } catch (jwtError) {
      // More specific JWT error handling
      if (jwtError.name === "JsonWebTokenError") {
        throw new AppError(
          "Your access token appears to be invalid. Please sign in again to get a new token.",
          401
        );
      } else if (jwtError.name === "TokenExpiredError") {
        throw new AppError(
          "Your access token has expired. Please sign in again to refresh your access.",
          401
        );
      }
      throw jwtError;
    }
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        "Sorry, it looks like you don't have permission to access this feature. Please contact us if you need this access.",
        403
      );
    }
    next();
  };
};

// Add a helper to log token details (for development only)
const logTokenDetails = (token) => {
  try {
    const decoded = jwt.decode(token);
    console.log("Token details:", {
      id: decoded?.id,
      sessionId: decoded?.sessionId,
      exp: decoded?.exp ? new Date(decoded.exp * 1000).toISOString() : "N/A",
    });
  } catch (error) {
    console.log("Invalid token format");
  }
};

module.exports = { protect, authorize };
