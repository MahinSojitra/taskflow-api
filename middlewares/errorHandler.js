const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message || err);
  res.status(400).json({ error: err.message || "Internal Server Error" });
};

module.exports = errorHandler;
