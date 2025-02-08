const validateRequest = (requiredFields) => (req, res, next) => {
  try {
    const receivedKeys = Object.keys(req.body);
    const missingKeys = requiredFields.filter(
      (key) => !receivedKeys.includes(key)
    );
    const extraKeys = receivedKeys.filter(
      (key) => !requiredFields.includes(key)
    );

    if (missingKeys.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingKeys.join(", ")}`,
      });
    }

    if (extraKeys.length > 0) {
      return res.status(400).json({
        error: `Unexpected fields in request: ${extraKeys.join(", ")}`,
      });
    }

    next(); // Proceed if validation passes
  } catch (error) {
    next(error);
  }
};

module.exports = validateRequest;
