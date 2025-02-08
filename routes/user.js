const express = require("express");
const userController = require("../controllers/userController");
const validateRequest = require("../validations/requestValidator");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// Validate request before processing
router.post(
  "/register",
  validateRequest(["email", "password"]),
  userController.registerUser
);
router.post(
  "/apikey",
  validateRequest(["email", "password"]),
  userController.getApiKey
);
router.post(
  "/regenerate-key",
  validateRequest(["email", "password"]),
  userController.regenerateApiKey
);

// Use Global Error Handler
router.use(errorHandler);

module.exports = router;
