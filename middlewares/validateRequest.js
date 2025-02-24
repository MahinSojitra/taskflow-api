const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          "Oops! Something seems off. Please review your input and give it another try.",
        errors: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

module.exports = validateRequest;
