const mongoose = require("mongoose");

const oauthAuthorizationCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `tf_auth_code_${require("crypto").randomBytes(32).toString("hex")}`,
    },
    clientId: {
      type: String,
      required: [true, "Client ID is required"],
      ref: "OAuthApp",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    redirectUri: {
      type: String,
      required: [true, "Redirect URI is required"],
    },
    scopes: [
      {
        type: String,
        enum: ["profile", "email", "tasks:read", "tasks:write"],
        required: [true, "At least one scope is required"],
      },
    ],
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    codeChallenge: {
      type: String,
      required: false, // For PKCE support
    },
    codeChallengeMethod: {
      type: String,
      enum: ["S256", "plain"],
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries and automatic cleanup
oauthAuthorizationCodeSchema.index({ code: 1 });
oauthAuthorizationCodeSchema.index({ clientId: 1 });
oauthAuthorizationCodeSchema.index({ userId: 1 });
oauthAuthorizationCodeSchema.index({ expiresAt: 1 });
oauthAuthorizationCodeSchema.index({ isUsed: 1 });

// Method to check if code is expired
oauthAuthorizationCodeSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to check if code is valid for use
oauthAuthorizationCodeSchema.methods.isValid = function () {
  return !this.isUsed && !this.isExpired();
};

// Static method to clean up expired codes
oauthAuthorizationCodeSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

module.exports = mongoose.model(
  "OAuthAuthorizationCode",
  oauthAuthorizationCodeSchema
);
