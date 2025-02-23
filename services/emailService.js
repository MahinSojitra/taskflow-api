const nodemailer = require("nodemailer");
const { getPasswordResetTemplate } = require("../utils/emailTemplates");

// Base64 encoded logo
const LOGO_BASE64 = "data:image/png;base64,YOUR_BASE64_ENCODED_IMAGE"; // Replace with your actual base64 encoded image

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ORGANIZATION_EMAIL,
      pass: process.env.ORGANIZATION_EMAIL_PASSWORD,
    },
  });
};

const sendPasswordResetEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      return {
        success: false,
        message:
          "Email service is not configured properly. Please contact support.",
        error: "Missing email credentials",
        statusCode: 503,
      };
    }

    // Verify email configuration
    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error("Email configuration error:", verifyError);
      return {
        success: false,
        message: "Email service configuration error. Please check credentials.",
        error: verifyError.message,
        statusCode: 503,
      };
    }

    const mailOptions = {
      from: `"TaskFlow" <${process.env.ORGANIZATION_EMAIL}>`,
      to: email,
      subject: "Reset Your TaskFlow Password",
      html: getPasswordResetTemplate(otp),
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "Password reset email sent successfully",
        statusCode: 200,
      };
    } catch (sendError) {
      console.error("Email sending error:", sendError);

      // Handle specific error cases
      switch (sendError.code) {
        case "EAUTH":
          return {
            success: false,
            message:
              "Invalid email credentials. Please check email configuration.",
            error: "Authentication failed",
            statusCode: 503,
          };

        case "ESOCKET":
          return {
            success: false,
            message:
              "Unable to connect to email service. Please try again later.",
            error: "Connection failed",
            statusCode: 503,
          };

        case "ECONNECTION":
          return {
            success: false,
            message: "Email service connection error. Please try again later.",
            error: "Connection error",
            statusCode: 503,
          };

        case "ETIMEDOUT":
          return {
            success: false,
            message: "Email service timeout. Please try again later.",
            error: "Request timeout",
            statusCode: 504,
          };

        case "EENVELOPE":
          return {
            success: false,
            message: "Invalid email address provided.",
            error: "Invalid recipient",
            statusCode: 400,
          };

        default:
          return {
            success: false,
            message:
              "Failed to send password reset email. Please try again later.",
            error: sendError.message,
            statusCode: 500,
          };
      }
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      error: error.message,
      statusCode: 500,
    };
  }
};

module.exports = {
  sendPasswordResetEmail,
};
