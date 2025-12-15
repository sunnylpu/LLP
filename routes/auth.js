const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, name, otp) => {
  const subject = 'Verify Your Email - Vocal Language Learning Platform';
  const htmlMessage = `
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
        .otp-box { background: white; padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; border: 2px solid #667eea; }
        .otp-code { font-size: 2.5rem; font-weight: bold; color: #667eea; letter-spacing: 0.5rem; font-family: 'Courier New', monospace; }
        .footer { text-align: center; margin-top: 20px; color: #718096; font-size: 14px; }
        .warning { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Dear ${name},</p>
          <p>Thank you for signing up for Vocal! Please verify your email address to complete your registration.</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #4a5568; font-size: 0.9375rem;">Your verification code is:</p>
            <div class="otp-code">${otp}</div>
          </div>
          
          <div class="warning">
            <p style="margin: 0; color: #92400e;"><strong>⚠️ Important:</strong> This code will expire in <strong>10 minutes</strong>.</p>
          </div>
          
          <p>If you didn't create an account with Vocal, please ignore this email.</p>
          
          <p>Best regards,<br><strong>The Vocal Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply to this message.</p>
          <p>&copy; ${new Date().getFullYear()} Vocal - Language Learning Platform</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail(email, subject, htmlMessage);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Check if user exists with Google account
    const existingGoogleUser = await User.findOne({ email, authProvider: 'google' });
    if (existingGoogleUser) {
      return res.status(400).json({ 
        message: 'This email is already registered with Google. Please sign in with Google.' 
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      // If user exists but not verified, allow resending OTP
      if (!userExists.isVerified) {
        const otp = generateOTP();
        userExists.otp = otp;
        userExists.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await userExists.save();
        
        try {
          await sendOTPEmail(userExists.email, userExists.name, otp);
          return res.status(200).json({
            message: 'OTP sent to your email',
            email: userExists.email,
          });
        } catch (emailError) {
          return res.status(500).json({ 
            message: 'Failed to send OTP email. Please try again later.' 
          });
        }
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      otp,
      otpExpiresAt,
    });

    if (user) {
      // Send OTP email
      try {
        await sendOTPEmail(user.email, user.name, otp);
        res.status(201).json({
          message: 'OTP sent to your email',
          email: user.email,
        });
      } catch (emailError) {
        // If email fails, still return success but log error
        console.error('Failed to send OTP email:', emailError);
        res.status(201).json({
          message: 'Account created but failed to send OTP email. Please contact support.',
          email: user.email,
        });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field === 'email' ? 'Email' : 'Username'} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Check if email is verified (only for local auth, Google users are auto-verified)
      if (user.authProvider === 'local' && !user.isVerified) {
        return res.status(403).json({ 
          message: 'Please verify your email first. Check your inbox for the verification code.' 
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate user with Google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { tokenId, userInfo } = req.body;

    if (!tokenId && !userInfo) {
      return res.status(400).json({ message: 'Google token or user info is required' });
    }

    let email, name, picture, googleId;

    if (userInfo) {
      // Direct user info from access token
      email = userInfo.email;
      name = userInfo.name;
      picture = userInfo.picture;
      googleId = userInfo.id || userInfo.sub;
    } else {
      // Decode JWT token (for ID token flow)
      const jwt = require('jsonwebtoken');
      let decoded;
      try {
        decoded = jwt.decode(tokenId);
      } catch (error) {
        return res.status(400).json({ message: 'Invalid Google token' });
      }

      if (!decoded || !decoded.email) {
        return res.status(400).json({ message: 'Invalid token data' });
      }

      email = decoded.email;
      name = decoded.name;
      picture = decoded.picture;
      googleId = decoded.sub || decoded.id;
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email },
        { googleId }
      ]
    });

    if (user) {
      // Update user if they logged in with Google before
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user (Google users are auto-verified)
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture || '',
        authProvider: 'google',
        password: undefined, // No password for Google users
        isVerified: true, // Google users are auto-verified
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: error.message || 'Google authentication failed' 
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and activate user account
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified. You can login now.' 
      });
    }

    // Check if OTP exists
    if (!user.otp) {
      return res.status(400).json({ 
        message: 'No OTP found. Please request a new OTP.' 
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // Check if OTP is expired
    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return res.status(400).json({ 
        message: 'OTP has expired. Please request a new OTP.' 
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    // Generate and return token
    res.json({
      message: 'Email verified successfully!',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP to user's email
// @access  Public
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ 
        message: 'Email is already verified. You can login now.' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, user.name, otp);
      res.json({
        message: 'OTP sent to your email',
        email: user.email,
      });
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError);
      res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again later.' 
      });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error. Please try again later.' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('enrolledCourses')
      .select('-password -otp');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

