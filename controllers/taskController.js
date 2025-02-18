const taskService = require("../services/taskService");

// 📌 Get All Tasks (Authenticated via API Key)
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.user._id, req.query);
    res.json({
      success: true,
      message: "Tasks retrieved.",
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Create a New Task (Authenticated via API Key)
exports.createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
      userId: req.user._id,
    });
    res.status(201).json({
      success: true,
      message: "Task created.",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Update Task (Only if API Key matches)
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
        error: "Unauthorized: You do not have permission to update this task",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated.",
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Delete Task (Only if API Key matches)
exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await taskService.deleteTask(req.params.id, req.user._id);

    if (!deleted) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: You do not have permission to delete this task.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted.",
    });
  } catch (error) {
    next(error);
  }
};
