const taskService = require("../services/taskService");
const { AppError } = require("../middlewares/errorHandler");

const taskController = {
  // Get all tasks
  getAllTasks: async (req, res, next) => {
    try {
      const tasks = await taskService.getAllTasks(req.user.id);
      res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Create a new task
  createTask: async (req, res, next) => {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Get a single task
  getTask: async (req, res, next) => {
    try {
      const task = await taskService.getTask(req.user.id, req.params.id);
      if (!task) {
        return next(new AppError("Task not found", 404));
      }
      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Update a task
  updateTask: async (req, res, next) => {
    try {
      const task = await taskService.updateTask(
        req.user.id,
        req.params.id,
        req.body
      );
      if (!task) {
        return next(new AppError("Task not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Delete a task
  deleteTask: async (req, res, next) => {
    try {
      const task = await taskService.deleteTask(req.user.id, req.params.id);
      if (!task) {
        return next(new AppError("Task not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },
};

module.exports = taskController;
