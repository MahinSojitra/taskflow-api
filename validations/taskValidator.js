const Joi = require("joi");

// Task Schema Validation
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Title is required",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 100 characters",
  }),

  description: Joi.string().min(5).max(500).required().messages({
    "string.empty": "Description is required",
    "string.min": "Description must be at least 5 characters",
    "string.max": "Description must not exceed 500 characters",
  }),

  dueDate: Joi.date().iso().greater("now").required().messages({
    "date.base": "Due date must be a valid date",
    "date.format": "Due date must be in ISO format (YYYY-MM-DD)",
    "date.greater": "Due date must be in the future",
  }),

  status: Joi.string()
    .valid("pending", "active", "completed", "cancelled")
    .required()
    .messages({
      "any.only":
        'Status must be one of "pending", "active", "completed", or "cancelled"',
    }),

  tags: Joi.array()
    .items(Joi.string().trim().min(1))
    .unique()
    .required()
    .messages({
      "array.base": "Tags must be an array of strings",
      "array.unique": "Tags must be unique",
      "string.empty": "Tags cannot be empty",
    }),

  userId: Joi.string().trim().required().messages({
    "string.empty": "User ID is required",
  }),
});

// Middleware for Task Validation
const validateTask = (req, res, next) => {
  const { error } = taskSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      error: "Validation Failed",
      details: error.details.map(({ message, path }) => ({
        field: path.join("."),
        message,
      })),
    });
  }

  next();
};

module.exports = validateTask;
