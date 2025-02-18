const express = require("express");
const taskController = require("../controllers/taskController");
const { protect, authorize } = require("../middlewares/auth");
const validateTask = require("../validations/taskValidator");

const router = express.Router();

router.use(protect); // Protect all task routes

router.get("/", taskController.getAllTasks);
router.post("/", validateTask, taskController.createTask);
router.get("/:id", taskController.getTask);
router.put("/:id", validateTask, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Admin only routes
router.get("/all/tasks", authorize('admin'), taskController.getAllUsersTasks);

module.exports = router;
