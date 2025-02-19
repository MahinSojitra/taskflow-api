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

// Task routes with simplified middleware chain
router
  .route("/")
  .get(taskController.getAllTasks)
  .post(validateRequest(taskSchemas.create), taskController.createTask);

router
  .route("/:id")
  .get(taskController.getTask)
  .put(validateRequest(taskSchemas.update), taskController.updateTask)
  .delete(taskController.deleteTask);

// Admin only route
router.get("/admin/all", authorize("admin"), taskController.getAllUsersTasks);

// Error handler
router.use(errorHandler);

module.exports = router;
