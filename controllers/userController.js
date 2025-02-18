const userService = require("../services/userService");

exports.registerUser = async (req, res, next) => {
  try {
    const response = await userService.registerUser(req.body);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getApiKey = async (req, res, next) => {
  try {
    const response = await userService.getApiKey(req.body);
    if (!response.success) {
      return res.status(401).json(response);
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.regenerateApiKey = async (req, res, next) => {
  try {
    const response = await userService.regenerateApiKey(req.body);
    if (!response.success) {
      return res.status(401).json(response);
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // ... profile update logic ...
    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: updatedUser,
    });
  } catch (error) {
    // ... error handling
  }
};

exports.logout = async (req, res) => {
  try {
    // ... logout logic ...
    return res.status(200).json({
      success: true,
      message: "Logged out.",
    });
  } catch (error) {
    // ... error handling
  }
};

exports.resetPassword = async (req, res) => {
  try {
    // ... password reset logic ...
    return res.status(200).json({
      success: true,
      message: "Password reset.",
    });
  } catch (error) {
    // ... error handling
  }
};
