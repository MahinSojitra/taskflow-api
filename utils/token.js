const crypto = require("crypto");

function generateToken64() {
  return crypto.randomBytes(32).toString("hex");
}

function generateOTP(numberOfDigits) {
  return Math.floor(
    10 ** (numberOfDigits - 1) + Math.random() * 9 * 10 ** (numberOfDigits - 1)
  ).toString();
}

module.exports = { generateToken64, generateOTP };
