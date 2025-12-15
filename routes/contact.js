const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/sendEmail');

/**
 * Helper function to escape HTML and prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML-safe text
 */
const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Helper function to format category display name
 * @param {string} category - Category value
 * @returns {string} - Formatted category name
 */
const formatCategory = (category) => {
  if (!category) return 'Not specified';
  const categoryMap = {
    'general': 'General Inquiry',
    'technical': 'Technical Issue',
    'feedback': 'Feedback',
    'business': 'Business Collaboration'
  };
  return categoryMap[category] || category;
};

/**
 * @route POST /api/contact
 * @desc  Submit contact form and send email notifications
 * @access Public
 * 
 * Request Body:
 * - name (required): User's full name
 * - email (required): User's email address
 * - subject (required): Message subject
 * - category (optional): Category of inquiry
 * - message (required): Message content
 * 
 * Sends two emails:
 * 1. Auto-reply to the user confirming receipt
 * 2. Notification to admin with contact form details
 * 
 * Returns:
 * - 200: Success with message
 * - 400: Validation error
 * - 500: Server/email error
 */
router.post('/', async (req, res) => {
  try {
    // Extract and validate request body
    const { name, email, subject, category, message } = req.body;

    // Validation - Required fields
    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Name is required');
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email is required');
    }
    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      errors.push('Subject is required');
    }
    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Message is required');
    }

    // Return validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        message: errors.join('. '),
        errors: errors,
        success: false
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        message: 'Please provide a valid email address',
        success: false
      });
    }

    // Trim and sanitize all fields
    const trimmedName = name.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const trimmedCategory = category ? category.trim() : '';

    // Validate trimmed fields are not empty (double-check after trim)
    if (!trimmedName || !trimmedSubject || !trimmedMessage) {
      return res.status(400).json({
        message: 'Please fill in all required fields (fields cannot be only whitespace)',
        success: false
      });
    }

    // Validate email length (basic sanity check)
    if (trimmedEmail.length > 254) {
      return res.status(400).json({
        message: 'Email address is too long',
        success: false
      });
    }

    // Validate message length (prevent abuse)
    if (trimmedMessage.length > 5000) {
      return res.status(400).json({
        message: 'Message is too long. Please keep it under 5000 characters.',
        success: false
      });
    }

    // Log the contact form submission (for debugging)
    console.log('=== CONTACT FORM SUBMISSION ===');
    console.log('Name:', trimmedName);
    console.log('Email:', trimmedEmail);
    console.log('Subject:', trimmedSubject);
    console.log('Category:', trimmedCategory || 'Not specified');
    console.log('Message Length:', trimmedMessage.length, 'characters');
    console.log('Timestamp:', new Date().toISOString());
    console.log('================================');

    // Check if email service is configured
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail || !process.env.EMAIL_PASS) {
      console.error('❌ Email service not configured');
      return res.status(500).json({
        message: 'Email service is temporarily unavailable. Please try again later or contact us directly.',
        success: false
      });
    }

    // Escape HTML to prevent XSS attacks
    const safeName = escapeHtml(trimmedName);
    const safeEmail = escapeHtml(trimmedEmail);
    const safeSubject = escapeHtml(trimmedSubject);
    const safeCategory = escapeHtml(formatCategory(trimmedCategory));
    const safeMessage = escapeHtml(trimmedMessage).replace(/\n/g, '<br>');

    // ============================================
    // (A) Send Auto-Reply Email to User
    // ============================================
    const userEmailSubject = 'Thank you for contacting Vocal!';
    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .category-badge { display: inline-block; background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
          .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for contacting Vocal!</h1>
          </div>
          <div class="content">
            <p>Dear ${safeName},</p>
            <p>We have received your message and appreciate you taking the time to reach out to us.</p>
            
            ${trimmedCategory ? `<p><strong>Category:</strong> <span class="category-badge">${safeCategory}</span></p>` : ''}
            
            <div class="message-box">
              <p><strong>Your Message:</strong></p>
              <p>${safeMessage}</p>
            </div>
            
            <p>Our team will review your message and get back to you within <strong>24 hours</strong>.</p>
            <p>If you have any urgent concerns, please feel free to call us at +91-80-1234-5678.</p>
            
            <p>Best regards,<br><strong>The Vocal Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Vocal - Language Learning Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ============================================
    // (B) Send Notification Email to Admin
    // ============================================
    const adminEmailSubject = `New Contact Form Submission: ${safeSubject}`;
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f7fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .info-label { font-weight: bold; color: #667eea; }
          .category-badge { display: inline-block; background: #667eea; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; }
          .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .reply-button { background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 New Contact Form Submission</h1>
          </div>
          <div class="content">
            <p>A new message has been received through the contact form:</p>
            
            <div class="info-box">
              <p><span class="info-label">Name:</span> ${safeName}</p>
            </div>
            
            <div class="info-box">
              <p><span class="info-label">Email:</span> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
            </div>
            
            <div class="info-box">
              <p><span class="info-label">Subject:</span> ${safeSubject}</p>
            </div>
            
            ${trimmedCategory ? `
            <div class="info-box">
              <p><span class="info-label">Category:</span> <span class="category-badge">${safeCategory}</span></p>
            </div>
            ` : ''}
            
            <div class="message-box">
              <p><strong>Message:</strong></p>
              <p>${safeMessage}</p>
            </div>
            
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            
            <p style="margin-top: 30px;">
              <a href="mailto:${safeEmail}?subject=Re: ${encodeURIComponent(safeSubject)}" class="reply-button">
                Reply to ${safeName}
              </a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // ============================================
    // Send Both Emails with Error Handling
    // ============================================
    let userEmailSent = false;
    let adminEmailSent = false;
    const emailErrors = [];

    try {
      // Send auto-reply to user
      try {
        await sendEmail(trimmedEmail, userEmailSubject, userEmailHtml);
        userEmailSent = true;
        console.log('✅ Auto-reply email sent to user:', trimmedEmail);
      } catch (userEmailError) {
        emailErrors.push(`Failed to send auto-reply: ${userEmailError.message}`);
        console.error('❌ Failed to send auto-reply email:', userEmailError);
      }

      // Send notification to admin
      try {
        await sendEmail(adminEmail, adminEmailSubject, adminEmailHtml);
        adminEmailSent = true;
        console.log('✅ Notification email sent to admin:', adminEmail);
      } catch (adminEmailError) {
        emailErrors.push(`Failed to send admin notification: ${adminEmailError.message}`);
        console.error('❌ Failed to send admin notification email:', adminEmailError);
      }

      // Determine response based on email sending results
      if (userEmailSent && adminEmailSent) {
        // Both emails sent successfully
        return res.status(200).json({
          message: 'Message sent successfully!',
          success: true
        });
      } else if (userEmailSent || adminEmailSent) {
        // At least one email was sent (partial success)
        console.warn('⚠️  Partial email success:', { userEmailSent, adminEmailSent });
        return res.status(200).json({
          message: 'Your message has been received. We will get back to you soon.',
          success: true,
          warning: 'Some email notifications may not have been sent'
        });
      } else {
        // Both emails failed
        throw new Error('All email attempts failed: ' + emailErrors.join('; '));
      }
    } catch (emailError) {
      // Log detailed error for debugging
      console.error('❌ Email sending error:', {
        message: emailError.message,
        userEmailSent,
        adminEmailSent,
        errors: emailErrors
      });

      // Return 500 error with clear message
      return res.status(500).json({
        message: 'Failed to send email notifications. Your message was received, but we could not send confirmation emails. Please try again later or contact us directly.',
        success: false,
        error: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }
  } catch (error) {
    // Catch any unexpected errors
    console.error('❌ Contact form unexpected error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    return res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;


