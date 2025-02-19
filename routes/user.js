const express = require("express");
const userController = require("../controllers/userController");
const validateRequest = require("../middlewares/validateRequest");
const { userSchemas } = require("../validations/validationSchemas");
const { protect } = require("../middlewares/auth");
const { errorHandler } = require("../middlewares/errorHandler");
const authorize = require("../middlewares/authorize");

const router = express.Router();

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

router.get("/profile", protect, userController.getProfile);
router.put(
  "/profile",
  protect,
  validateRequest(userSchemas.update),
  userController.updateProfile
);
router.post("/refresh-token", protect, userController.refreshToken);
router.post("/signout", protect, userController.signout);

// Admin routes
router.get("/all", authorize("admin"), userController.getAllUsers);

// Error handler
router.use(errorHandler);

module.exports = router;
