const express = require("express");
const OAuthService = require("../services/oauthService");
const { protect } = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const {
  validateOAuthToken,
  requireScope,
  requireAnyScope,
  validateOAuthClient,
  validateAuthorizationCode,
  validateRefreshToken,
  oauthRateLimit,
} = require("../middlewares/oauth");
const { AppError } = require("../middlewares/errorHandler");

const router = express.Router();

/**
 * @swagger
 * /api/oauth/apps:
 *   get:
 *     tags:
 *       - OAuth Management
 *     summary: Get user's OAuth applications
 *     description: Retrieve all OAuth applications created by the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OAuth applications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OAuthApp'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/apps", protect, authorize("user", "admin"), async (req, res) => {
  try {
    const result = await OAuthService.getUserOAuthApps(req.user.id);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: "OAUTH_APPS_RETRIEVAL_FAILED",
      });
    }

    res.status(200).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    next(new AppError("Failed to retrieve OAuth applications", 500));
  }
});

/**
 * @swagger
 * /api/oauth/apps:
 *   post:
 *     tags:
 *       - OAuth Management
 *     summary: Create new OAuth application
 *     description: Create a new OAuth application for third-party integrations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - redirectUris
 *               - scopes
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: 'My Task Manager'
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: 'A task management application that integrates with TaskFlow'
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 example: ['https://myapp.com/callback', 'https://myapp.com/auth/callback']
 *               scopes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [profile, email, tasks:read, tasks:write]
 *                 example: ['profile', 'email', 'tasks:read']
 *     responses:
 *       201:
 *         description: OAuth application created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OAuthApp'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/apps",
  protect,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const result = await OAuthService.createOAuthApp(req.body, req.user.id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message,
          error: "OAUTH_APP_CREATION_FAILED",
        });
      }

      res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      next(new AppError("Failed to create OAuth application", 500));
    }
  }
);

/**
 * @swagger
 * /api/oauth/apps/{id}:
 *   get:
 *     tags:
 *       - OAuth Management
 *     summary: Get specific OAuth application
 *     description: Retrieve details of a specific OAuth application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth application ID
 *     responses:
 *       200:
 *         description: OAuth application retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OAuthApp'
 *       404:
 *         description: OAuth application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/apps/:id",
  protect,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const result = await OAuthService.getOAuthApp(req.params.id, req.user.id);

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          success: false,
          message: result.message,
          error: "OAUTH_APP_RETRIEVAL_FAILED",
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      next(new AppError("Failed to retrieve OAuth application", 500));
    }
  }
);

/**
 * @swagger
 * /api/oauth/apps/{id}:
 *   put:
 *     tags:
 *       - OAuth Management
 *     summary: Update OAuth application
 *     description: Update an existing OAuth application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               redirectUris:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               scopes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [profile, email, tasks:read, tasks:write]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: OAuth application updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OAuthApp'
 *       404:
 *         description: OAuth application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/apps/:id",
  protect,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const result = await OAuthService.updateOAuthApp(
        req.params.id,
        req.body,
        req.user.id
      );

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          success: false,
          message: result.message,
          error: "OAUTH_APP_UPDATE_FAILED",
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      next(new AppError("Failed to update OAuth application", 500));
    }
  }
);

/**
 * @swagger
 * /api/oauth/apps/{id}:
 *   delete:
 *     tags:
 *       - OAuth Management
 *     summary: Delete OAuth application
 *     description: Delete an OAuth application and revoke all associated tokens
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth application ID
 *     responses:
 *       200:
 *         description: OAuth application deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: OAuth application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/apps/:id",
  protect,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const result = await OAuthService.deleteOAuthApp(
        req.params.id,
        req.user.id
      );

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          success: false,
          message: result.message,
          error: "OAUTH_APP_DELETION_FAILED",
        });
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(new AppError("Failed to delete OAuth application", 500));
    }
  }
);

/**
 * @swagger
 * /api/oauth/apps/{id}/regenerate-secret:
 *   post:
 *     tags:
 *       - OAuth Management
 *     summary: Regenerate client secret
 *     description: Generate a new client secret for an OAuth application
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth application ID
 *     responses:
 *       200:
 *         description: Client secret regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/OAuthApp'
 *       404:
 *         description: OAuth application not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/apps/:id/regenerate-secret",
  protect,
  authorize("user", "admin"),
  async (req, res, next) => {
    try {
      const result = await OAuthService.regenerateClientSecret(
        req.params.id,
        req.user.id
      );

      if (!result.success) {
        return res.status(result.statusCode || 500).json({
          success: false,
          message: result.message,
          error: "OAUTH_SECRET_REGENERATION_FAILED",
        });
      }

      res.status(200).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      next(new AppError("Failed to regenerate client secret", 500));
    }
  }
);

/**
 * @swagger
 * /api/oauth/authorize:
 *   get:
 *     tags:
 *       - OAuth Flow
 *     summary: OAuth authorization endpoint
 *     description: Handle OAuth 2.0 authorization requests
 *     parameters:
 *       - in: query
 *         name: client_id
 *         required: true
 *         schema:
 *           type: string
 *         description: OAuth client ID
 *       - in: query
 *         name: redirect_uri
 *         required: true
 *         schema:
 *           type: string
 *           format: uri
 *         description: Redirect URI after authorization
 *       - in: query
 *         name: response_type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [code]
 *         description: Response type (must be 'code')
 *       - in: query
 *         name: scope
 *         required: true
 *         schema:
 *           type: string
 *         description: Space-separated list of requested scopes
 *       - in: query
 *         name: state
 *         required: false
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *       - in: query
 *         name: code_challenge
 *         required: false
 *         schema:
 *           type: string
 *         description: PKCE code challenge
 *       - in: query
 *         name: code_challenge_method
 *         required: false
 *         schema:
 *           type: string
 *           enum: [S256, plain]
 *         description: PKCE code challenge method
 *     responses:
 *       200:
 *         description: Authorization page (HTML)
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 *       401:
 *         description: Unauthorized client
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 */
router.get("/authorize", oauthRateLimit, async (req, res, next) => {
  try {
    const result = await OAuthService.validateAuthorizationRequest(req.query);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // For now, redirect to a consent page
    // In a real implementation, you'd show a consent page
    const consentUrl = `/oauth/consent?client_id=${
      req.query.client_id
    }&redirect_uri=${encodeURIComponent(
      req.query.redirect_uri
    )}&scope=${encodeURIComponent(req.query.scope)}&state=${
      req.query.state || ""
    }`;

    res.redirect(consentUrl);
  } catch (error) {
    next(new AppError("Authorization request failed", 500));
  }
});

