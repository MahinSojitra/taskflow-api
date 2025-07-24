const authService = require("../services/authService");
const { AppError } = require("../middlewares/errorHandler");
const { getDeviceInfo } = require("../utils/deviceDetector");
const { getClientIpDetails } = require("../utils/clientIpUtils");

const authController = {
  signup: async (req, res) => {
    const result = await authService.signup(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signin: async (req, res) => {
    const { device } = getDeviceInfo(req);
    const ip = await getClientIpDetails(req);

    const result = await authService.signin({
      ...req.body,
      device,
      ip,
    });

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  getUserProfile: async (req, res) => {
    const result = await authService.getUserProfile(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  updateUserProfile: async (req, res) => {
    res.status(200).json({
      message:
        "Hang tight! This feature is under maintenance, but we'll have it up and running soon!",
    });

    // const result = await authService.updateProfile(req.user.id, req.body);
    // res.status(result.statusCode).json({
    //   success: result.success,
    //   message: result.message,
    //   data: result.data,
    // });
  },

  refreshToken: async (req, res) => {
    const refreshToken =
      req.body.refreshToken || req.headers["x-refresh-token"];
    const result = await authService.refreshToken(refreshToken);

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  forgotPassword: async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signout: async (req, res) => {
    const result = await authService.signout(req.user.id, req.sessionId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signoutAllDevices: async (req, res) => {
    const result = await authService.signoutAllDevices(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  getActiveSessions: async (req, res) => {
    const clientTimeZone = req.headers["x-timezone"];

    const result = await authService.getActiveSessions(
      req.user.id,
      req.sessionId,
      clientTimeZone
    );

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: { sessions: result.data, count: result.data.length },
    });
  },

  getAllUsers: async (req, res) => {
    const result = await authService.getAllUsers();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  getApiKey: async (req, res) => {
    const result = await authService.getApiKey(req.body);
    res.status(result.statusCode || 200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  regenerateApiKey: async (req, res) => {
    const result = await authService.regenerateApiKey(req.body);
    res.status(result.statusCode || 200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  checkEmailAvailability: async (req, res) => {
    const result = await authService.checkEmailAvailability(req.body.email);
    res.status(result.statusCode).json({
      success: result.success,
      isAvailable: result.isAvailable,
      message: result.message,
    });
  },

  sendEmailVerification: async (req, res) => {
    const result = await authService.sendEmailVerification(req.body.email);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  verifyEmail: async (req, res, next) => {
    try {
      const { token } = req.query;
      const result = await authService.verifyEmail(token);
      if (result.verified) {
        return res.send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Email Verified</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
              <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center justify-content-center min-vh-100 bg-light text-center">
              <div>
                <i class="bi bi-patch-check-fill text-success display-2"></i>
                <h3 class="mt-4 text-success">Email Verified</h1>
                <p class="small text-muted">You can close this window at your convenience.</p>
              </div>
            </body>
          </html>
        `);
      } else {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>Invalid or Expired Link</title>
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
              <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
            </head>
            <body class="d-flex align-items-center justify-content-center min-vh-100 bg-light text-center">
              <div>
                <i class="bi bi-exclamation-octagon-fill text-danger display-2"></i>
                <h3 class="mt-4 text-danger">Invalid or Expired Link</h1>
                <p class="small text-muted">This email verification link is invalid or has expired.<br>Please request a new verification email.</p>
              </div>
            </body>
          </html>
        `);
      }
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
