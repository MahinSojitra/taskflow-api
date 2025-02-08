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
        validator: function (value) {
          return value > new Date();
        },
        message: "Due date must be in the future",
      },
    },

    status: {
      type: String,
      enum: ["active", "pending", "completed", "cancelled"],
      default: "pending",
      required: true,
    },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: function (tags) {
          return (
            Array.isArray(tags) &&
            tags.length > 0 &&
            new Set(tags).size === tags.length
          );
        },
        message: "Tags must be a non-empty array of unique strings",
      },
    },

    createdAt: { type: Date, default: Date.now, immutable: true },
    updatedAt: { type: Date, default: Date.now },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Optimized lookup performance
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);

// Middleware to update `updatedAt` before saving
TaskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", TaskSchema);
