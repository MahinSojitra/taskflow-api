const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Please check your input and try again",
        errors: error.details.map((detail) => detail.message),
      });
    }

    next();
  };
};

module.exports = validateRequest;
