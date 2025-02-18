const Task = require("../models/Task");

const getAllTasks = async (userId, filters = {}) => {
  const { status, tags, page = 1, limit = 10 } = filters;
  const query = { userId };

  if (status) query.status = status;
  if (tags) query.tags = { $in: tags.split(",") };

  return Task.find(query)
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));
};

const createTask = async (userId, taskData) => {
  const task = await Task.create({
    ...taskData,
    user: userId,
  });
  return task;
};

const updateTask = async (userId, taskId, updateData) => {
  const task = await Task.findOneAndUpdate(
    { _id: taskId, user: userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new Error("Task not found.");
  }
  return task;
};

const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) {
    throw new Error("Task not found.");
  }
  return task;
};

const getTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
  if (!task) {
    throw new Error("Task not found.");
  }
  return task;
};

const getAllUsersTasks = async () => {
  const tasks = await Task.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  return tasks;
};

const taskService = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTask,
  getAllUsersTasks,
};

module.exports = taskService;
