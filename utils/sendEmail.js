const nodemailer = require('nodemailer');

/**
 * Email Configuration Module
 * 
 * Uses Gmail SMTP with App Password for authentication.
 * This module provides a reusable email sending function for the application.
 * 
 * Environment Variables Required:
 * - EMAIL_USER: Your Gmail address (e.g., yourgmail@gmail.com)
 * - EMAIL_PASS: Gmail App Password (not your regular password)
 * 
 * To generate Gmail App Password:
 * 1. Go to Google Account settings (https://myaccount.google.com/)
 * 2. Navigate to Security > 2-Step Verification (must be enabled first)
 * 3. Scroll down to "App passwords"
 * 4. Generate a new app password for "Mail"
 * 5. Copy the 16-character password (no spaces)
 * 6. Add to .env file as EMAIL_PASS
 * 
 * Note: If 2-Step Verification is not enabled, you cannot generate app passwords.
 *       Regular Gmail passwords will NOT work with this configuration.
 */

// Check if email credentials are configured on module load
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('⚠️  WARNING: Email credentials not configured!');
  console.warn('   Please set EMAIL_USER and EMAIL_PASS in your .env file');
  console.warn('   Email functionality will not work until configured.');
  console.warn('   See utils/sendEmail.js for setup instructions.');
}

/**
 * Create reusable transporter object using Gmail SMTP
 * 
 * Configuration:
 * - host: Gmail SMTP server
 * - port: 587 (TLS) - standard port for email submission
 * - secure: false - use STARTTLS instead of direct SSL
 * - auth: Gmail credentials from environment variables
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Additional options for better reliability
  tls: {
    rejectUnauthorized: false // Accept self-signed certificates (if needed)
  },
  // Connection timeout
  connectionTimeout: 10000, // 10 seconds
  // Socket timeout
  socketTimeout: 10000 // 10 seconds
});

/**
 * Verify transporter configuration
 * 
 * This checks if email credentials are valid by attempting to connect
 * to the SMTP server. Useful for debugging email setup issues.
 * 
 * @returns {Promise<boolean>} - True if configuration is valid, false otherwise
 */
const verifyEmailConfig = async () => {
  // Skip verification if credentials are not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Skipping email verification: credentials not configured');
    return false;
  }

  try {
    await transporter.verify();
    console.log('✅ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('❌ Email server configuration error:', error.message);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('   This usually means:');
      console.error('   - Invalid email or password');
      console.error('   - App password not generated correctly');
      console.error('   - 2-Step Verification not enabled');
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('   This usually means:');
      console.error('   - Network connectivity issues');
      console.error('   - Firewall blocking SMTP port 587');
    }
    
    return false;
  }
};

// Verify on module load (only in development to avoid production overhead)
if (process.env.NODE_ENV !== 'production' && process.env.VERIFY_EMAIL !== 'false') {
  verifyEmailConfig().catch(err => {
    // Silently catch errors during verification to not crash the app
    if (process.env.NODE_ENV === 'development') {
      console.error('Email verification failed:', err.message);
    }
  });
}

/**
 * Send email function
 * 
 * Sends an HTML email using the configured Gmail SMTP transporter.
 * Includes validation, error handling, and detailed logging.
 * 
 * @param {string} to - Recipient email address (must be valid email format)
 * @param {string} subject - Email subject line
 * @param {string} htmlMessage - HTML formatted email message
 * @returns {Promise<Object>} - Email send result with success status and messageId
 * @throws {Error} - If email cannot be sent (credentials missing, invalid recipient, etc.)
 * 
 * @example
 * try {
 *   const result = await sendEmail('user@example.com', 'Hello', '<h1>Hello World</h1>');
 *   console.log('Email sent:', result.messageId);
 * } catch (error) {
 *   console.error('Failed to send:', error.message);
 * }
 */
const sendEmail = async (to, subject, htmlMessage) => {
  // Validate email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    const error = new Error('Email credentials not configured. Please set EMAIL_USER and EMAIL_PASS in .env file');
    error.code = 'ECONFIG';
    throw error;
  }

  // Validate recipient email format
  if (!to || typeof to !== 'string' || !to.trim()) {
    const error = new Error('Recipient email address is required');
    error.code = 'EINVALID';
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to.trim())) {
    const error = new Error(`Invalid recipient email address: ${to}`);
    error.code = 'EINVALID';
    throw error;
  }

  // Validate subject
  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    const error = new Error('Email subject is required');
    error.code = 'EINVALID';
    throw error;
  }

  // Validate HTML message
  if (!htmlMessage || typeof htmlMessage !== 'string' || !htmlMessage.trim()) {
    const error = new Error('Email message content is required');
    error.code = 'EINVALID';
    throw error;
  }

  // Email options
  const mailOptions = {
    from: `"Vocal Language Learning Platform" <${process.env.EMAIL_USER}>`,
    to: to.trim(),
    subject: subject.trim(),
    html: htmlMessage
  };

  try {
    // Send email using transporter
    const info = await transporter.sendMail(mailOptions);
    
    // Log success (only in development or if explicitly enabled)
    if (process.env.NODE_ENV !== 'production' || process.env.LOG_EMAILS === 'true') {
      console.log('✅ Email sent successfully:', {
        to: to.trim(),
        subject: subject.trim(),
        messageId: info.messageId
      });
    }

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    // Enhanced error logging with context
    console.error('❌ Error sending email:', {
      to: to.trim(),
      subject: subject.trim(),
      errorCode: error.code,
      errorMessage: error.message,
      command: error.command,
      response: error.response
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to send email';
    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file';
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Could not connect to email server. Please check your internet connection';
    } else if (error.responseCode === 550) {
      errorMessage = 'Invalid recipient email address';
    } else {
      errorMessage = `Failed to send email: ${error.message}`;
    }

    const emailError = new Error(errorMessage);
    emailError.code = error.code || 'EUNKNOWN';
    emailError.originalError = error;
    throw emailError;
  }
};

module.exports = {
  sendEmail,
  verifyEmailConfig
};

