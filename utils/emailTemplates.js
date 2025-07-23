const baseUrl = "https://taskflowapi.vercel.app";
const logoLight = `${baseUrl}/assets/images/taskflow-light.png`;
const logoDark = `${baseUrl}/assets/images/taskflow-dark.png`;

const getPasswordResetTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap");

        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
        }
        .header {
          text-align: center;
          padding: 20px 0px 10px 0px;
          display: flex;
          align-items: center;
          justify-content: start;
        }
        .logo {
          width: 50px;
          height: auto;
          margin-right: 4px;
        }
        .brand-name {
          font-size: 24px;
          font-weight: bold;
          color: black;
          font-family: "Atkinson Hyperlegible Next", "Arial", sans-serif;
        }
        .content {
          background: white;
          padding: 30px;
          border-radius: 8px;
        }
        .otp {
          text-align: center;
          font-size: 32px;
          letter-spacing: 5px;
          color: #2563eb;
          padding: 20px;
          margin: 20px 0;
          background: #f0f7ff;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
        .copyright {
          font-size: 14px;
          margin-top: 0px;
          color: black;
        }

        @media (prefers-color-scheme: dark) {
          body {
            background-color: #121212;
            color: #e8eaed;
          }
          .container {
            background-color: #1f1f1f;
          }
          .content {
            background-color: #333;
            color: #e8eaed;
          }
          .otp {
            background-color: #1a1a1a;
            border-color: #5f6368;
            color: #1a73e8;
          }
          .footer {
            color: #9aa0a6;
          }
          .copyright {
            color: white;
          }
          .logo-light {
            display: none;
          }
          .logo-dark {
            display: block;
          }
          .brand-name {
            color: #e8eaed;
          }
        }

        @media (prefers-color-scheme: light) {
          .logo-light {
            display: block;
          }
          .logo-dark {
            display: none;
          }
          .brand-name {
            color: black;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoDark}" alt="TaskFlow Logo" class="logo" />
          <span class="brand-name">Task Flow</span>
        </div>
        <div class="content">
          <p>Hey there,</p>
          <p>
            We’ve received a request to reset your TaskFlow password. To get
            things rolling, just enter the verification code below and you’ll be
            all set.
          </p>
          <div class="otp">${otp}</div>
          <p>
            Please note, this code is valid for 30 minutes, so be sure to use it
            soon before it expires!
          </p>
          <p>
            If you didn't request this, no worries! Just ignore this email, and
            you're good to go. If you need any help, we're always here for you — just reach out to our support team.
          </p>
          <p>
            <strong>Note:</strong> For your security, do not share this code with
            anyone.
          </p>
        </div>
        <div class="footer">
          <p style="margin-bottom: 5px">
            This is an automated message. <br />Please do not reply, as responses
            are not monitored.
          </p>
          <p class="copyright">
            <strong>© 2025 TaskFlow. All rights reserved.</strong>
          </p>
        </div>
      </div>
    </body>
  </html>
  `;
};

const getEmailVerificationTemplate = (link) => {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        @import url("https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,200..800;1,200..800&display=swap");
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
        .header { text-align: center; padding: 20px 0px 10px 0px; display: flex; align-items: center; justify-content: start; }
        .logo { width: 50px; height: auto; margin-right: 4px; }
        .brand-name { font-size: 24px; font-weight: bold; color: black; font-family: "Atkinson Hyperlegible Next", "Arial", sans-serif; }
        .content { background: white; padding: 30px; border-radius: 8px; }
        .verify-btn { display: block; width: 100%; max-width: 250px; margin: 30px auto; padding: 15px 0; background: #2563eb; color: white; text-align: center; border-radius: 4px; text-decoration: none; font-size: 18px; font-weight: bold; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .copyright { font-size: 14px; margin-top: 0px; color: black; }
        @media (prefers-color-scheme: dark) { body { background-color: #121212; color: #e8eaed; } .container { background-color: #1f1f1f; } .content { background-color: #333; color: #e8eaed; } .verify-btn { background: #1a73e8; color: #fff; } .footer { color: #9aa0a6; } .copyright { color: white; } .logo-light { display: none; } .logo-dark { display: block; } .brand-name { color: #e8eaed; } } @media (prefers-color-scheme: light) { .logo-light { display: block; } .logo-dark { display: none; } .brand-name { color: black; } }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoDark}" alt="TaskFlow Logo" class="logo" />
          <span class="brand-name">Task Flow</span>
        </div>
        <div class="content">
          <p>Hello there,</p>
          <p>Welcome to <strong>TaskFlow</strong>! To finish setting up your account, please verify your email address by clicking the button below.</p>
          <a href="${link}" class="verify-btn">Verify Email</a>
          <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
          <p><a href="${link}">${link}</a></p>
          <p>This verification link will expire in 30 minutes. If you didn’t sign up for TaskFlow, just ignore this email.</p>
          <p>For any help, feel free to contact our support team anytime.</p>
        </div>
        <div class="footer">
          <p style="margin-bottom: 5px">This is an automated message.<br />Please do not reply to this email.</p>
          <p class="copyright"><strong>© 2025 TaskFlow. All rights reserved.</strong></p>
        </div>
      </div>
    </body>
  </html>
  `;
};

module.exports = {
  getPasswordResetTemplate,
  getEmailVerificationTemplate,
};
