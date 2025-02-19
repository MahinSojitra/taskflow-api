const userService = require("../services/userService");
const { AppError } = require("../middlewares/errorHandler");

const userController = {
  signup: async (req, res, next) => {
    try {
      const result = await userService.signup(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  signin: async (req, res, next) => {
    try {
      const result = await userService.signin(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(new AppError(error.message, 401));
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await userService.getProfile(req.user.id);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const user = await userService.updateProfile(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: "Profile updated.",
        data: user,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  refreshToken: async (req, res, next) => {
    try {
      const result = await userService.refreshToken(req.body.refreshToken);
      res.status(200).json(result);
    } catch (error) {
      next(new AppError(error.message, 401));
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      await userService.forgotPassword(req.body.email);
      res.status(200).json({
        success: true,
        message: "Password reset instructions sent to your email.",
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      await userService.resetPassword(req.body.token, req.body.password);
      res.status(200).json({
        success: true,
        message: "Password has been reset.",
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  signout: async (req, res, next) => {
    try {
      await userService.signout(req.user.id);
      res.status(200).json({
        success: true,
        message: "Signed out.",
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  getApiKey: async (req, res, next) => {
    try {
      const response = await userService.getApiKey(req.body);
      if (!response.success) {
        return res.status(401).json(response);
      }
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  regenerateApiKey: async (req, res, next) => {
    try {
      const response = await userService.regenerateApiKey(req.body);
      if (!response.success) {
        return res.status(401).json(response);
      }
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