/**
 * @swagger
 * /api/oauth/authorize:
 *   post:
 *     tags:
 *       - OAuth Flow
 *     summary: Handle OAuth consent
 *     description: Process user consent for OAuth authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - client_id
 *               - redirect_uri
 *               - scope
 *               - action
 *             properties:
 *               client_id:
 *                 type: string
 *               redirect_uri:
 *                 type: string
 *                 format: uri
 *               scope:
 *                 type: string
 *               state:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [approve, deny]
 *     responses:
 *       302:
 *         description: Redirect to client application
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 */
router.post("/authorize", oauthRateLimit, protect, async (req, res, next) => {
  try {
    const { client_id, redirect_uri, scope, state, action } = req.body;

    if (action === "deny") {
      const errorUrl = `${redirect_uri}?error=access_denied&error_description=User denied authorization&state=${
        state || ""
      }`;
      return res.redirect(errorUrl);
    }

    const result = await OAuthService.validateAuthorizationRequest({
      client_id,
      redirect_uri,
      scope,
      state,
    });

    if (!result.success) {
      const errorUrl = `${redirect_uri}?error=${
        result.error
      }&error_description=${encodeURIComponent(
        result.error_description
      )}&state=${state || ""}`;
      return res.redirect(errorUrl);
    }

    // Create authorization code
    const authCodeResult = await OAuthService.createAuthorizationCode(
      {
        oauthApp: result.data.oauthApp,
        validScopes: result.data.validScopes,
        redirectUri: redirect_uri,
        state,
      },
      req.user.id
    );

    if (!authCodeResult.success) {
      const errorUrl = `${redirect_uri}?error=server_error&error_description=Failed to create authorization code&state=${
        state || ""
      }`;
      return res.redirect(errorUrl);
    }

    // Redirect with authorization code
    const successUrl = `${redirect_uri}?code=${
      authCodeResult.data.code
    }&state=${state || ""}`;
    res.redirect(successUrl);
  } catch (error) {
    next(new AppError("Authorization consent failed", 500));
  }
});

