const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true, length: 64 },
});

module.exports = mongoose.model("User", UserSchema);
