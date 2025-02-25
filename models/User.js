const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
    required: true,
  },
  accessToken: {
    type: String,
    required: true,
  },
  deviceInfo: {
    name: {
      type: String,
      default: "Unknown Device",
    },
    type: {
      type: String,
      default: "Unknown",
    },
    os: {
      name: { type: String, default: "Unknown" },
      version: { type: String, default: null },
    },
    client: {
      name: { type: String, default: "Unknown" },
      version: { type: String, default: null },
      type: { type: String, default: "Unknown" },
    },
    brand: { type: String, default: null },
    model: { type: String, default: null },
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
});

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address.",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [6, "Password must be at least 6 characters long."],
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long."],
      maxlength: [50, "Name cannot exceed 50 characters."],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    sessions: [SessionSchema],
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordResetOTP: String,
    passwordResetOTPExpires: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