/**
 * @swagger
 * /api/oauth/token:
 *   post:
 *     tags:
 *       - OAuth Flow
 *     summary: OAuth token endpoint
 *     description: Exchange authorization code for access token or refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - grant_type
 *               - client_id
 *               - client_secret
 *             properties:
 *               grant_type:
 *                 type: string
 *                 enum: [authorization_code, refresh_token]
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *               code:
 *                 type: string
 *                 description: Authorization code (for authorization_code grant)
 *               redirect_uri:
 *                 type: string
 *                 format: uri
 *                 description: Redirect URI (for authorization_code grant)
 *               refresh_token:
 *                 type: string
 *                 description: Refresh token (for refresh_token grant)
 *     responses:
 *       200:
 *         description: Token response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                 token_type:
 *                   type: string
 *                   example: Bearer
 *                 expires_in:
 *                   type: integer
 *                   example: 3600
 *                 refresh_token:
 *                   type: string
 *                 scope:
 *                   type: string
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 *       401:
 *         description: Invalid client credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 */
router.post("/token", oauthRateLimit, async (req, res, next) => {
  try {
    const { grant_type } = req.body;

    if (grant_type === "authorization_code") {
      // Validate client credentials
      const clientValidation = await validateOAuthClient(req, res, () => {});
      if (clientValidation) return; // Error response already sent

      // Validate authorization code
      const codeValidation = await validateAuthorizationCode(
        req,
        res,
        () => {}
      );
      if (codeValidation) return; // Error response already sent

      // Exchange code for tokens
      const result = await OAuthService.exchangeCodeForTokens(req.authCode);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result.data);
    } else if (grant_type === "refresh_token") {
      // Validate client credentials
      const clientValidation = await validateOAuthClient(req, res, () => {});
      if (clientValidation) return; // Error response already sent

      // Validate refresh token
      const tokenValidation = await validateRefreshToken(req, res, () => {});
      if (tokenValidation) return; // Error response already sent

      // Refresh access token
      const result = await OAuthService.refreshAccessToken(req.accessToken);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(200).json(result.data);
    } else {
      res.status(400).json({
        error: "unsupported_grant_type",
        error_description: "Unsupported grant type",
      });
    }
  } catch (error) {
    next(new AppError("Token exchange failed", 500));
  }
});

/**
 * @swagger
 * /api/oauth/revoke:
 *   post:
 *     tags:
 *       - OAuth Flow
 *     summary: Revoke OAuth token
 *     description: Revoke an access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Access token to revoke
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 */
router.post("/revoke", oauthRateLimit, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "invalid_request",
        error_description: "Token is required",
      });
    }

    const result = await OAuthService.revokeAccessToken(token);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(new AppError("Token revocation failed", 500));
  }
});

/**
 * @swagger
 * /api/oauth/userinfo:
 *   get:
 *     tags:
 *       - OAuth Flow
 *     summary: Get user information
 *     description: Retrieve user information based on token scopes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sub:
 *                   type: string
 *                   description: User ID
 *                 name:
 *                   type: string
 *                   description: User name (if profile scope)
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User email (if email scope)
 *                 email_verified:
 *                   type: boolean
 *                   description: Email verification status (if email scope)
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Last update time (if profile scope)
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 error_description:
 *                   type: string
 */
router.get(
  "/userinfo",
  oauthRateLimit,
  validateOAuthToken,
  async (req, res, next) => {
    try {
      const result = await OAuthService.getUserInfo(req.oauthToken);

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.status(200).json(result.data);
    } catch (error) {
      next(new AppError("Failed to get user information", 500));
    }
  }
);

module.exports = router;
