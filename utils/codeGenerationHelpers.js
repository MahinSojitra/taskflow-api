const crypto = require("crypto");

function generateToken(numberOfBytes) {
  return crypto.randomBytes(numberOfBytes).toString("hex");
}

function generateOTP(numberOfDigits) {
  return Math.floor(
    10 ** (numberOfDigits - 1) + Math.random() * 9 * 10 ** (numberOfDigits - 1)
  ).toString();
}

module.exports = { generateToken, generateOTP };
