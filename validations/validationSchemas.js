const Joi = require("joi");

// User validation schemas
const userSchemas = {
  signup: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        "string.empty": "Name is required.",
        "string.min": "Name must be at least 2 characters long.",
        "string.max": "Name cannot exceed 50 characters.",
        "string.pattern.base": "Name can only contain letters and spaces.",
      }),
    email: Joi.string().required().email().messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
    }),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,30}$/
      )
      .messages({
        "string.empty": "Password is required.",
        "string.min": "Password must be at least 6 characters long.",
        "string.max": "Password cannot exceed 30 characters.",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).",
      }),
  }),

  signin: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email is required.",
      "string.email": "Please provide a valid email address.",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password is required.",
    }),
  }),
};

// Task validation schemas
const taskSchemas = {
  create: Joi.object({
    title: Joi.string()
      .required()
      .min(3)
      .max(100)
      .pattern(/^[^<>{}]+$/)
      .messages({
        "string.empty": "Title is required.",
        "string.min": "Title must be at least 3 characters long.",
        "string.max": "Title cannot exceed 100 characters.",
        "string.pattern.base": "Title contains invalid characters.",
      }),
    description: Joi.string()
      .max(500)
      .pattern(/^[^<>{}]+$/)
      .allow("")
      .messages({
        "string.max": "Description cannot exceed 500 characters.",
        "string.pattern.base": "Description contains invalid characters.",
      }),
    dueDate: Joi.date()
      .min("now")
      .max(new Date(Date.now() + 63072000000)) // 2 years from now
      .messages({
        "date.base": "Please provide a valid date.",
        "date.min": "Due date cannot be in the past.",
        "date.max": "Due date cannot be more than 2 years in the future.",
      }),
    priority: Joi.string().valid("low", "medium", "high").messages({
      "any.only": "Priority must be either 'low', 'medium', or 'high'.",
    }),
    status: Joi.string()
      .valid("pending", "active", "completed", "cancelled")
      .messages({
        "any.only":
          "Status must be either 'pending', 'active', 'completed', or 'cancelled'.",
      }),
  }),

  update: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .pattern(/^[^<>{}]+$/)
      .messages({
        "string.min": "Title must be at least 3 characters long.",
        "string.max": "Title cannot exceed 100 characters.",
        "string.pattern.base": "Title contains invalid characters.",
      }),
    description: Joi.string()
      .max(500)
      .pattern(/^[^<>{}]+$/)
      .allow("")
      .messages({
        "string.max": "Description cannot exceed 500 characters.",
        "string.pattern.base": "Description contains invalid characters.",
      }),
    dueDate: Joi.date()
      .min("now")
      .max(new Date(Date.now() + 63072000000))
      .messages({
        "date.base": "Please provide a valid date.",
        "date.min": "Due date cannot be in the past.",
        "date.max": "Due date cannot be more than 2 years in the future.",
      }),
    priority: Joi.string().valid("low", "medium", "high").messages({
      "any.only": "Priority must be either 'low', 'medium', or 'high'.",
    }),
    status: Joi.string()
      .valid("pending", "active", "completed", "cancelled")
      .messages({
        "any.only":
          "Status must be either 'pending', 'active', 'completed', or 'cancelled'.",
      }),
  }),
};

module.exports = {
  userSchemas,
  taskSchemas,
};
