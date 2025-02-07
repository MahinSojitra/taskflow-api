const express = require("express");
const Task = require("../models/Task");
const authenticate = require("../middlewares/auth");
const router = express.Router();

// Get All Tasks
router.get("/", authenticate, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

// Create Task
router.post("/", authenticate, async (req, res) => {
  const { title, description, dueDate, status, tags } = req.body;
  if (!title || !description || !dueDate)
    return res.status(400).json({ error: "Missing required fields" });

  const newTask = new Task({
    title,
    description,
    dueDate,
    status,
    tags,
    userId: req.user._id,
  });
  await newTask.save();
  res.status(201).json(newTask);
});

// Update Task
router.put("/:id", authenticate, async (req, res) => {
  const { title, description, dueDate, status, tags } = req.body;
  const updatedTask = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title, description, dueDate, status, tags },
    { new: true }
  );
  if (!updatedTask) return res.status(404).json({ error: "Task not found" });
  res.json(updatedTask);
});

// Delete Task
router.delete("/:id", authenticate, async (req, res) => {
  const deletedTask = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!deletedTask) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted successfully" });
});

module.exports = router;
