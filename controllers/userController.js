const userService = require("../services/userService");

exports.registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await userService.registerUser(email, password);
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

exports.getApiKey = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await userService.getApiKey(email, password);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

exports.regenerateApiKey = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const response = await userService.regenerateApiKey(email, password);
    res.json(response);
  } catch (error) {
    next(error);
  }
};
