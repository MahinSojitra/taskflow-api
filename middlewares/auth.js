const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to access this resource.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token or user not found.",
      });
    }

    // Verify session validity
    const session = user.sessions.id(decoded.sessionId);
    if (!session || !session.isValid) {
      return res.status(401).json({
        success: false,
        message: "Please sign in to access this resource.",
      });
    }

    // Update session activity
    session.lastActive = new Date();
    await user.save();

    req.user = user;
    req.sessionId = decoded.sessionId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Please sign in again.",
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this route.",
      });
    }
    next();
  };
};
