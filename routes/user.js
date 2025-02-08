const express = require("express");
const userController = require("../controllers/userController");
const validateUser = require("../validations/requestValidator");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// Validate request before processing
router.post(
  "/register",
  validateUser(["email", "password"]),
  userController.registerUser
);
router.post(
  "/apikey",
  validateUser(["email", "password"]),
  userController.getApiKey
);
router.post(
  "/regenerate-key",
  validateUser(["email", "password"]),
  userController.regenerateApiKey
);

// Use Global Error Handler
router.use(errorHandler);

module.exports = router;
