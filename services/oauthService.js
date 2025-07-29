const OAuthApp = require("../models/OAuthApp");
const OAuthAuthorizationCode = require("../models/OAuthAuthorizationCode");
const OAuthAccessToken = require("../models/OAuthAccessToken");
const User = require("../models/User");
const {
  generateToken,
  validateRedirectUri,
  validateScopes,
  parseScopes,
  formatScopes,
  generateUserInfo,
  calculateExpiration,
} = require("../utils/oauth");

class OAuthService {
  /**
   * Create a new OAuth application
   * @param {Object} appData - Application data
   * @param {string} ownerId - Owner user ID
   * @returns {Object} Created OAuth app
   */
  static async createOAuthApp(appData, ownerId) {
    try {
      const oauthApp = new OAuthApp({
        ...appData,
        ownerId,
      });

      await oauthApp.save();
      return {
        success: true,
        data: oauthApp,
        message: "OAuth application created successfully",
      };
    } catch (error) {
      console.error("Error creating OAuth app:", error);
      return {
        success: false,
        message: "Failed to create OAuth application",
        error: error.message,
      };
    }
  }

  /**
   * Get OAuth apps for a user
   * @param {string} userId - User ID
   * @returns {Object} OAuth apps
   */
  static async getUserOAuthApps(userId) {
    try {
      const apps = await OAuthApp.find({ ownerId: userId }).sort({
        createdAt: -1,
      });
      return {
        success: true,
        data: apps,
        message: "OAuth applications retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting user OAuth apps:", error);
      return {
        success: false,
        message: "Failed to retrieve OAuth applications",
        error: error.message,
      };
    }
  }

