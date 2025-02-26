const taskService = require("../services/taskService");
const { AppError } = require("../middlewares/errorHandler");
const { formatDate } = require("../utils/dateFormatter");

// Task Controller
const taskController = {
  // Get all tasks
  getAllTasks: async (req, res, next) => {
    try {
      const tasks = await taskService.getAllTasks(req.user.id);
      res.status(200).json({
        success: true,
        data: {
          tasks: tasks.map((task) => ({
            id: task._id,
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
            status: task.status,
            tags: task.tags,
            createdAt: formatDate(task.createdAt),
            updatedAt: formatDate(task.updatedAt),
          })),
          total: tasks.length,
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Get all users' tasks (admin only)
  getAllUsersTasks: async (req, res, next) => {
    try {
      const tasks = await taskService.getAllUsersTasks();
      res.status(200).json({
        success: true,
        data: {
          tasks: tasks,
          total: tasks.length,
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Create new task
  createTask: async (req, res, next) => {
    try {
      const task = await taskService.createTask(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: "Task created.",
        data: {
          id: task._id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          tags: task.tags,
          createdAt: formatDate(task.createdAt),
          updatedAt: formatDate(task.updatedAt),
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Get single task
  getTask: async (req, res, next) => {
    try {
      const task = await taskService.getTask(req.user.id, req.params.id);
      if (!task) {
        return next(new AppError("Task not found", 404));
      }
      res.status(200).json({
        success: true,
        data: {
          id: task._id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          tags: task.tags,
          createdAt: formatDate(task.createdAt),
          updatedAt: formatDate(task.updatedAt),
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Update task
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
        message: "Task updated.",
        data: {
          id: task._id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          status: task.status,
          tags: task.tags,
          createdAt: formatDate(task.createdAt),
          updatedAt: formatDate(task.updatedAt),
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },

  // Delete task
  deleteTask: async (req, res, next) => {
    try {
      const task = await taskService.deleteTask(req.user.id, req.params.id);
      if (!task) {
        return next(new AppError("Task not found", 404));
      }
      res.status(200).json({
        success: true,
        message: "Task deleted. this action is irreversible.",
        data: {
          id: task._id,
          title: task.title,
        },
      });
    } catch (error) {
      next(new AppError(error.message, 400));
    }
  },
};

module.exports = taskController;
