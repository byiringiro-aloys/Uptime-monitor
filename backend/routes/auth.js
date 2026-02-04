import express from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import logger from '../utils/logger.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// Helper to get client IP and user agent
const getClientInfo = (req) => ({
  ip: req.ip || req.connection.remoteAddress || 'unknown',
  userAgent: req.get('user-agent') || 'unknown'
});

// Register
router.post('/register', authLimiter, [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(409).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password
    });

    // Generate verification token
    const verificationToken = user.createVerificationToken();
    await user.save();

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken, user.username);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token', authLimiter, async (req, res) => {
  try {
    const verificationToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken,
      isVerified: false
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    // Generate token for immediate login
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified
      },
      message: 'Email verified successfully'
    });
  } catch (error) {
    logger.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;
    const { ip, userAgent } = getClientInfo(req);

    // Find user
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed attempt
      user.addLoginAttempt(ip, userAgent, false);
      await user.save();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if 2FA is required
    const requires2FA = user.shouldRequire2FA(ip, userAgent);

    if (requires2FA) {
      // Generate temporary token for 2FA verification (expires in 10 minutes)
      const tempToken = generateToken(user._id, '10m');

      // Send suspicious login alert if from new device
      const recentIPs = user.loginHistory
        .filter(login => login.success)
        .map(login => login.ip)
        .slice(-5);

      if (!recentIPs.includes(ip)) {
        emailService.sendSuspiciousLoginAlert(user.email, user.username, {
          ip,
          userAgent,
          timestamp: new Date(),
          location: ''
        });
      }

      return res.json({
        requires2FA: true,
        tempToken,
        message: '2FA verification required'
      });
    }

    // Log successful login
    user.addLoginAttempt(ip, userAgent, true);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify 2FA code during login
router.post('/2fa/verify-login', authLimiter, [
  body('tempToken').notEmpty().withMessage('Temporary token is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code'),
  body('trustDevice').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { tempToken, code, trustDevice } = req.body;
    const { ip, userAgent } = getClientInfo(req);

    // Verify temp token (this will error if expired)
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);


    // Get user with 2FA secret
    const user = await User.findById(decoded.userId).select('+twoFactorSecret');
    if (!user || !user.twoFactorEnabled) {
      return res.status(401).json({ error: 'Invalid request' });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps before/after
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Log successful login
    user.addLoginAttempt(ip, userAgent, true);

    // Add trusted device if requested
    if (trustDevice) {
      user.addTrustedDevice(ip, userAgent);
    }

    await user.save();

    // Generate full access token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    logger.error('2FA verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email, isActive: true });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save();

    // Send email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.username
    );

    if (!emailResult.success) {
      logger.error('Failed to send password reset email');
      // Don't expose email sending errors to client
    }

    res.json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify reset token validity
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      isActive: true
    });

    if (!user) {
      return res.status(400).json({
        valid: false,
        error: 'Invalid or expired reset token'
      });
    }

    res.json({ valid: true });
  } catch (error) {
    logger.error('Verify reset token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', authLimiter, [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { token, password } = req.body;

    // Hash token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      isActive: true
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup 2FA - Generate QR code
router.post('/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA is already enabled' });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Uptime Monitor (${user.email})`,
      issuer: 'Uptime Monitor'
    });

    // Store secret temporarily (will be confirmed on verification)
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      qrCode: qrCodeUrl,
      secret: secret.base32,
      message: 'Scan the QR code with your authenticator app'
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify 2FA setup and enable
router.post('/2fa/verify-setup', authenticateToken, [
  body('code').isLength({ min: 6, max: 6 }).withMessage('Invalid verification code')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+twoFactorSecret');

    if (!user.twoFactorSecret) {
      return res.status(400).json({ error: 'Please setup 2FA first' });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    // Send confirmation email
    emailService.send2FAEnabledEmail(user.email, user.username);

    res.json({
      message: '2FA enabled successfully',
      twoFactorEnabled: true
    });
  } catch (error) {
    logger.error('2FA verify setup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticateToken, [
  body('password').notEmpty().withMessage('Password is required for confirmation')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { password } = req.body;
    const user = await User.findById(req.user._id).select('+password +twoFactorSecret');

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.twoFactorAlwaysRequired = false;
    user.trustedDevices = [];
    await user.save();

    res.json({
      message: '2FA disabled successfully',
      twoFactorEnabled: false
    });
  } catch (error) {
    logger.error('2FA disable error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get 2FA status
router.get('/2fa/status', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorAlwaysRequired: user.twoFactorAlwaysRequired,
      trustedDevicesCount: user.trustedDevices.length
    });
  } catch (error) {
    logger.error('2FA status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle "Always Require 2FA" setting
router.post('/2fa/toggle-always-required', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ error: '2FA must be enabled first' });
    }

    user.twoFactorAlwaysRequired = !user.twoFactorAlwaysRequired;
    await user.save();

    res.json({
      message: `Always require 2FA ${user.twoFactorAlwaysRequired ? 'enabled' : 'disabled'}`,
      twoFactorAlwaysRequired: user.twoFactorAlwaysRequired
    });
  } catch (error) {
    logger.error('Toggle always required 2FA error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
