const express = require("express");
const taskController = require("../controllers/taskController");
const authenticate = require("../middlewares/auth");
const errorHandler = require("../middlewares/errorHandler");
const validateTask = require("../validations/taskValidator");

const router = express.Router();

// Routes
router.get("/", authenticate, taskController.getAllTasks);
router.post("/", authenticate, validateTask, taskController.createTask);
router.put("/:id", authenticate, validateTask, taskController.updateTask);
router.delete("/:id", authenticate, taskController.deleteTask);

// Global Error Handler
router.use(errorHandler);

module.exports = router;
