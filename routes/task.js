const express = require("express");
const Task = require("../models/Task");
const authenticate = require("../middlewares/auth");
const router = express.Router();

router.get("/", authenticate, async (req, res) => {
  const tasks = await Task.find({ userId: req.user._id });
  res.json(tasks);
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { title, description, dueDate, status, tags, userId } = req.body;

    if (!title || !description || !dueDate || !status || !tags || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ message: "Tags must be an array of strings" });
    }

    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      tags,
      userId,
    });

    await newTask.save();
    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, async (req, res) => {
  try {
    const { title, description, dueDate, status, tags, userId } = req.body;
    const taskId = req.params.id;

    if (!title || !description || !dueDate || !status || !tags || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(tags)) {
      return res
        .status(400)
        .json({ message: "Tags must be an array of strings" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        title,
        description,
        dueDate,
        status,
        tags,
        userId,
      },
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, async (req, res) => {
  const deletedTask = await Task.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!deletedTask) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted successfully" });
});

module.exports = router;
