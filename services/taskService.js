const Task = require("../models/Task");

const getAllTasks = async (userId) => {
  return await Task.find({ userId });
};

const createTask = async (taskData) => {
  const { title, description, dueDate, status, tags, userId } = taskData;

  if (!title || !description || !dueDate || !status || !tags || !userId) {
    throw new Error("All fields are required");
  }

  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array of strings");
  }

  const newTask = new Task(taskData);
  return await newTask.save();
};

const updateTask = async (taskId, taskData) => {
  const { title, description, dueDate, status, tags, userId } = taskData;

  if (!title || !description || !dueDate || !status || !tags || !userId) {
    throw new Error("All fields are required");
  }

  if (!Array.isArray(tags)) {
    throw new Error("Tags must be an array of strings");
  }

  return await Task.findByIdAndUpdate(taskId, taskData, { new: true });
};

const deleteTask = async (taskId, userId) => {
  return await Task.findOneAndDelete({ _id: taskId, userId });
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };
