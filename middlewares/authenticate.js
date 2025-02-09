const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key")?.trim();

    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    const user = await User.findOne({ apiKey }).lean();

    if (!user) {
      return res.status(403).json({ error: "API key is invalid or expired" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Authentication Error: ${error.message}`, {
      route: req.originalUrl,
    });
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authenticate;
