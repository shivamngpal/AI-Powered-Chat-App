// Test SendGrid Email Configuration

require("dotenv").config();
const sgMail = require("@sendgrid/mail");

console.log("🧪 Testing SendGrid Configuration...\n");

// Check if API key exists
if (!process.env.SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY not found in .env file");
  console.log("   Add: SENDGRID_API_KEY=SG.your-api-key-here");
  process.exit(1);
}

// Check if from email exists
if (!process.env.SENDGRID_FROM_EMAIL) {
  console.error("❌ SENDGRID_FROM_EMAIL not found in .env file");
  console.log("   Add: SENDGRID_FROM_EMAIL=your-verified-email@example.com");
  process.exit(1);
}

console.log(
  "✅ API Key found:",
  process.env.SENDGRID_API_KEY.substring(0, 15) + "..."
);
console.log("✅ From Email:", process.env.SENDGRID_FROM_EMAIL);
console.log("\n📧 Sending test email...\n");

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Send test email
const msg = {
  to: process.env.SENDGRID_FROM_EMAIL, // Send to yourself for testing
  from: {
    email: process.env.SENDGRID_FROM_EMAIL,
    name: "VachChat Support",
  },
  subject: "✅ VachChat SendGrid Test - Success!",
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
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
        .content {
          padding: 40px 30px;
          color: #333333;
        }
        .success-box {
          background-color: #d4edda;
          border: 2px solid #28a745;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }
        .code {
          font-size: 48px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 SendGrid Test Email</h1>
          <p>VachChat Email Service</p>
        </div>
        <div class="content">
          <div class="success-box">
            <div class="code">✅</div>
            <h2 style="color: #28a745; margin: 10px 0;">Configuration Successful!</h2>
            <p style="margin: 10px 0; color: #155724;">Your SendGrid integration is working perfectly!</p>
          </div>
          
          <h3>What's Working:</h3>
          <ul>
            <li>✅ SendGrid API key is valid</li>
            <li>✅ Sender email is verified</li>
            <li>✅ Email delivery is functional</li>
            <li>✅ HTML formatting is correct</li>
          </ul>

          <h3>Next Steps:</h3>
          <ol>
            <li>Test the forgot password feature in your app</li>
            <li>Check SendGrid Activity Feed for delivery stats</li>
            <li>Deploy to production with confidence! 🚀</li>
          </ol>

          <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
            <strong>Test Date:</strong> ${new Date().toLocaleString()}<br>
            <strong>From:</strong> ${process.env.SENDGRID_FROM_EMAIL}
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
VachChat SendGrid Test Email

✅ Configuration Successful!

Your SendGrid integration is working perfectly!

What's Working:
- SendGrid API key is valid
- Sender email is verified  
- Email delivery is functional
- HTML formatting is correct

Test Date: ${new Date().toLocaleString()}
From: ${process.env.SENDGRID_FROM_EMAIL}
  `,
};

// Send the email
sgMail
  .send(msg)
  .then((response) => {
    console.log("✅ TEST EMAIL SENT SUCCESSFULLY!");
    console.log("\n📊 Response Details:");
    console.log("   Status Code:", response[0].statusCode);
    console.log("   Message ID:", response[0].headers["x-message-id"]);
    console.log("\n📧 Check your inbox:", process.env.SENDGRID_FROM_EMAIL);
    console.log("   (Also check spam folder just in case)");
    console.log("\n🎉 SendGrid is configured correctly!");
    console.log("\n💡 Next Steps:");
    console.log("   1. Check your email inbox");
    console.log("   2. Test forgot password in your app");
    console.log("   3. Check SendGrid dashboard: https://app.sendgrid.com/");
  })
  .catch((error) => {
    console.error("\n❌ ERROR SENDING EMAIL:");
    console.error("\n📋 Error Details:");

    if (error.response) {
      console.error("   Status:", error.response.statusCode);
      console.error("   Body:", JSON.stringify(error.response.body, null, 2));

      // Common error solutions
      if (error.response.body.errors) {
        console.error("\n🔧 Troubleshooting:");
        error.response.body.errors.forEach((err) => {
          if (err.message.includes("does not match")) {
            console.error("   ❌ From email not verified in SendGrid");
            console.error(
              "   👉 Go to: https://app.sendgrid.com/settings/sender_auth/senders"
            );
            console.error("   👉 Verify:", process.env.SENDGRID_FROM_EMAIL);
          }
          if (err.message.includes("permission")) {
            console.error("   ❌ API key doesn't have Mail Send permission");
            console.error(
              "   👉 Create new API key with 'Mail Send - Full Access'"
            );
          }
        });
      }
    } else {
      console.error(error);
    }

    process.exit(1);
  });
