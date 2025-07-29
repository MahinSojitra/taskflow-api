const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "A comprehensive task management API with authentication and user management",
      contact: {
        name: "TaskFlow API Support",
        email: "taskflow.api@gmail.com",
        url: "https://taskflowapi.vercel.app/docs",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "https://taskflowapi.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from signin endpoint",
        },
      },
      schemas: {
        // User schemas
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "John Doe" },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            role: { type: "string", enum: ["user", "admin"], example: "user" },
            isEmailVerified: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        UserSignup: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 50,
              pattern: "^[a-zA-Z\\s]+$",
              example: "John Doe",
              description: "Full name (letters and spaces only)",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
              description: "Valid email address",
            },
            password: {
              type: "string",
              minLength: 6,
              maxLength: 30,
              pattern:
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[a-zA-Z\\d!@#$%^&*]{6,30}$",
              example: "Password123!",
              description:
                "Password with uppercase, lowercase, number, and special character",
            },
          },
        },
        UserSignin: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "Password123!",
            },
          },
        },
        ForgotPassword: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        ResetPassword: {
          type: "object",
          required: ["email", "otp", "newPassword"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            otp: {
              type: "string",
              pattern: "^[0-9]+$",
              example: "123456",
              description: "OTP received via email",
            },
            newPassword: {
              type: "string",
              minLength: 6,
              maxLength: 30,
              pattern:
                "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*])[a-zA-Z\\d!@#$%^&*]{6,30}$",
              example: "NewPassword123!",
            },
          },
        },
        EmailAvailability: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        EmailVerification: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        },
        VerifyEmail: {
          type: "object",
          required: ["token"],
          properties: {
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
          },
        },
        // Task schemas
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            title: {
              type: "string",
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              example: "Write comprehensive API documentation",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              example: "2024-12-31T23:59:59.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              example: "pending",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["documentation", "api"],
            },
            userId: { type: "string", example: "507f1f77bcf86cd799439011" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        CreateTask: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              maxLength: 500,
              example: "Write comprehensive API documentation",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              example: "2024-12-31T23:59:59.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              default: "pending",
              example: "pending",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["documentation", "api"],
            },
          },
        },
        UpdateTask: {
          type: "object",
          properties: {
            title: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "Complete project documentation",
            },
            description: {
              type: "string",
              maxLength: 500,
              example: "Write comprehensive API documentation",
            },
            dueDate: {
              type: "string",
              format: "date-time",
              example: "2024-12-31T23:59:59.000Z",
            },
            status: {
              type: "string",
              enum: ["pending", "in-progress", "completed"],
              example: "pending",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              example: ["documentation", "api"],
            },
          },
        },
        // Session schemas
        Session: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            device: {
              type: "object",
              properties: {
                id: { type: "string", example: "device_123" },
                os: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Windows" },
                    version: { type: "string", example: "10" },
                  },
                },
                client: {
                  type: "object",
                  properties: {
                    name: { type: "string", example: "Chrome" },
                    version: { type: "string", example: "120.0.0.0" },
                    type: { type: "string", example: "browser" },
                  },
                },
                platform: { type: "string", example: "Desktop" },
              },
            },
            ip: {
              type: "object",
              properties: {
                address: { type: "string", example: "192.168.1.1" },
                type: { type: "string", example: "ipv4" },
                location: {
                  type: "object",
                  properties: {
                    country: { type: "string", example: "United States" },
                    region: { type: "string", example: "California" },
                    city: { type: "string", example: "San Francisco" },
                  },
                },
              },
            },
            lastActive: { type: "string", format: "date-time" },
            isValid: { type: "boolean", example: true },
          },
        },
        // Response schemas
        SuccessResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Operation completed successfully",
            },
            data: { type: "object" },
            error: { type: "string", nullable: true, example: null },
            request_id: { type: "string", example: "uuid-v4-string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            error: { type: "string", example: "INVALID_REQUEST" },
            request_id: { type: "string", example: "uuid-v4-string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Authentication successful" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                accessToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                refreshToken: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
            error: { type: "string", nullable: true, example: null },
            request_id: { type: "string", example: "uuid-v4-string" },
          },
        },
        // OAuth schemas
        OAuthApp: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            name: { type: "string", example: "My Task Manager" },
            description: {
              type: "string",
              example:
                "A task management application that integrates with TaskFlow",
            },
            clientId: { type: "string", example: "tf_client_abc123def456" },
            clientSecret: { type: "string", example: "tf_secret_xyz789..." },
            maskedClientSecret: { type: "string", example: "tf_secret_...xyz" },
            redirectUris: {
              type: "array",
              items: { type: "string" },
              example: [
                "https://myapp.com/callback",
                "https://myapp.com/auth/callback",
              ],
            },
            scopes: {
              type: "array",
              items: {
                type: "string",
                enum: ["profile", "email", "tasks:read", "tasks:write"],
              },
              example: ["profile", "email", "tasks:read"],
            },
            ownerId: { type: "string", example: "507f1f77bcf86cd799439011" },
            isActive: { type: "boolean", example: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OAuthAuthorizationCode: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            code: { type: "string", example: "tf_auth_code_abc123def456" },
            clientId: { type: "string", example: "tf_client_abc123def456" },
            userId: { type: "string", example: "507f1f77bcf86cd799439011" },
            redirectUri: {
              type: "string",
              example: "https://myapp.com/callback",
            },
            scopes: {
              type: "array",
              items: {
                type: "string",
                enum: ["profile", "email", "tasks:read", "tasks:write"],
              },
              example: ["profile", "email"],
            },
            expiresAt: { type: "string", format: "date-time" },
            isUsed: { type: "boolean", example: false },
            codeChallenge: {
              type: "string",
              example: "E9Melhoa2OwvFrEMTguCXJX_2TM",
            },
            codeChallengeMethod: {
              type: "string",
              enum: ["S256", "plain"],
              example: "S256",
            },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        OAuthAccessToken: {
          type: "object",
          properties: {
            _id: { type: "string", example: "507f1f77bcf86cd799439011" },
            accessToken: {
              type: "string",
              example: "tf_access_token_abc123def456",
            },
            refreshToken: {
              type: "string",
              example: "tf_refresh_token_xyz789ghi012",
            },
            clientId: { type: "string", example: "tf_client_abc123def456" },
            userId: { type: "string", example: "507f1f77bcf86cd799439011" },
            scopes: {
              type: "array",
              items: {
                type: "string",
                enum: ["profile", "email", "tasks:read", "tasks:write"],
              },
              example: ["profile", "email", "tasks:read"],
            },
            expiresAt: { type: "string", format: "date-time" },
            isRevoked: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        OAuthTokenResponse: {
          type: "object",
          properties: {
            access_token: {
              type: "string",
              example: "tf_access_token_abc123def456",
            },
            token_type: { type: "string", example: "Bearer" },
            expires_in: { type: "integer", example: 3600 },
            refresh_token: {
              type: "string",
              example: "tf_refresh_token_xyz789ghi012",
            },
            scope: { type: "string", example: "profile email tasks:read" },
          },
        },
        OAuthUserInfo: {
          type: "object",
          properties: {
            sub: {
              type: "string",
              description: "User ID",
              example: "507f1f77bcf86cd799439011",
            },
            name: {
              type: "string",
              description: "User name (if profile scope)",
              example: "John Doe",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email (if email scope)",
              example: "john@example.com",
            },
            email_verified: {
              type: "boolean",
              description: "Email verification status (if email scope)",
              example: true,
            },
            updated_at: {
              type: "string",
              format: "date-time",
              description: "Last update time (if profile scope)",
            },
          },
        },
        OAuthErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "invalid_request" },
            error_description: {
              type: "string",
              example: "Invalid request parameters",
            },
            state: { type: "string", example: "random_state_string" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
