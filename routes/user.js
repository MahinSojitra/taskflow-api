const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const validateRequest = require("../middlewares/validateRequest");
const errorHandler = require("../middlewares/errorHandler");
const { userSchemas } = require("../validations/validationSchemas");

const router = express.Router();

// ✅ Apply Validation Middleware
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
router.post("/refresh-token", userController.refreshToken);
router.post("/signout", protect, userController.signout);
router.get("/profile", protect, userController.getProfile);
router.put(
  "/profile",
  protect,
  validateRequest(userSchemas.update),
  userController.updateProfile
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// ✅ Use Global Error Handler
router.use(errorHandler);

module.exports = router;
