const mongoose = require("mongoose");
const taskService = require("../services/taskService");
const { AppError } = require("../middlewares/errorHandler");
const { formatDate } = require("../utils/dateFormatter");

// Utility to check if the ID is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
      next(new AppError("Failed to fetch tasks. Please try again later.", 500));
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
      next(
        new AppError(
          "Failed to fetch user's tasks. Please try again later.",
          500
        )
      );
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
      next(new AppError("Failed to create task. Please try again later.", 500));
    }
  },

  // Get single task
  getTask: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if the ID is a valid MongoDB ObjectId
      if (!isValidObjectId(id)) {
        return next(
          new AppError(
            "Hmm, that Task ID doesn't seem to be quite right. Double-check and try again!",
            400
          )
        );
      }

      const task = await taskService.getTask(req.user.id, id);
      if (!task) {
        return next(
          new AppError(
            "We couldn’t find a task with that ID. It might have been deleted or never existed. Check again!",
            404
          )
        );
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
      next(
        new AppError(
          "An error occurred while retrieving the task. Please try again later.",
          500
        )
      );
    }
  },

  // Update task
  updateTask: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if the ID is a valid MongoDB ObjectId
      if (!isValidObjectId(id)) {
        return next(
          new AppError(
            "Hmm, that Task ID doesn't seem to be quite right. Double-check and try again!",
            400
          )
        );
      }

      const task = await taskService.updateTask(req.user.id, id, req.body);
      if (!task) {
        return next(
          new AppError(
            "We couldn’t find a task with that ID. It might have been deleted or never existed. Check again!",
            404
          )
        );
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
      next(
        new AppError(
          "An error occurred while updating the task. Please try again later.",
          500
        )
      );
    }
  },

  // Delete task
  deleteTask: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Check if the ID is a valid MongoDB ObjectId
      if (!isValidObjectId(id)) {
        return next(
          new AppError(
            "Hmm, that Task ID doesn't seem to be quite right. Double-check and try again!",
            400
          )
        );
      }

      const task = await taskService.deleteTask(req.user.id, id);
      if (!task) {
        return next(
          new AppError(
            "We couldn’t find a task with that ID. It might have been deleted or never existed. Check again!",
            404
          )
        );
      }

      res.status(200).json({
        success: true,
        message: "Task deleted. This action is irreversible.",
        data: {
          id: task._id,
          title: task.title,
        },
      });
    } catch (error) {
      next(
        new AppError(
          "An error occurred while deleting the task. Please try again later.",
          500
        )
      );
    }
  },
};

module.exports = taskController;
