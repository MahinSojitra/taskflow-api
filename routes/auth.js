const express = require("express");
const authController = require("../controllers/authController");
const validateRequest = require("../middlewares/validateRequest");
const { userSchemas } = require("../validations/validationSchemas");
const { protect } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/errorHandler");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Admin routes
router.get("/all", protect, authorize("admin"), authController.getAllUsers);

// Public routes
router.post(
  "/signup",
  validateRequest(userSchemas.signup),
  authController.signup
);

router.post(
  "/signin",
  validateRequest(userSchemas.signin),
  authController.signin
);

router.post(
  "/forgot-password",
  validateRequest(userSchemas.forgotPassword),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  validateRequest(userSchemas.resetPassword),
  authController.resetPassword
);

router.get(
  "/profile",
  protect,
  authorize("user", "admin"),
  authController.getUserProfile
);

router.put(
  "/profile",
  protect,
  authorize("user", "admin"),
  authController.updateUserProfile
);

router.post("/refresh", authController.refreshToken);

router.post(
  "/signout",
  protect,
  authorize("user", "admin"),
  authController.signout
);

// New session management routes
router.post(
  "/signout/all",
  protect,
  authorize("user", "admin"),
  authController.signoutAllDevices
);

router.get(
  "/sessions",
  protect,
  authorize("user", "admin"),
  authController.getActiveSessions
);

router.post(
  "/email-available",
  validateRequest(userSchemas.emailAvailability),
  authController.checkEmailAvailability
);

router.post(
  "/email-verification",
  validateRequest(userSchemas.emailVerification),
  authController.sendEmailVerification
);

router.post(
  "/email-verification",
  validateRequest(userSchemas.emailVerification),
  authController.sendEmailVerification
);
router.get(
  "/verify-email",
  validateRequest(userSchemas.verifyEmail, "query"),
  authController.verifyEmail
);

// Error handler
router.use(errorHandler);

module.exports = router;
