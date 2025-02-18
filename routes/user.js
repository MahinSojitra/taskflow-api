const express = require("express");
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/auth");
const validateUser = require("../validations/userValidator");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// ✅ Apply Validation Middleware
router.post("/signup", validateUser, userController.signup);
router.post("/login", validateUser, userController.loginUser);
router.post("/refresh-token", userController.refreshToken);
router.post("/logout", protect, userController.logout);
router.get("/profile", protect, userController.getProfile);
router.put("/profile", protect, validateUser, userController.updateProfile);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);

// ✅ Use Global Error Handler
router.use(errorHandler);

module.exports = router;
