// Base64 encoded logos
const LOGO_DARK =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAADK0lEQVR4nO2ZW2xMURSGv1JVVNUzxK1Bg0dxiYjQEkQQl7h0EEJE3EI8SLwiQhAPXoQHJF48iEuIW4SIiKAIQUJCkFAEFVVBtK5VVa1aXeXIOv+QdMyZOWfOzDkz4k/+h5m911r/PnvvtdbexyeffPLJR4RyYDWwH2gEbgPvgG9Al/ztkfduAduAVUCZ18FPBw4Cb4EfQLbL6wewD5jiRfDLgYvAT5eBm10/gD1AkRvBjwLOAL8dBp7r+gSscBr8OOAW8NtC8LmuH8B6oDDX4BcCL20En+tqAkbaBb8Y6HQQfK7rLVBhFfxM4JOLwee6XgBDdcFXAu0eBJ/r2qkDfhLQ4mHwWaAZGGEEfgnQ63HwWaADmGYEfqMPwWeBXmCBEfhTPgWfBc4agT/vY/BZ4KIR+Hs+Bp8FbhuBf+Jj8FngkRH4Jz4GnwUeG4F/7GPwWeCBEfgWH4PPAveNwH/2Mfgs8MQI/Dcfg88Cz43A9/gYfBZ4YwS+38fgs8BHI/BBXwfwxQh8yMfgM0DICHwYGONj8GEgbgQ+Iyv1I/h0LgvNNQIfAhb6EHwYWGQEPgGUAp0+Ah8GlhqBjwOjgXc+AR8GlhmBTwJjgQ8+AB8GVhiBTwETgI8eB58E1hiBTwOTgVYPg08C64zAZ4ApwGePgU8CG43AK/DTXQa+BKhyEHwS2GIEXoGf5RL4MuCgw+CTwHYj8Ar8bIfBjwUOOQw+CewyAq/Az3UIfDlw1GHwSWC/EXgFfr5N4CuAEw6DTwJHjMAr8AttAD8BOO0w+CRw3Ai8Al9tEfgpwFmHwSeBk0bgFfgFFoKfClxwGHwSOGUEXoFfZAH4acBlh8EngdNG4BX4xSbBzwCuOgw+CZwxAq/AL9EEPxO47jD4JHDOCLwCv1QD/GzghsPgk8B5I/AK/DIN8HOAW1kbwSeBi0bgFfilBcAjF8EngUtG4BX45QXA4xyCTwKXjcAr8CsKgCcWgk8CV4zAK/ArC4CnFoBPAteMwCvwqwqAZyZuWgk+CVw3Aq/Ary4AnpsEnwRuGoFX4NcUAC8swCeBW0bgFfi1BcBLE+CTwG0j8Ar8ugLgdQ74fPLJJx+P8xdVzFCEVTLxNwAAAABJRU5ErkJggg==";

const LOGO_LIGHT =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAC7ElEQVR4nO2ZTWgTQRTHf6mK1qqNCF4EQQQPKnpQEA+CH3gQQQ+KB0WrB0XEkyd7EsGDFw+CB0E8eFBE8SJ48CKIIIJYUYtftR8kWlGr1Vb7IY7MJGE/spvdmd2Z3YV98A5Ldmbe/8/MvJk3b8DHx8cnH6qAQ8Bl4DHwFvgM/AA65e8n8A54AowCh4HqYge/CTgLvAB+AZkCr1/AKWB9MYNvAC4A30wGb3R9A04DFW4EPwDoBH67DD7X9QVYX0jwQ4BrwB+Hg891vQdqnQa/GHjnYfC5rpdAuV3wc4EvHgef63oODLcKfhbQ5oPgc11PgEoj+GXAT58En3W9AkYYwS8HenwUfNb1DphtBL/DR8FnXduN4I/5MPgscMwI/qQPg88Cp4zgz/gw+Cxw3gj+og+DzwKXjOCv+zD4LHDdCP6OD4PPAreM4B/6MPgscNcI/JEPg88C943AP/Nh8FngkRH4Vh8GnwUeG4H/6sPgs8ATI/A/fRh8FnhmBL7Ph8FngRdG4EM+XQd8NQIfLvI6IGQEPgKM9GHwEWCUEfg4MBho90HwEWC0EfgEMBZ47wPwEWCMEfgkMA747APwEWCsEfgUMBH44HHwEWC8EfgMMBn46GHwEWCiEXgFfobL4KuBOgfBR4BJRuAV+NkugZ8AHHYYPAJMN4JX4Oc4BH4ycMRh8BFgphF4BX6uA+DLgaMOg48Ac43AK/DzLAZfAZxwGHwEmG8EXoFfYBH4ScBph8FHgIVG4BX4RRaAnwKcdRh8BFhsBF6BX2wS/DTgvMPgI8ASI/AK/BIT4KcDFx0GHwGWGoFX4JfmAT8DuOQw+Aiw3Ai8Ar8iB/ws4IrD4CPASiPwCvzKHOBnA9ccBh8BVhuBV+BX5QE/B7jhMPgIsNYIvAK/Og/4ucBNh8FHgHVG4BX4NXnAzwNuWww+Aqw3Aq/Ar80Dfj5wx2LwEWCDEXgFfl0e8AuAuxaDjwAbjcAr8OvzgF8I3LMYfATYZARegW8sAF77gI+Pj4/L+QsRBVCEVVKJvwAAAABJRU5ErkJggg==";

const getPasswordResetTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Google Sans', Roboto, Arial, sans-serif;
          line-height: 1.6;
          color: #202124;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #1a73e8, #0d47a1);
          padding: 40px 20px;
          text-align: center;
          color: white;
        }
        .logo-container {
          margin-bottom: 20px;
        }
        .logo-dark, .logo-light {
          width: 80px;
          height: auto;
          padding: 12px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .logo-light { display: none; }
        .content {
          padding: 32px;
        }
        .greeting {
          font-size: 28px;
          color: #202124;
          margin: 0 0 24px;
          font-weight: 500;
        }
        .otp-container {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 24px;
          margin: 32px 0;
          text-align: center;
          border: 1px solid #e8eaed;
        }
        .otp {
          font-family: 'Google Sans Mono', monospace;
          font-size: 40px;
          letter-spacing: 12px;
          color: #1a73e8;
          font-weight: 600;
          margin: 0;
          padding: 8px;
        }
        .otp-label {
          color: #5f6368;
          font-size: 14px;
          margin-top: 12px;
        }
        .warning {
          background: #fef7f6;
          border-left: 4px solid #d93025;
          padding: 16px 20px;
          margin: 24px 0;
          border-radius: 0 8px 8px 0;
        }
        .warning-title {
          color: #d93025;
          font-weight: 600;
          margin: 0 0 8px;
          font-size: 16px;
        }
        .warning-text {
          color: #d93025;
          margin: 0;
          font-size: 14px;
        }
        .footer {
          background: #f8f9fa;
          padding: 24px 32px;
          text-align: center;
          border-top: 1px solid #e8eaed;
        }
        .footer p {
          color: #5f6368;
          font-size: 12px;
          margin: 4px 0;
        }
        .divider {
          height: 1px;
          background: #e8eaed;
          margin: 24px 0;
        }
        @media (prefers-color-scheme: dark) {
          body {
            background-color: #202124;
            color: #e8eaed;
          }
          .card {
            background: #2d2d2d;
          }
          .content {
            color: #e8eaed;
          }
          .greeting {
            color: #e8eaed;
          }
          .otp-container {
            background: #202124;
            border-color: #5f6368;
          }
          .warning {
            background: #5c2b29;
            border-color: #f28b82;
          }
          .warning-title, .warning-text {
            color: #f28b82;
          }
          .footer {
            background: #202124;
            border-color: #5f6368;
          }
          .footer p {
            color: #9aa0a6;
          }
          .divider {
            background: #5f6368;
          }
          .logo-dark { display: none; }
          .logo-light { display: inline; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="header">
            <div class="logo-container">
              <img src="${LOGO_DARK}" alt="TaskFlow Logo" class="logo-dark">
              <img src="${LOGO_LIGHT}" alt="TaskFlow Logo" class="logo-light">
            </div>
            <h1 style="margin:0;font-size:24px;font-weight:500;">Password Reset Request</h1>
          </div>
          
          <div class="content">
            <h2 class="greeting">Hi there! 👋</h2>
            <p>We received a request to reset your TaskFlow account password. To ensure your account security, we've generated a verification code for you.</p>
            
            <div class="otp-container">
              <div class="otp">${otp}</div>
              <div class="otp-label">This code will expire in 30 minutes</div>
            </div>
            
            <div class="warning">
              <h3 class="warning-title">⚠️ Security Notice</h3>
              <p class="warning-text">If you didn't request this password reset, please ignore this email or contact our support team immediately if you have any concerns about your account security.</p>
            </div>

            <div class="divider"></div>

            <div style="text-align:center;color:#5f6368;font-size:14px;">
              <p>Need help? Contact our support team</p>
            </div>
          </div>

          <div class="footer">
            <p>This is an automated email, please do not reply.</p>
            <p>© ${new Date().getFullYear()} TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getPasswordResetTemplate,
};
