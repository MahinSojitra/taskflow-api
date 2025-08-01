const Joi = require("joi");

const EMAIL_VERIFICATION_TOKEN_LENGTH =
  parseInt(process.env.EMAIL_VERIFICATION_TOKEN_BYTES, 10) * 2;
const PASSWORD_RESET_OTP_LENGTH = parseInt(
  process.env.PASSWORD_RESET_OTP_LENGTH,
  10
);

// User validation schemas
const userSchemas = {
  signup: Joi.object({
    name: Joi.string()
      .required()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        "string.empty": "Name cannot be empty",
        "string.min": "Name must be at least 2 characters long",
        "string.max": "Name cannot exceed 50 characters",
        "string.pattern.base": "Name can only contain letters and spaces",
        "any.required": "Name is required",
      }),
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,30}$/
      )
      .messages({
        "string.empty": "Password cannot be empty",
        "string.min": "Password must be at least 6 characters long",
        "string.max": "Password cannot exceed 30 characters",
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character [!, @, #, $, %, ^, &, *]",
        "any.required": "Password is required",
      }),
  }),

  signin: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    password: Joi.string().required().messages({
      "string.empty": "Password cannot be empty",
      "any.required": "Password is required",
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  resetPassword: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
    otp: Joi.string()
      .required()
      .length(PASSWORD_RESET_OTP_LENGTH)
      .pattern(/^[0-9]+$/)
      .messages({
        "string.empty": "OTP cannot be empty",
        "string.length": `OTP must be ${PASSWORD_RESET_OTP_LENGTH} digits`,
        "string.pattern.base": "OTP must contain only numbers",
        "any.required": "OTP is required",
      }),
    newPassword: Joi.string()
      .required()
      .min(6)
      .max(30)
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{6,30}$/
      )
      .messages({
        "string.empty": "New password cannot be empty",
        "string.min": "New password must be at least 6 characters long",
        "string.max": "New password cannot exceed 30 characters",
        "string.pattern.base":
          "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character [!, @, #, $, %, ^, &, *]",
        "any.required": "New password is required",
      }),
  }),

  emailVerification: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  emailAvailability: Joi.object({
    email: Joi.string().required().email().messages({
      "string.empty": "Email cannot be empty",
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),
  }),

  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .length(EMAIL_VERIFICATION_TOKEN_LENGTH)
      .hex()
      .messages({
        "string.empty": "Verification token is required",
        "string.length": `Verification token must be ${EMAIL_VERIFICATION_TOKEN_LENGTH} characters`,
        "string.hex": "Verification token must be a valid hex string",
        "any.required": "Verification token is required",
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
        "string.empty": "Title cannot be empty",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title cannot exceed 100 characters",
        "string.pattern.base": "Title contains invalid characters",
        "any.required": "Title is required",
      }),
    description: Joi.string()
      .required()
      .max(500)
      .pattern(/^[^<>{}]+$/)
      .messages({
        "string.empty": "Description cannot be empty",
        "string.max": "Description cannot exceed 500 characters",
        "string.pattern.base": "Description contains invalid characters",
        "any.required": "Description is required",
      }),
    dueDate: Joi.date()
      .required()
      .min("now")
      .max(new Date(Date.now() + 63072000000))
      .messages({
        "date.base": "Please provide a valid date",
        "date.min": "Due date cannot be in the past",
        "date.max": "Due date cannot be more than 2 years in the future",
        "any.required": "Due date is required",
      }),
    tags: Joi.array()
      .items(Joi.string())
      .min(1)
      .required()
      .custom((value, helpers) => {
        if (!Array.isArray(value)) return helpers.error("array.base");
        if (value.length === 0) return helpers.error("array.min");

        const invalidTags = value.filter(
          (tag) => !tag.match(/^#[a-zA-Z0-9]+$/)
        );
        if (invalidTags.length > 0) {
          return helpers.error("array.tagFormat");
        }
        return value;
      })
      .messages({
        "array.min": "At least one tag is required",
        "array.base": "Tags must be an array",
        "any.required": "Tags are required",
        "array.tagFormat":
          "All tags must start with # and contain only letters and numbers",
      }),
    status: Joi.string()
      .required()
      .valid("pending", "active", "completed", "cancelled")
      .messages({
        "string.empty": "Status cannot be empty",
        "any.only":
          "Status must be either 'pending', 'active', 'completed', or 'cancelled'",
        "any.required": "Status is required",
      }),
  }),

  update: Joi.object({
    title: Joi.string()
      .min(3)
      .max(100)
      .pattern(/^[^<>{}]+$/)
      .messages({
        "string.empty": "Title cannot be empty",
        "string.min": "Title must be at least 3 characters long",
        "string.max": "Title cannot exceed 100 characters",
        "string.pattern.base": "Title contains invalid characters",
      }),
    description: Joi.string()
      .required()
      .max(500)
      .pattern(/^[^<>{}]+$/)
      .messages({
        "string.empty": "Description cannot be empty",
        "string.max": "Description cannot exceed 500 characters",
        "string.pattern.base": "Description contains invalid characters",
        "any.required": "Description is required",
      }),
    dueDate: Joi.date()
      .required()
      .min("now")
      .max(new Date(Date.now() + 63072000000))
      .messages({
        "date.base": "Please provide a valid date",
        "date.min": "Due date cannot be in the past",
        "date.max": "Due date cannot be more than 2 years in the future",
        "any.required": "Due date is required",
      }),
    tags: Joi.array()
      .items(Joi.string())
      .min(1)
      .custom((value, helpers) => {
        if (!Array.isArray(value)) return helpers.error("array.base");
        if (value.length === 0) return helpers.error("array.min");

        const invalidTags = value.filter(
          (tag) => !tag.match(/^#[a-zA-Z0-9]+$/)
        );
        if (invalidTags.length > 0) {
          return helpers.error("array.tagFormat");
        }
        return value;
      })
      .messages({
        "array.min": "At least one tag is required",
        "array.base": "Tags must be an array",
        "array.tagFormat":
          "All tags must start with # and contain only letters and numbers",
      }),
    status: Joi.string()
      .required()
      .valid("pending", "active", "completed", "cancelled")
      .messages({
        "string.empty": "Status cannot be empty",
        "any.only":
          "Status must be either 'pending', 'active', 'completed', or 'cancelled'",
        "any.required": "Status is required",
      }),
  }),
};

module.exports = {
  userSchemas,
  taskSchemas,
};
