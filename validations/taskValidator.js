const Joi = require("joi");

// Task Schema Validation
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Title should not be empty",
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title must not exceed 100 characters",
    "any.required": "Title is required",
  }),

  description: Joi.string().min(5).max(500).required().messages({
    "string.empty": "Description should not be empty",
    "string.min": "Description must be at least 5 characters",
    "string.max": "Description must not exceed 500 characters",
    "any.required": "Description is required",
  }),

  dueDate: Joi.date().iso().greater("now").required().messages({
    "date.empty": "Due date should not be empty",
    "date.base": "Due date must be a valid date",
    "date.format": "Due date must be in ISO format (YYYY-MM-DD)",
    "date.greater": "Due date must be in the future",
    "any.required": "Due date is required",
  }),

  status: Joi.string()
    .valid("pending", "active", "completed", "cancelled")
    .required()
    .messages({
      "string.empty": "Status should not be empty",
      "any.only":
        'Status must be one of "pending", "active", "completed", or "cancelled"',
      "any.required": "Status is required",
    }),

  tags: Joi.array()
    .items(Joi.string().trim().min(3))
    .unique()
    .required()
    .messages({
      "array.base": "Tags must be an array of strings",
      "array.unique": "Tags must be unique",
      "string.empty": "Tags should not be empty",
      "string.min": "Tags must be at least 3 character",
      "any.required": "Tags are required",
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
