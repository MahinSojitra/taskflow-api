const express = require("express");
const taskController = require("../controllers/taskController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/auth");
const { taskSchemas } = require("../validations/validationSchemas");
const { errorHandler } = require("../middlewares/errorHandler");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Protect all routes
router.use(protect);

// Basic CRUD routes
router.get("/", taskController.getAllTasks);
router.post("/", taskController.createTask);
router.get("/:id", taskController.getTask);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Admin only route
router.get("/admin/all", authorize("admin"), taskController.getAllUsersTasks);

// Error handler
router.use(errorHandler);

module.exports = router;
