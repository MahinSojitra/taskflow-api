const mongoose = require("mongoose");

const oauthAppSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "App name is required"],
      trim: true,
      minlength: [2, "App name must be at least 2 characters long"],
      maxlength: [100, "App name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "App description is required"],
      trim: true,
      minlength: [10, "App description must be at least 10 characters long"],
      maxlength: [500, "App description cannot exceed 500 characters"],
    },
    clientId: {
      type: String,
      required: true,
      unique: true,
      default: () =>
        `tf_client_${require("crypto").randomBytes(16).toString("hex")}`,
    },
    clientSecret: {
      type: String,
      required: true,
      default: () =>
        `tf_secret_${require("crypto").randomBytes(32).toString("hex")}`,
    },
    redirectUris: [
      {
        type: String,
        required: [true, "At least one redirect URI is required"],
        validate: {
          validator: function (uri) {
            // Basic URI validation
            try {
              new URL(uri);
              return true;
            } catch {
              return false;
            }
          },
          message: "Invalid redirect URI format",
        },
      },
    ],
    scopes: [
      {
        type: String,
        enum: ["profile", "email", "tasks:read", "tasks:write"],
        required: [true, "At least one scope is required"],
      },
    ],
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "App owner is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
oauthAppSchema.index({ clientId: 1 });
oauthAppSchema.index({ ownerId: 1 });
oauthAppSchema.index({ isActive: 1 });

// Virtual for masked client secret (for display purposes)
oauthAppSchema.virtual("maskedClientSecret").get(function () {
  if (!this.clientSecret) return null;
  return (
    this.clientSecret.substring(0, 8) +
    "..." +
    this.clientSecret.substring(this.clientSecret.length - 4)
  );
});

// Ensure virtual fields are serialized
oauthAppSchema.set("toJSON", { virtuals: true });
oauthAppSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("OAuthApp", oauthAppSchema);
