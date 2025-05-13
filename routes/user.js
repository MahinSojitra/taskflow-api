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

router.post(
  "/forgot-password",
  validateRequest(userSchemas.forgotPassword),
  userController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(userSchemas.resetPassword),
  userController.resetPassword
);

router.get(
  "/profile",
  protect,
  authorize("user", "admin"),
  userController.getUserProfile
);

router.put(
  "/profile",
  protect,
  authorize("user", "admin"),
  userController.updateUserProfile
);

router.post("/refresh", userController.refreshToken);

router.post(
  "/signout",
  protect,
  authorize("user", "admin"),
  userController.signout
);

// New session management routes
router.post(
  "/signout/all",
  protect,
  authorize("user", "admin"),
  userController.signoutAllDevices
);

router.get(
  "/sessions",
  protect,
  authorize("user", "admin"),
  userController.getActiveSessions
);

router.post(
  "/email-available",
  validateRequest(userSchemas.emailAvailability),
  userController.checkEmailAvailability
);

// Error handler
router.use(errorHandler);

module.exports = router;
