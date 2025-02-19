const express = require("express");
const taskController = require("../controllers/taskController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/auth");
const { taskSchemas } = require("../validations/validationSchemas");
const { errorHandler } = require("../middlewares/errorHandler");
const authorize = require("../middlewares/authorize");

const router = express.Router();

// Admin routes
router.get(
  "/all",
  protect,
  authorize("admin"),
  taskController.getAllUsersTasks
);

// Regular task routes
router.get(
  "/",
  protect,
  authorize("user", "admin"),
  taskController.getAllTasks
);

router.post(
  "/",
  protect,
  authorize("user", "admin"),
  validateRequest(taskSchemas.create),
  taskController.createTask
);

router.get("/:id", protect, authorize("user", "admin"), taskController.getTask);

router.put(
  "/:id",
  protect,
  authorize("user", "admin"),
  validateRequest(taskSchemas.update),
  taskController.updateTask
);

router.delete(
  "/:id",
  protect,
  authorize("user", "admin"),
  taskController.deleteTask
);

// Error handler
router.use(errorHandler);

module.exports = router;
