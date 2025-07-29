const mongoose = require("mongoose");

const oauthAccessTokenSchema = new mongoose.Schema(
  {
    accessToken: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `tf_access_token_${require("crypto").randomBytes(32).toString("hex")}`,
    },
    refreshToken: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `tf_refresh_token_${require("crypto").randomBytes(32).toString("hex")}`,
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
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries and automatic cleanup
oauthAccessTokenSchema.index({ accessToken: 1 });
oauthAccessTokenSchema.index({ refreshToken: 1 });
oauthAccessTokenSchema.index({ clientId: 1 });
oauthAccessTokenSchema.index({ userId: 1 });
oauthAccessTokenSchema.index({ expiresAt: 1 });
oauthAccessTokenSchema.index({ isRevoked: 1 });

// Method to check if token is expired
oauthAccessTokenSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

// Method to check if token is valid for use
oauthAccessTokenSchema.methods.isValid = function () {
  return !this.isRevoked && !this.isExpired();
};

// Method to check if token has specific scope
oauthAccessTokenSchema.methods.hasScope = function (scope) {
  return this.scopes.includes(scope);
};

// Method to check if token has any of the required scopes
oauthAccessTokenSchema.methods.hasAnyScope = function (requiredScopes) {
  return requiredScopes.some((scope) => this.scopes.includes(scope));
};

// Method to check if token has all required scopes
oauthAccessTokenSchema.methods.hasAllScopes = function (requiredScopes) {
  return requiredScopes.every((scope) => this.scopes.includes(scope));
};

// Static method to clean up expired tokens
oauthAccessTokenSchema.statics.cleanupExpired = async function () {
  return this.deleteMany({
    expiresAt: { $lt: new Date() },
  });
};

// Static method to revoke all tokens for a user
oauthAccessTokenSchema.statics.revokeUserTokens = async function (userId) {
  return this.updateMany({ userId, isRevoked: false }, { isRevoked: true });
};

// Static method to revoke all tokens for a client
oauthAccessTokenSchema.statics.revokeClientTokens = async function (clientId) {
  return this.updateMany({ clientId, isRevoked: false }, { isRevoked: true });
};

module.exports = mongoose.model("OAuthAccessToken", oauthAccessTokenSchema);
