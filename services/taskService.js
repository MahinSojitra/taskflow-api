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

const createTask = async (taskData) => {
  const task = new Task(taskData);
  return await task.save();
};

const updateTask = async (taskId, updatedData, userId) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) return null;
  return await Task.findByIdAndUpdate(taskId, updatedData, { new: true });
};

const deleteTask = async (taskId, userId) => {
  return await Task.findOneAndDelete({ _id: taskId, userId });
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
