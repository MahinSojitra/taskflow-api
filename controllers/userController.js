const userService = require("../services/userService");
const { AppError } = require("../middlewares/errorHandler");
const { getDeviceInfo } = require("../utils/deviceDetector");

const userController = {
  signup: async (req, res) => {
    const result = await userService.signup(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signin: async (req, res) => {
    const deviceInfo = getDeviceInfo(req.headers["user-agent"]);

    const result = await userService.signin({
      ...req.body,
      deviceInfo,
    });

    // Add a custom header if it's an existing session
    if (result.data?.isExistingSession) {
      res.setHeader("X-Session-Status", "existing");
    }

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  getProfile: async (req, res) => {
    const result = await userService.getProfile(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  updateProfile: async (req, res) => {
    const result = await userService.updateProfile(req.user.id, req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  refreshToken: async (req, res) => {
    const result = await userService.refreshToken(req.body.refreshToken);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  forgotPassword: async (req, res) => {
    const result = await userService.forgotPassword(req.body.email);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  resetPassword: async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const result = await userService.resetPassword(email, otp, newPassword);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signout: async (req, res) => {
    const result = await userService.signout(req.user.id, req.sessionId);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signoutAllDevices: async (req, res) => {
    const result = await userService.signoutAllDevices(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  getActiveSessions: async (req, res) => {
    const result = await userService.getActiveSessions(
      req.user.id,
      req.sessionId
    );

    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: { sessions: result.data },
    });
  },

  getAllUsers: async (req, res) => {
    const result = await userService.getAllUsers();
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  getApiKey: async (req, res) => {
    const result = await userService.getApiKey(req.body);
    res.status(result.statusCode || 200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },

  regenerateApiKey: async (req, res) => {
    const result = await userService.regenerateApiKey(req.body);
    res.status(result.statusCode || 200).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },
};

module.exports = userController;
