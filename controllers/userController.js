const userService = require("../services/userService");

exports.registerUser = async (req, res) => {
  try {
    const result = await userService.registerUser(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const result = await userService.loginUser(req.body);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const result = await userService.refreshToken(refreshToken);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    await userService.logout(req.user.id);
    return res.status(200).json({
      success: true,
      message: "Logged out.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const result = await userService.updateProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated.",
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    return res.status(200).json({
      success: true,
      message: "Password reset email sent.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    await userService.resetPassword(token, password);
    return res.status(200).json({
      success: true,
      message: "Password reset.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
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
