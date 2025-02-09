const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const generateApiKey = () => crypto.randomBytes(32).toString("hex");

const registerUser = async ({ email, password }) => {
  if (!email || !password) throw new Error("Email and password are required");

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    email,
    password: hashedPassword,
    apiKey: generateApiKey(),
  });

  return newUser;
};

const getApiKey = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }
  return user.apiKey;
};

const regenerateApiKey = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error("Invalid email or password");
  }
  user.apiKey = generateApiKey();
  await user.save();
  return user.apiKey;
};

module.exports = { registerUser, getApiKey, regenerateApiKey };
