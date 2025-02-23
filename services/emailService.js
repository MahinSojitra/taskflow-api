const nodemailer = require("nodemailer");
const path = require("path");
const { getPasswordResetTemplate } = require("../utils/emailTemplates");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ORGANIZATION_EMAIL,
    pass: process.env.ORGANIZATION_EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"TaskFlow" <${process.env.ORGANIZATION_EMAIL}>`,
      to: email,
      subject: "Reset Your TaskFlow Password",
      html: getPasswordResetTemplate(otp),
      attachments: [
        {
          filename: "taskflow-dark.png",
          path: path.join(__dirname, "../public/images/taskflow-dark.png"),
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send password reset email");
  }
};

module.exports = {
  sendPasswordResetEmail,
};
