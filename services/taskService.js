const Task = require("../models/Task");

const getAllTasks = async (userId) => {
  const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
  return tasks;
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

  return task;
};

const deleteTask = async (userId, taskId) => {
  const task = await Task.findOneAndDelete({ _id: taskId, user: userId });
  return task;
};

const getTask = async (userId, taskId) => {
  const task = await Task.findOne({ _id: taskId, user: userId });
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
