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
