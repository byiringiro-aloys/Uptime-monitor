import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  // Password Reset
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpires: {
    type: Date,
    select: false
  },
  // Two-Factor Authentication
  twoFactorSecret: {
    type: String,
    select: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorAlwaysRequired: {
    type: Boolean,
    default: false
  },
  // Login Activity Tracking
  loginHistory: [{
    ip: String,
    userAgent: String,
    timestamp: Date,
    success: Boolean,
    location: String
  }],
  trustedDevices: [{
    fingerprint: String,
    userAgent: String,
    ip: String,
    addedAt: Date,
    lastUsed: Date
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
userSchema.methods.createVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return verificationToken;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour

  return resetToken; // Return plain token to send via email
};

// Check if 2FA should be required based on activity
userSchema.methods.shouldRequire2FA = function (ip, userAgent) {
  // Always require if user has set the preference
  if (this.twoFactorAlwaysRequired) return true;

  // Don't require if 2FA is not enabled
  if (!this.twoFactorEnabled) return false;

  // Check if device is trusted
  const isTrusted = this.trustedDevices.some(device =>
    device.ip === ip && device.userAgent === userAgent
  );

  if (isTrusted) {
    // Update last used timestamp
    const device = this.trustedDevices.find(d => d.ip === ip && d.userAgent === userAgent);
    if (device) {
      device.lastUsed = new Date();
    }
    return false;
  }

  // Check for suspicious activity patterns
  const recentLogins = this.loginHistory
    .filter(login => login.success)
    .slice(-10); // Last 10 successful logins

  // New IP address
  const knownIPs = new Set(recentLogins.map(login => login.ip));
  if (!knownIPs.has(ip) && recentLogins.length > 0) return true;

  // Check for failed login attempts from this IP
  const recentFailures = this.loginHistory
    .filter(login =>
      !login.success &&
      login.ip === ip &&
      login.timestamp > Date.now() - 60 * 60 * 1000 // Last hour
    ).length;

  if (recentFailures >= 3) return true;

  // Check for long inactivity (30 days)
  if (recentLogins.length > 0) {
    const lastLogin = recentLogins[recentLogins.length - 1];
    const daysSinceLastLogin = (Date.now() - lastLogin.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSinceLastLogin > 30) return true;
  }

  return false;
};

// Add login attempt to history
userSchema.methods.addLoginAttempt = function (ip, userAgent, success, location = '') {
  this.loginHistory.push({
    ip,
    userAgent,
    timestamp: new Date(),
    success,
    location
  });

  // Keep only last 50 login attempts
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(-50);
  }
};

// Add trusted device
userSchema.methods.addTrustedDevice = function (ip, userAgent) {
  const fingerprint = crypto
    .createHash('sha256')
    .update(ip + userAgent)
    .digest('hex');

  // Check if device already exists
  const existingDevice = this.trustedDevices.find(d => d.fingerprint === fingerprint);
  if (existingDevice) {
    existingDevice.lastUsed = new Date();
    return;
  }

  this.trustedDevices.push({
    fingerprint,
    userAgent,
    ip,
    addedAt: new Date(),
    lastUsed: new Date()
  });

  // Keep only last 10 trusted devices
  if (this.trustedDevices.length > 10) {
    this.trustedDevices.sort((a, b) => b.lastUsed - a.lastUsed);
    this.trustedDevices = this.trustedDevices.slice(0, 10);
  }
};

export default mongoose.model('User', userSchema);
