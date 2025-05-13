const userService = require("../services/userService");
const { AppError } = require("../middlewares/errorHandler");
const { getDeviceInfo } = require("../utils/deviceDetector");
const { getClientIpDetails } = require("../utils/clientIpUtils");

const userController = {
  signup: async (req, res) => {
    const result = await userService.signup(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signin: async (req, res) => {
    const { device } = getDeviceInfo(req);
    const ip = await getClientIpDetails(req);

    const result = await userService.signin({
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
    const result = await userService.getUserProfile(req.user.id);
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

    // const result = await userService.updateProfile(req.user.id, req.body);
    // res.status(result.statusCode).json({
    //   success: result.success,
    //   message: result.message,
    //   data: result.data,
    // });
  },

  refreshToken: async (req, res) => {
    const refreshToken =
      req.body.refreshToken || req.headers["x-refresh-token"];
    const result = await userService.refreshToken(refreshToken);

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
    const clientTimeZone = req.headers["x-timezone"];

    const result = await userService.getActiveSessions(
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

  checkEmailAvailability: async (req, res) => {
    const result = await userService.checkEmailAvailability(req.body.email);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  },
};

module.exports = userController;
