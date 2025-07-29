const OAuthAccessToken = require("../models/OAuthAccessToken");
const OAuthApp = require("../models/OAuthApp");
const { generateOAuthError } = require("../utils/oauth");

/**
 * Middleware to validate OAuth access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateOAuthToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is required",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    // Find the token in database
    const tokenDoc = await OAuthAccessToken.findOne({ accessToken });

    if (!tokenDoc) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is invalid",
      });
    }

    // Check if token is valid
    if (!tokenDoc.isValid()) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is expired or revoked",
      });
    }

    // Get the OAuth app
    const oauthApp = await OAuthApp.findOne({
      clientId: tokenDoc.clientId,
      isActive: true,
    });

    if (!oauthApp) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "OAuth application is not active",
      });
    }

    // Attach token and app info to request
    req.oauthToken = tokenDoc;
    req.oauthApp = oauthApp;

    next();
  } catch (error) {
    console.error("OAuth token validation error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Internal server error",
    });
  }
};

/**
 * Middleware to check if token has specific scope
 * @param {string|Array} requiredScopes - Required scope(s)
 * @returns {Function} Express middleware function
 */
const requireScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.oauthToken) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is required",
      });
    }

    const scopes = Array.isArray(requiredScopes)
      ? requiredScopes
      : [requiredScopes];

    if (!req.oauthToken.hasAllScopes(scopes)) {
      return res.status(403).json({
        error: "insufficient_scope",
        error_description: "Token does not have required scopes",
        scope: scopes.join(" "),
      });
    }

    next();
  };
};

/**
 * Middleware to check if token has any of the required scopes
 * @param {Array} requiredScopes - Required scopes (any of them)
 * @returns {Function} Express middleware function
 */
const requireAnyScope = (requiredScopes) => {
  return (req, res, next) => {
    if (!req.oauthToken) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is required",
      });
    }

    if (!req.oauthToken.hasAnyScope(requiredScopes)) {
      return res.status(403).json({
        error: "insufficient_scope",
        error_description: "Token does not have any of the required scopes",
        scope: requiredScopes.join(" "),
      });
    }

    next();
  };
};

/**
 * Middleware to validate OAuth client credentials
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateOAuthClient = async (req, res, next) => {
  try {
    const { client_id, client_secret } = req.body;

    if (!client_id || !client_secret) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "client_id and client_secret are required",
      });
    }

    // Find the OAuth app
    const oauthApp = await OAuthApp.findOne({
      clientId: client_id,
      isActive: true,
    });

    if (!oauthApp) {
      return res.status(401).json({
        error: "invalid_client",
        error_description: "Client is not registered or inactive",
      });
    }

    // Verify client secret
    if (oauthApp.clientSecret !== client_secret) {
      return res.status(401).json({
        error: "invalid_client",
        error_description: "Invalid client credentials",
      });
    }

    req.oauthApp = oauthApp;
    next();
  } catch (error) {
    console.error("OAuth client validation error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Internal server error",
    });
  }
};

/**
 * Middleware to validate authorization code
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateAuthorizationCode = async (req, res, next) => {
  try {
    const { code, redirect_uri } = req.body;

    if (!code) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Authorization code is required",
      });
    }

    // Find the authorization code
    const authCode = await require("../models/OAuthAuthorizationCode").findOne({
      code,
    });

    if (!authCode) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code is invalid",
      });
    }

    // Check if code is valid
    if (!authCode.isValid()) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code is expired or already used",
      });
    }

    // Validate redirect URI
    if (authCode.redirectUri !== redirect_uri) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Redirect URI does not match",
      });
    }

    // Mark code as used
    authCode.isUsed = true;
    await authCode.save();

    req.authCode = authCode;
    next();
  } catch (error) {
    console.error("Authorization code validation error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Internal server error",
    });
  }
};

/**
 * Middleware to validate refresh token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Refresh token is required",
      });
    }

    // Find the access token by refresh token
    const accessToken = await OAuthAccessToken.findOne({
      refreshToken: refresh_token,
    });

    if (!accessToken) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Refresh token is invalid",
      });
    }

    // Check if token is revoked
    if (accessToken.isRevoked) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Refresh token is revoked",
      });
    }

    req.accessToken = accessToken;
    next();
  } catch (error) {
    console.error("Refresh token validation error:", error);
    return res.status(500).json({
      error: "server_error",
      error_description: "Internal server error",
    });
  }
};

/**
 * Middleware to rate limit OAuth endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const oauthRateLimit = (req, res, next) => {
  // This is a basic rate limiting implementation
  // In production, you should use a proper rate limiting library
  const clientId = req.body.client_id || req.query.client_id;
  const key = `oauth:${clientId || req.ip}`;

  // For now, we'll just pass through
  // TODO: Implement proper rate limiting
  next();
};

module.exports = {
  validateOAuthToken,
  requireScope,
  requireAnyScope,
  validateOAuthClient,
  validateAuthorizationCode,
  validateRefreshToken,
  oauthRateLimit,
};
