const express = require("express");
const userController = require("../controllers/userController");
const validateUser = require("../validations/userValidator");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// ✅ Apply Validation Middleware
router.post("/register", validateUser, userController.registerUser);
router.post("/api-key", validateUser, userController.getApiKey);
router.post(
  "/regenerate-api-key",
  validateUser,
  userController.regenerateApiKey
);

// ✅ Use Global Error Handler
router.use(errorHandler);

module.exports = router;
