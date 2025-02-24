// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Development error response
  if (process.env.NODE_ENV === "development") {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }

  // Production error response (hide stack traces)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Log unexpected errors
  console.error("ERROR 💥", err);

  // Generic response for unhandled errors
  return res.status(500).json({
    success: false,
    status: "error",
    message:
      "Something went wrong! Please try again later or contact support if the issue persists.",
  });
};

module.exports = {
  AppError,
  errorHandler,
};
