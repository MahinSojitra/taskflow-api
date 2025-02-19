const taskService = require("../services/taskService");

// Task Controller
const taskController = {
  // Get all tasks
  getAllTasks: async (req, res) => {
    try {
      const tasks = await taskService.getAllTasks(req.user.id);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Create new task
  createTask: async (req, res) => {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get single task
  getTask: async (req, res) => {
    try {
      const task = await taskService.getTask(req.user.id, req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update task
  updateTask: async (req, res) => {
    try {
      const task = await taskService.updateTask(
        req.user.id,
        req.params.id,
        req.body
      );
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete task
  deleteTask: async (req, res) => {
    try {
      const task = await taskService.deleteTask(req.user.id, req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = taskController;
