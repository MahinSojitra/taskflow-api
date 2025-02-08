const validateUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res.status(400).json({
      error: "Password must be at least 6 characters long",
    });
  }

  next();
};

module.exports = validateUser;
