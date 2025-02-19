const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a task title."],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long."],
      maxlength: [100, "Title cannot exceed 100 characters."],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters."],
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value) {
          return !value || value >= new Date();
        },
        message: "Due date cannot be in the past.",
      },
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be either 'low', 'medium', or 'high'.",
      },
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "active", "completed", "cancelled"],
        message:
          "Status must be either 'pending', 'active', 'completed', or 'cancelled'.",
      },
      default: "pending",
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Index for better query performance
TaskSchema.index({ user: 1, createdAt: -1 });

// Middleware to ensure user field is never empty
TaskSchema.pre("save", function (next) {
  if (!this.user) {
    next(new Error("User reference is required."));
  }
  next();
});

module.exports = mongoose.model("Task", TaskSchema);
