const taskService = require("../services/taskService");

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.user._id, req.query);
    res.json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      req.user._id
    );
    if (!task) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to modify this task",
      });
    }
    res.json({
      success: true,
      message: "Task updated successfully",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await taskService.deleteTask(req.params.id, req.user._id);
    if (!deleted) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this task",
      });
    }
    res.status(204).send(); // No content
  } catch (error) {
    next(error);
  }
};
