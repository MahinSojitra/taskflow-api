const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(403).json({ error: "Invalid API key" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = authenticate;
