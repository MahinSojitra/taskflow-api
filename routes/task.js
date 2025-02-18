const express = require("express");
const taskController = require("../controllers/taskController");
const { protect, authorize } = require("../middlewares/auth");
const validateTask = require("../validations/taskValidator");

const router = express.Router();

// Protect all routes
router.use(protect);

// Regular user routes
router.get("/", taskController.getAllTasks);
router.post("/", validateTask, taskController.createTask);
router.get("/:id", taskController.getTask);
router.put("/:id", validateTask, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Admin only route
router.get("/admin/all", authorize("admin"), taskController.getAllUsersTasks);

module.exports = router;
