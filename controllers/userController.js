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
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.regenerateApiKey = async (req, res, next) => {
  try {
    const response = await userService.regenerateApiKey(req.body);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
