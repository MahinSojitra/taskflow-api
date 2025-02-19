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

// Admin routes
router.get("/admin/all", authorize("admin"), taskController.getAllUsersTasks);

// Regular task routes
router.get("/", authorize("user", "admin"), taskController.getAllTasks);

router.post(
  "/",
  authorize("user", "admin"),
  validateRequest(taskSchemas.create),
  taskController.createTask
);

router.get("/:id", authorize("user", "admin"), taskController.getTask);

router.put(
  "/:id",
  authorize("user", "admin"),
  validateRequest(taskSchemas.update),
  taskController.updateTask
);

router.delete("/:id", authorize("user", "admin"), taskController.deleteTask);

// Error handler
router.use(errorHandler);

module.exports = router;
