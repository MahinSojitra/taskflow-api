const taskService = require("../services/taskService");

const taskController = {
  // Get all tasks for the current user
  getAllTasks: async (req, res) => {
    try {
      const tasks = await taskService.getAllTasks(req.user.id);
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Create a new task
  createTask: async (req, res) => {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      return res.status(201).json({
        success: true,
        message: "Task created.",
        data: task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get a single task
  getTask: async (req, res) => {
    try {
      const task = await taskService.getTask(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update a task
  updateTask: async (req, res) => {
    try {
      const task = await taskService.updateTask(
        req.user.id,
        req.params.id,
        req.body
      );
      return res.status(200).json({
        success: true,
        message: "Task updated.",
        data: task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete a task
  deleteTask: async (req, res) => {
    try {
      await taskService.deleteTask(req.user.id, req.params.id);
      return res.status(200).json({
        success: true,
        message: "Task deleted.",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all tasks (admin only)
  getAllUsersTasks: async (req, res) => {
    try {
      const tasks = await taskService.getAllUsersTasks();
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = taskController;
