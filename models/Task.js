const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title must not exceed 100 characters"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [5, "Description must be at least 5 characters"],
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value > new Date(),
        message: "Due date must be in the future",
      },
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (tags) =>
          Array.isArray(tags) &&
          tags.length > 0 &&
          new Set(tags).size === tags.length,
        message: "Tags must be a non-empty array of unique strings",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
