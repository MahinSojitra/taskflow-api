const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "pending", "completed", "cancelled"],
    default: "pending",
    required: true,
  },
  tags: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Task", TaskSchema);
