const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Send password reset email using SendGrid
const sendResetEmail = async (email, resetCode) => {
  // If no API key, log to console (development mode)
  if (!process.env.SENDGRID_API_KEY) {
    console.log(
      `\n🔐 [DEV MODE] Password reset code for ${email}: ${resetCode}`
    );
    console.log(`⚠️  This code will expire in 15 minutes\n`);
    return { success: true, devMode: true };
  }

  try {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || "noreply@vachchat.com",
        name: "VachChat Support",
      },
      subject: "VachChat - Password Reset Code",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
              color: #333333;
            }
            .code-box {
              background-color: #f8f9fa;
              border: 2px dashed #3B82F6;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .code {
              font-size: 36px;
              font-weight: bold;
              color: #3B82F6;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background-color: #f8f9fa;
              padding: 20px;
              text-align: center;
              color: #666666;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #3B82F6;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 VachChat</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Hello there!</h2>
              <p>We received a request to reset your VachChat account password. Use the code below to complete the reset process:</p>
              
              <div class="code-box">
                <p style="margin: 0 0 10px 0; color: #666;">Your Reset Code:</p>
                <div class="code">${resetCode}</div>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>This code will expire in <strong>15 minutes</strong></li>
                  <li>Don't share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <p>Enter this code in the VachChat app to set a new password.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from VachChat. Please do not reply to this email.</p>
              <p>© ${new Date().getFullYear()} VachChat. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
VachChat - Password Reset Code

Hello!

We received a request to reset your VachChat account password.

Your reset code: ${resetCode}

This code will expire in 15 minutes.

If you didn't request this password reset, please ignore this email.

© ${new Date().getFullYear()} VachChat
      `,
    };

    // Send email with SendGrid
    const response = await sgMail.send(msg);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, messageId: response[0].headers["x-message-id"] };
  } catch (error) {
    console.error("❌ Error sending reset email:", error);

    // Log more details for debugging
    if (error.response) {
      console.error("SendGrid Error Details:", error.response.body);
    }

    throw error;
  }
};

module.exports = {
  sendResetEmail,
};