  /**
   * Get a specific OAuth app
   * @param {string} appId - App ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Object} OAuth app
   */
  static async getOAuthApp(appId, userId) {
    try {
      const app = await OAuthApp.findOne({ _id: appId, ownerId: userId });

      if (!app) {
        return {
          success: false,
          message: "OAuth application not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: app,
        message: "OAuth application retrieved successfully",
      };
    } catch (error) {
      console.error("Error getting OAuth app:", error);
      return {
        success: false,
        message: "Failed to retrieve OAuth application",
        error: error.message,
      };
    }
  }

  /**
   * Update an OAuth app
   * @param {string} appId - App ID
   * @param {Object} updateData - Update data
   * @param {string} userId - User ID
   * @returns {Object} Updated OAuth app
   */
  static async updateOAuthApp(appId, updateData, userId) {
    try {
      const app = await OAuthApp.findOneAndUpdate(
        { _id: appId, ownerId: userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!app) {
        return {
          success: false,
          message: "OAuth application not found",
          statusCode: 404,
        };
      }

      return {
        success: true,
        data: app,
        message: "OAuth application updated successfully",
      };
    } catch (error) {
      console.error("Error updating OAuth app:", error);
      return {
        success: false,
        message: "Failed to update OAuth application",
        error: error.message,
      };
    }
  }

  /**
   * Delete an OAuth app
   * @param {string} appId - App ID
   * @param {string} userId - User ID
   * @returns {Object} Deletion result
   */
  static async deleteOAuthApp(appId, userId) {
    try {
      const app = await OAuthApp.findOneAndDelete({
        _id: appId,
        ownerId: userId,
      });

      if (!app) {
        return {
          success: false,
          message: "OAuth application not found",
          statusCode: 404,
        };
      }

      // Revoke all tokens for this app
      await OAuthAccessToken.revokeClientTokens(app.clientId);

      return {
        success: true,
        message: "OAuth application deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting OAuth app:", error);
      return {
        success: false,
        message: "Failed to delete OAuth application",
        error: error.message,
      };
    }
  }

  /**
   * Regenerate client secret for an OAuth app
   * @param {string} appId - App ID
   * @param {string} userId - User ID
   * @returns {Object} Updated OAuth app
   */
  static async regenerateClientSecret(appId, userId) {
    try {
      const app = await OAuthApp.findOne({ _id: appId, ownerId: userId });

      if (!app) {
        return {
          success: false,
          message: "OAuth application not found",
          statusCode: 404,
        };
      }

      // Generate new client secret
      app.clientSecret = `tf_secret_${require("crypto")
        .randomBytes(32)
        .toString("hex")}`;
      await app.save();

      return {
        success: true,
        data: app,
        message: "Client secret regenerated successfully",
      };
    } catch (error) {
      console.error("Error regenerating client secret:", error);
      return {
        success: false,
        message: "Failed to regenerate client secret",
        error: error.message,
      };
    }
  }

  /**
   * Validate OAuth authorization request
   * @param {Object} params - Authorization parameters
   * @returns {Object} Validation result
   */
  static async validateAuthorizationRequest(params) {
    try {
      const { client_id, redirect_uri, scope, state } = params;

      // Find the OAuth app
      const oauthApp = await OAuthApp.findOne({
        clientId: client_id,
        isActive: true,
      });

      if (!oauthApp) {
        return {
          success: false,
          error: "unauthorized_client",
          error_description: "Client is not registered or inactive",
        };
      }

      // Validate redirect URI
      if (!validateRedirectUri(redirect_uri, oauthApp.redirectUris)) {
        return {
          success: false,
          error: "invalid_request",
          error_description: "Invalid redirect URI",
        };
      }

      // Validate scopes
      const requestedScopes = parseScopes(scope);
      const scopeValidation = validateScopes(requestedScopes, oauthApp.scopes);

      if (!scopeValidation.isValid) {
        return {
          success: false,
          error: "invalid_scope",
          error_description: "Invalid scopes requested",
          scope: scopeValidation.invalid.join(" "),
        };
      }

      return {
        success: true,
        data: {
          oauthApp,
          validScopes: scopeValidation.valid,
          state,
        },
      };
    } catch (error) {
      console.error("Error validating authorization request:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Internal server error",
      };
    }
  }

  /**
   * Create authorization code
   * @param {Object} params - Authorization parameters
   * @param {string} userId - User ID
   * @returns {Object} Authorization code
   */
  static async createAuthorizationCode(params, userId) {
    try {
      const {
        oauthApp,
        validScopes,
        redirectUri,
        state,
        codeChallenge,
        codeChallengeMethod,
      } = params;

      const authCode = new OAuthAuthorizationCode({
        clientId: oauthApp.clientId,
        userId,
        redirectUri,
        scopes: validScopes,
        codeChallenge,
        codeChallengeMethod,
      });

      await authCode.save();

      return {
        success: true,
        data: {
          code: authCode.code,
          state,
        },
      };
    } catch (error) {
      console.error("Error creating authorization code:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to create authorization code",
      };
    }
  }

  /**
   * Exchange authorization code for tokens
   * @param {Object} authCode - Authorization code document
   * @returns {Object} Access and refresh tokens
   */
  static async exchangeCodeForTokens(authCode) {
    try {
      // Create access token
      const accessToken = new OAuthAccessToken({
        clientId: authCode.clientId,
        userId: authCode.userId,
        scopes: authCode.scopes,
        expiresAt: calculateExpiration(1), // 1 hour
      });

      await accessToken.save();

      return {
        success: true,
        data: {
          access_token: accessToken.accessToken,
          token_type: "Bearer",
          expires_in: 3600, // 1 hour in seconds
          refresh_token: accessToken.refreshToken,
          scope: formatScopes(accessToken.scopes),
        },
      };
    } catch (error) {
      console.error("Error exchanging code for tokens:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to exchange authorization code",
      };
    }
  }

  /**
   * Refresh access token
   * @param {Object} accessToken - Current access token document
   * @returns {Object} New access and refresh tokens
   */
  static async refreshAccessToken(accessToken) {
    try {
      // Create new access token
      const newAccessToken = new OAuthAccessToken({
        clientId: accessToken.clientId,
        userId: accessToken.userId,
        scopes: accessToken.scopes,
        expiresAt: calculateExpiration(1), // 1 hour
      });

      await newAccessToken.save();

      // Revoke old access token
      accessToken.isRevoked = true;
      await accessToken.save();

      return {
        success: true,
        data: {
          access_token: newAccessToken.accessToken,
          token_type: "Bearer",
          expires_in: 3600, // 1 hour in seconds
          refresh_token: newAccessToken.refreshToken,
          scope: formatScopes(newAccessToken.scopes),
        },
      };
    } catch (error) {
      console.error("Error refreshing access token:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to refresh access token",
      };
    }
  }

  /**
   * Revoke access token
   * @param {string} accessToken - Access token to revoke
   * @returns {Object} Revocation result
   */
  static async revokeAccessToken(accessToken) {
    try {
      const token = await OAuthAccessToken.findOne({ accessToken });

      if (token) {
        token.isRevoked = true;
        await token.save();
      }

      return {
        success: true,
        message: "Token revoked successfully",
      };
    } catch (error) {
      console.error("Error revoking access token:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to revoke access token",
      };
    }
  }

  /**
   * Get user information based on token scopes
   * @param {Object} accessToken - Access token document
   * @returns {Object} User information
   */
  static async getUserInfo(accessToken) {
    try {
      const user = await User.findById(accessToken.userId);

      if (!user) {
        return {
          success: false,
          error: "invalid_token",
          error_description: "User not found",
        };
      }

      const userInfo = generateUserInfo(user, accessToken.scopes);

      return {
        success: true,
        data: userInfo,
      };
    } catch (error) {
      console.error("Error getting user info:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to get user information",
      };
    }
  }

  /**
   * Clean up expired tokens and codes
   * @returns {Object} Cleanup result
   */
  static async cleanupExpired() {
    try {
      const [expiredTokens, expiredCodes] = await Promise.all([
        OAuthAccessToken.cleanupExpired(),
        OAuthAuthorizationCode.cleanupExpired(),
      ]);

      return {
        success: true,
        data: {
          expiredTokens: expiredTokens.deletedCount,
          expiredCodes: expiredCodes.deletedCount,
        },
        message: "Cleanup completed successfully",
      };
    } catch (error) {
      console.error("Error during cleanup:", error);
      return {
        success: false,
        error: "server_error",
        error_description: "Failed to cleanup expired tokens",
      };
    }
  }
}

module.exports = OAuthService;
