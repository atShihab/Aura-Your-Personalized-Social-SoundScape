export const emailTemplates = {
  listener: {
    signupVerification: (userName, verificationLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Aura Your Personalized Music Platform - Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Welcome to Aura!</h1>
            <p>Your musical journey begins here</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for signing up to Aura. To complete your registration and start enjoying our music platform, please verify your email address.</p>
            <p>Click the button below to verify your email:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${verificationLink}</p>
            <p>This link will expire in 24 hours for security reasons.</p>
          </div>
          <div class="footer">
            <p>If you didn't create an account with Aura, please ignore this email.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    passwordReset: (userName, resetLink) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
            <p>Aura Security</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Aura account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${resetLink}</p>
            <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>For security reasons, never share this link with anyone.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    newDeviceLogin: (userName, deviceInfo, loginTime) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Device Login Alert - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Device Login Alert</h1>
            <p>Aura Security Notification</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <div class="alert-box">
              <h3>⚠️ New Device Login Detected</h3>
              <p>We noticed a login to your Aura account from a new device:</p>
              <ul>
                <li><strong>Device:</strong> ${deviceInfo.device || 'Unknown Device'}</li>
                <li><strong>Browser:</strong> ${deviceInfo.browser || 'Unknown Browser'}</li>
                <li><strong>Location:</strong> ${deviceInfo.location || 'Unknown Location'}</li>
                <li><strong>Time:</strong> ${loginTime}</li>
              </ul>
            </div>
            <p>If this was you, no action is needed. If you don't recognize this login, please:</p>
            <ol>
              <li>Change your password immediately</li>
              <li>Review your account activity</li>
              <li>Contact our support team if needed</li>
            </ol>
          </div>
          <div class="footer">
            <p>This is an automated security notification from Aura.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    subscriptionConfirmation: (userName, planName, amount) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Confirmed - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Subscription Confirmed!</h1>
            <p>Welcome to Premium Music Experience</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <div class="success-box">
              <h3>✅ Your subscription is now active!</h3>
              <p><strong>Plan:</strong> ${planName}</p>
              <p><strong>Amount:</strong> ${amount}</p>
              <p><strong>Status:</strong> Active</p>
            </div>
            <p>You now have access to:</p>
            <ul>
              <li>🎵 Unlimited music streaming</li>
              <li>📱 Offline downloads</li>
              <li>🎧 High-quality audio</li>
              <li>🚫 Ad-free experience</li>
              <li>🎤 Early access to new releases</li>
            </ul>
            <p>Thank you for choosing Aura Premium!</p>
          </div>
          <div class="footer">
            <p>Manage your subscription in your account settings.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    newReleaseFromFollowedArtist: (userName, artistName, releaseTitle, releaseType) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Release from ${artistName} - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .release-box { background: #e8e4ff; border: 1px solid #d1c4e9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #6c5ce7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 New Release Alert!</h1>
            <p>Your followed artist has new music</p>
          </div>
          <div class="content">
            <h2>Hello ${userName}!</h2>
            <div class="release-box">
              <h3>🎤 ${artistName}</h3>
              <h2>${releaseTitle}</h2>
              <p><strong>Type:</strong> ${releaseType}</p>
            </div>
            <p>${artistName} just released "${releaseTitle}" and it's now available on Aura!</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/search?q=${encodeURIComponent(artistName + ' ' + releaseTitle)}" class="button">Listen Now</a>
            <p>Don't miss out on this amazing new ${releaseType.toLowerCase()}!</p>
          </div>
          <div class="footer">
            <p>You're receiving this because you follow ${artistName} on Aura.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  artist: {
    verificationApproved: (artistName) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verification Approved - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Verification Approved!</h1>
            <p>Welcome to Aura Artist Program</p>
          </div>
          <div class="content">
            <h2>Congratulations ${artistName}!</h2>
            <div class="success-box">
              <h3>✅ Your artist verification has been approved!</h3>
              <p>You are now a verified artist on Aura</p>
            </div>
            <p>As a verified artist, you now have access to:</p>
            <ul>
              <li>🎵 Upload and manage your music</li>
              <li>📊 Detailed analytics and insights</li>
              <li>💰 Revenue tracking and payments</li>
              <li>🎤 Verified artist badge</li>
              <li>📱 Artist dashboard</li>
              <li>🎧 Direct fan engagement tools</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist/dashboard" class="button">Access Your Dashboard</a>
            <p>Start uploading your music and building your fanbase on Aura!</p>
          </div>
          <div class="footer">
            <p>Need help getting started? Contact our artist support team.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    verificationRejected: (artistName, reason) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verification Update - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e17055 0%, #d63031 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #e17055; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Verification Update</h1>
            <p>Aura Artist Program</p>
          </div>
          <div class="content">
            <h2>Hello ${artistName}!</h2>
            <div class="info-box">
              <h3>📝 Verification Status Update</h3>
              <p>We've reviewed your artist verification application, and unfortunately, we cannot approve it at this time.</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>Don't worry! You can:</p>
            <ul>
              <li>📤 Resubmit your application with updated information</li>
              <li>📞 Contact our support team for guidance</li>
              <li>📚 Review our artist verification requirements</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist/verification" class="button">Resubmit Application</a>
            <p>We're here to help you succeed on Aura!</p>
          </div>
          <div class="footer">
            <p>Questions? Contact our artist support team.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    uploadSuccess: (artistName, releaseTitle, releaseType) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Upload Successful - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎵 Upload Successful!</h1>
            <p>Your music is now live on Aura</p>
          </div>
          <div class="content">
            <h2>Great news ${artistName}!</h2>
            <div class="success-box">
              <h3>✅ Your ${releaseType} is now live!</h3>
              <p><strong>Title:</strong> ${releaseTitle}</p>
              <p><strong>Type:</strong> ${releaseType}</p>
              <p><strong>Status:</strong> Published and available to listeners</p>
            </div>
            <p>Your ${releaseType.toLowerCase()} "${releaseTitle}" has been successfully uploaded and is now available for streaming on Aura!</p>
            <p>What's next?</p>
            <ul>
              <li>📊 Monitor your analytics in the dashboard</li>
              <li>📱 Share your music on social media</li>
              <li>🎧 Engage with your listeners</li>
              <li>💰 Track your earnings</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist/dashboard" class="button">View Dashboard</a>
          </div>
          <div class="footer">
            <p>Keep creating amazing music!</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    uploadRejected: (artistName, releaseTitle, reason) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Upload Rejected - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #e17055 0%, #d63031 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: #f8d7da; border: 1px solid #f5c6cb; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background: #e17055; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Upload Update</h1>
            <p>Aura Content Review</p>
          </div>
          <div class="content">
            <h2>Hello ${artistName}!</h2>
            <div class="info-box">
              <h3>⚠️ Upload Rejected</h3>
              <p><strong>Title:</strong> ${releaseTitle}</p>
              <p><strong>Status:</strong> Rejected</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            <p>We've reviewed your upload and unfortunately cannot publish it at this time.</p>
            <p>You can:</p>
            <ul>
              <li>📝 Address the issues mentioned above</li>
              <li>📤 Resubmit your content</li>
              <li>📞 Contact support if you have questions</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist/dashboard" class="button">View Dashboard</a>
            <p>We're here to help you get your music published successfully!</p>
          </div>
          <div class="footer">
            <p>Need help? Contact our artist support team.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,

    paymentProcessed: (artistName, amount, period) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Payment Processed - Aura</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .payment-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Payment Processed!</h1>
            <p>Your earnings are on the way</p>
          </div>
          <div class="content">
            <h2>Hello ${artistName}!</h2>
            <div class="payment-box">
              <h3>✅ Payment Processed Successfully</h3>
              <p><strong>Amount:</strong> ${amount}</p>
              <p><strong>Period:</strong> ${period}</p>
              <p><strong>Status:</strong> Processed</p>
            </div>
            <p>Your royalty payment for ${period} has been processed and should appear in your account within 3-5 business days.</p>
            <p>Payment details:</p>
            <ul>
              <li>💳 Payment method: As per your account settings</li>
              <li>📅 Processing date: ${new Date().toLocaleDateString()}</li>
              <li>⏱️ Expected arrival: 3-5 business days</li>
            </ul>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/artist/dashboard" class="button">View Earnings</a>
            <p>Keep creating amazing music to grow your earnings!</p>
          </div>
          <div class="footer">
            <p>Questions about your payment? Contact our support team.</p>
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};
