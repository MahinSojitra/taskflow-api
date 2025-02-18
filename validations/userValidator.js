const Joi = require("joi");

const userSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is required",
  }),
});

const validateUser = (req, res, next) => {
  const { email, password } = req.body;

  // Basic validation
  if (req.path === "/register" && !req.body.name) {
    return res.status(400).json({
      success: false,
      message: "Name is required.",
    });
  }

  if (!email || !email.includes("@")) {
    return res.status(400).json({
      success: false,
      message: "Valid email is required.",
    });
  }

  if (req.path !== "/forgot-password") {
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }
  }

  next();
};

module.exports = validateUser;
