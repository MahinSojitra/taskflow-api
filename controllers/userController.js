const userService = require("../services/userService");
const { AppError } = require("../middlewares/errorHandler");

const userController = {
  signup: async (req, res) => {
    const result = await userService.signup(req.body);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
    });
  },

  signin: async (req, res) => {
    const result = await userService.signin(req.body);
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
    const result = await userService.signout(req.user.id);
    res.status(result.statusCode).json({
      success: result.success,
      message: result.message,
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
