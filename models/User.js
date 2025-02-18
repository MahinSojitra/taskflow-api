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
  name: { type: String, required: true, trim: true },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
