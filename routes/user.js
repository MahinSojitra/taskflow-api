const express = require("express");
const userController = require("../controllers/userController");
const validateRequest = require("../middlewares/validateRequest");
const { userSchemas } = require("../validations/validationSchemas");
const { protect } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/errorHandler");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Admin routes
router.get("/all", protect, authorize("admin"), userController.getAllUsers);

// Public routes
router.post(
  "/signup",
  validateRequest(userSchemas.signup),
  userController.signup
);
router.post(
  "/signin",
  validateRequest(userSchemas.signin),
  userController.signin
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// Protected routes
router.use(protect);

// Protected routes
router.get("/profile", userController.getProfile);
router.put(
  "/profile",
  validateRequest(userSchemas.update),
  userController.updateProfile
);
router.post("/refresh-token", userController.refreshToken);
router.post("/signout", userController.signout);

// Error handler
router.use(errorHandler);

module.exports = router;
