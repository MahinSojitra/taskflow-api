const express = require("express");
const userController = require("../controllers/userController");
const validateUser = require("../validations/requestValidator");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// ✅ Apply validation middleware properly
router.post("/register", validateUser, userController.registerUser);
router.post("/apikey", validateUser, userController.getApiKey);
router.post("/regenerate-key", validateUser, userController.regenerateApiKey);

// ✅ Use Global Error Handler
router.use(errorHandler);

module.exports = router;
