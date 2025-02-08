const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: { type: String, required: true, minlength: 6 },
  apiKey: { type: String, required: true, unique: true, length: 64 },
});

// Pre-save Hook to Validate Data
UserSchema.pre("save", function (next) {
  if (!this.email || !this.password) {
    return next(new Error("Email and password are required"));
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
