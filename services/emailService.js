const nodemailer = require("nodemailer");
const { getPasswordResetTemplate } = require("../utils/emailTemplates");

// Base64 encoded logo
const LOGO_BASE64 = "data:image/png;base64,YOUR_BASE64_ENCODED_IMAGE"; // Replace with your actual base64 encoded image

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, otp) => {
  try {
    await transporter.verify();

    const mailOptions = {
      from: `"TaskFlow" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your TaskFlow Password",
      html: getPasswordResetTemplate(otp, LOGO_BASE64),
    };

    await transporter.sendMail(mailOptions);
    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error) {
    console.error("Email sending error:", error);

    if (error.code === "EAUTH") {
      return {
        success: false,
        message: "Email service configuration error. Please contact support.",
        error: "Authentication failed",
      };
    }

    return {
      success: false,
      message: "Failed to send password reset email. Please try again later.",
      error: error.message,
    };
  }
};

module.exports = {
  sendPasswordResetEmail,
};
