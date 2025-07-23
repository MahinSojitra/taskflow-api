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

  verifyEmail: async (req, res) => {
    const { token } = req.query;
    const result = await authService.verifyEmail(token);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },
};

module.exports = authController;
