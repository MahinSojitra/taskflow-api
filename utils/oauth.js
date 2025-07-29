const crypto = require("crypto");

/**
 * Generate a cryptographically secure random token
 * @param {number} length - Length of the token
 * @param {string} prefix - Prefix for the token
 * @returns {string} Generated token
 */
function generateToken(length = 32, prefix = "") {
  const randomBytes = crypto.randomBytes(length);
  const token = randomBytes.toString("hex");
  return prefix ? `${prefix}${token}` : token;
}

/**
 * Generate PKCE code challenge from code verifier
 * @param {string} codeVerifier - The code verifier
 * @returns {string} The code challenge
 */
function generateCodeChallenge(codeVerifier) {
  const hash = crypto.createHash("sha256");
  hash.update(codeVerifier);
  return hash.digest("base64url");
}

/**
 * Generate PKCE code verifier
 * @param {number} length - Length of the code verifier (43-128 characters)
 * @returns {string} The code verifier
 */
function generateCodeVerifier(length = 64) {
  return crypto.randomBytes(length).toString("base64url");
}

/**
 * Validate redirect URI against registered URIs
 * @param {string} redirectUri - The redirect URI to validate
 * @param {Array} registeredUris - Array of registered redirect URIs
 * @returns {boolean} Whether the redirect URI is valid
 */
function validateRedirectUri(redirectUri, registeredUris) {
  if (!redirectUri || !registeredUris || !Array.isArray(registeredUris)) {
    return false;
  }

  try {
    const uri = new URL(redirectUri);

    // Check if the URI is in the registered list
    return registeredUris.some((registeredUri) => {
      try {
        const registered = new URL(registeredUri);
        return (
          uri.origin === registered.origin &&
          uri.pathname === registered.pathname
        );
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

/**
 * Validate requested scopes against available scopes
 * @param {Array} requestedScopes - Array of requested scopes
 * @param {Array} availableScopes - Array of available scopes
 * @returns {Object} Validation result with valid and invalid scopes
 */
function validateScopes(requestedScopes, availableScopes) {
  if (!requestedScopes || !Array.isArray(requestedScopes)) {
    return { valid: [], invalid: [], isValid: false };
  }

  const validScopes = requestedScopes.filter((scope) =>
    availableScopes.includes(scope)
  );
  const invalidScopes = requestedScopes.filter(
    (scope) => !availableScopes.includes(scope)
  );

  return {
    valid: validScopes,
    invalid: invalidScopes,
    isValid: invalidScopes.length === 0,
  };
}

/**
 * Parse scope string into array
 * @param {string} scopeString - Space-separated scope string
 * @returns {Array} Array of scopes
 */
function parseScopes(scopeString) {
  if (!scopeString) return [];
  return scopeString.split(" ").filter((scope) => scope.trim());
}

/**
 * Format scopes array into string
 * @param {Array} scopes - Array of scopes
 * @returns {string} Space-separated scope string
 */
function formatScopes(scopes) {
  if (!scopes || !Array.isArray(scopes)) return "";
  return scopes.join(" ");
}

/**
 * Generate OAuth error response
 * @param {string} error - Error code
 * @param {string} errorDescription - Error description
 * @param {string} state - State parameter (optional)
 * @returns {Object} OAuth error response
 */
function generateOAuthError(error, errorDescription, state = null) {
  const response = {
    error,
    error_description: errorDescription,
  };

  if (state) {
    response.state = state;
  }

  return response;
}

/**
 * Validate OAuth authorization request parameters
 * @param {Object} params - Request parameters
 * @returns {Object} Validation result
 */
function validateAuthorizationRequest(params) {
  const { client_id, redirect_uri, response_type, scope, state } = params;
  const errors = [];

  if (!client_id) {
    errors.push("client_id is required");
  }

  if (!redirect_uri) {
    errors.push("redirect_uri is required");
  }

  if (response_type !== "code") {
    errors.push('response_type must be "code"');
  }

  if (!scope) {
    errors.push("scope is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate OAuth token request parameters
 * @param {Object} params - Request parameters
 * @returns {Object} Validation result
 */
function validateTokenRequest(params) {
  const { grant_type, client_id, client_secret } = params;
  const errors = [];

  if (!grant_type) {
    errors.push("grant_type is required");
  }

  if (!client_id) {
    errors.push("client_id is required");
  }

  if (!client_secret) {
    errors.push("client_secret is required");
  }

  if (grant_type === "authorization_code") {
    if (!params.code) {
      errors.push("code is required for authorization_code grant type");
    }
    if (!params.redirect_uri) {
      errors.push("redirect_uri is required for authorization_code grant type");
    }
  } else if (grant_type === "refresh_token") {
    if (!params.refresh_token) {
      errors.push("refresh_token is required for refresh_token grant type");
    }
  } else {
    errors.push("unsupported grant_type");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate user info response based on scopes
 * @param {Object} user - User object
 * @param {Array} scopes - Granted scopes
 * @returns {Object} User info response
 */
function generateUserInfo(user, scopes) {
  const response = {
    sub: user._id.toString(), // Always include subject identifier
  };

  if (scopes.includes("profile")) {
    response.name = user.name;
    response.updated_at = user.updatedAt;
  }

  if (scopes.includes("email")) {
    response.email = user.email;
    response.email_verified = user.isEmailVerified;
  }

  return response;
}

/**
 * Calculate token expiration time
 * @param {number} hours - Hours until expiration
 * @returns {Date} Expiration date
 */
function calculateExpiration(hours = 1) {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Check if a date is expired
 * @param {Date} date - Date to check
 * @returns {boolean} Whether the date is expired
 */
function isExpired(date) {
  return new Date() > date;
}

module.exports = {
  generateToken,
  generateCodeChallenge,
  generateCodeVerifier,
  validateRedirectUri,
  validateScopes,
  parseScopes,
  formatScopes,
  generateOAuthError,
  validateAuthorizationRequest,
  validateTokenRequest,
  generateUserInfo,
  calculateExpiration,
  isExpired,
};
