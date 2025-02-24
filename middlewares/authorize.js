const { AppError } = require("./errorHandler");

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(
        new AppError("Unauthorized access. Please sign in to continue.", 401)
      );
    }

    if (!roles.includes(req.user.role)) {
      console.warn(`Access denied for user with role: ${req.user.role}`);
      return next(
        new AppError(
          "Access denied. You do not have the required permissions.",
          403
        )
      );
    }

    next();
  };
};

module.exports = authorize;
