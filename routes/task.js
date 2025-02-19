const express = require("express");
const taskController = require("../controllers/taskController");
const validateRequest = require("../middlewares/validateRequest");
const { protect } = require("../middlewares/auth");
const { taskSchemas } = require("../validations/validationSchemas");
const { errorHandler } = require("../middlewares/errorHandler");

const router = express.Router();

// Protect all routes
router.use(protect);

// Regular user routes
router.get("/", taskController.getAllTasks);
router.post(
  "/",
  validateRequest(taskSchemas.create),
  taskController.createTask
);
router.get("/:id", taskController.getTask);
router.put(
  "/:id",
  validateRequest(taskSchemas.update),
  taskController.updateTask
);
router.delete("/:id", taskController.deleteTask);

// Admin only route
router.get("/admin/all", authorize("admin"), taskController.getAllUsersTasks);

router.use(errorHandler);

module.exports = router;
