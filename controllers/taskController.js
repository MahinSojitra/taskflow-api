const Task = require("../models/Task");

// 📌 Get All Tasks for User
exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// 📌 Create a New Task
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, status, tags } = req.body;

    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ error: "Tags must be an array of strings" });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      tags,
      userId: req.user._id,
    });

    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    next(error);
  }
};

// 📌 Update Task
exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, status, tags } = req.body;
    const taskId = req.params.id;

    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ error: "Tags must be an array of strings" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, userId: req.user._id },
      { title, description, dueDate, status, tags },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    next(error);
  }
};

// 📌 Delete Task
exports.deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
