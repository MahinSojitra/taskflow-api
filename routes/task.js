const express = require("express");
const taskController = require("../controllers/taskController");
const authenticate = require("../middlewares/auth");
const validateRequest = require("../middlewares/validateRequest");
const errorHandler = require("../middlewares/errorHandler");

const router = express.Router();

// Routes with validation
router.get("/", authenticate, taskController.getAllTasks);
router.post(
  "/",
  authenticate,
  validateRequest(["title", "description", "dueDate", "status", "tags"]),
  taskController.createTask
);
router.put(
  "/:id",
  authenticate,
  validateRequest(["title", "description", "dueDate", "status", "tags"]),
  taskController.updateTask
);
router.delete("/:id", authenticate, taskController.deleteTask);

// Use Global Error Handler
router.use(errorHandler);

module.exports = router;
