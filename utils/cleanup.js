const OAuthAccessToken = require("../models/OAuthAccessToken");
const OAuthAuthorizationCode = require("../models/OAuthAuthorizationCode");

/**
 * Clean up expired OAuth tokens and authorization codes
 * This should be run periodically (e.g., via cron job)
 */
async function cleanupExpiredOAuthData() {
  try {
    console.log("Starting OAuth cleanup...");

    // Clean up expired access tokens
    const expiredTokens = await OAuthAccessToken.cleanupExpired();
    console.log(
      `Cleaned up ${expiredTokens.deletedCount} expired access tokens`
    );

    // Clean up expired authorization codes
    const expiredCodes = await OAuthAuthorizationCode.cleanupExpired();
    console.log(
      `Cleaned up ${expiredCodes.deletedCount} expired authorization codes`
    );

    console.log("OAuth cleanup completed successfully");

    return {
      success: true,
      expiredTokens: expiredTokens.deletedCount,
      expiredCodes: expiredCodes.deletedCount,
    };
  } catch (error) {
    console.error("Error during OAuth cleanup:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get OAuth statistics
 */
async function getOAuthStats() {
  try {
    const [activeTokens, activeCodes, totalApps] = await Promise.all([
      OAuthAccessToken.countDocuments({
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      }),
      OAuthAuthorizationCode.countDocuments({
        isUsed: false,
        expiresAt: { $gt: new Date() },
      }),
      require("../models/OAuthApp").countDocuments({ isActive: true }),
    ]);

    return {
      success: true,
      stats: {
        activeTokens,
        activeCodes,
        totalApps,
      },
    };
  } catch (error) {
    console.error("Error getting OAuth stats:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// If this script is run directly
if (require.main === module) {
  cleanupExpiredOAuthData()
    .then((result) => {
      if (result.success) {
        console.log("Cleanup completed successfully");
        process.exit(0);
      } else {
        console.error("Cleanup failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("Unexpected error:", error);
      process.exit(1);
    });
}

module.exports = {
  cleanupExpiredOAuthData,
  getOAuthStats,
};
