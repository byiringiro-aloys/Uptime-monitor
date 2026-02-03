import { Resend } from 'resend';
import logger from '../utils/logger.js';

// Lazy initialization to handle ESM hoisting issues
let resendInstance = null;

const getResendClient = () => {
  if (resendInstance) return resendInstance;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.includes('REPLACE_WITH')) {
    return null;
  }

  try {
    resendInstance = new Resend(apiKey);
    return resendInstance;
  } catch (error) {
    logger.error('Failed to initialize Resend:', error.message);
    return null;
  }
};

const isEmailAvailable = () => {
  const client = getResendClient();
  if (!client) {
    logger.warn('Email service unavailable - Resend not configured');
    return false;
  }
  return true;
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, resetToken, username) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request - Uptime Monitor',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
              .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .warning { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hi ${username},</p>
                <p>We received a request to reset your password for your Uptime Monitor account.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd;">
                  ${resetUrl}
                </p>
                <div class="warning">
                  <strong>⚠️ Important:</strong>
                  <ul>
                    <li>This link will expire in 1 hour</li>
                    <li>If you did not request this password reset, please ignore this email</li>
                    <li>Your password will not be changed unless you click the link above and complete the process</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Uptime Monitor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      logger.error('Failed to send password reset email:', error);
      return { success: false, error };
    }

    logger.info(`Password reset email sent to ${email}`);
    return { success: true, data };
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send 2FA setup confirmation email
 */
export const send2FAEnabledEmail = async (email, username) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Two-Factor Authentication Enabled - Uptime Monitor',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
              .info { background-color: #DBEAFE; border-left: 4px solid #3B82F6; padding: 15px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ 2FA Enabled</h1>
              </div>
              <div class="content">
                <p>Hi ${username},</p>
                <p>Two-factor authentication has been successfully enabled on your Uptime Monitor account.</p>
                <div class="info">
                  <strong>🔒 What this means:</strong>
                  <ul>
                    <li>Your account is now more secure</li>
                    <li>You'll be asked for a verification code when logging in from new devices</li>
                    <li>You can disable 2FA anytime from your account settings</li>
                  </ul>
                </div>
                <p>If you did not enable 2FA, please contact support immediately.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Uptime Monitor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      logger.error('Failed to send 2FA enabled email:', error);
      return { success: false, error };
    }

    logger.info(`2FA enabled email sent to ${email}`);
    return { success: true, data };
  } catch (error) {
    logger.error('Error sending 2FA enabled email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send email verification link
 */
export const sendVerificationEmail = async (email, token, username) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const verificationUrl = `${FRONTEND_URL}/verify-email/${token}`;
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - Uptime Monitor',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #000; text-align: center;">Welcome to Uptime Monitor!</h2>
          <p>Hello ${username},</p>
          <p>Please verify your email address to activate your account and start monitoring your services.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        </div>
      `
    });

    if (error) {
      logger.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send monitor UP/DOWN alert
 */
export const sendMonitorAlert = async (email, monitorName, status, errorDetails, duration) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  const isDown = status === 'down';
  const color = isDown ? '#ef4444' : '#22c55e'; // Red or Green
  const subject = isDown
    ? `🔴 Monitor DOWN: ${monitorName}`
    : `🟢 Monitor UP: ${monitorName}`;

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; border-top: 4px solid ${color};">
          <h2 style="color: ${color}; text-align: center;">${subject}</h2>
          
          <div style="background-color: ${isDown ? '#fef2f2' : '#f0fdf4'}; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid ${isDown ? '#fee2e2' : '#dcfce7'};">
            <p style="margin: 5px 0;"><strong>Monitor:</strong> ${monitorName}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            ${duration ? `<p style="margin: 5px 0;"><strong>Downtime Duration:</strong> ${duration}</p>` : ''}
            ${errorDetails ? `<p style="margin: 5px 0; color: #dc2626;"><strong>Error:</strong> ${errorDetails}</p>` : ''}
          </div>

          <p>
            <a href="${FRONTEND_URL}/dashboard" style="color: #000; text-decoration: none;">View Dashboard</a>
          </p>
        </div>
      `
    });

    if (error) {
      logger.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send weekly report
 */
export const sendWeeklyReport = async (email, username, stats) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Weekly Uptime Report',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #000; text-align: center;">Your Weekly Report</h2>
          <p>Hello ${username},</p>
          <p>Here's a summary of your monitors for the past week:</p>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
              <h3 style="margin: 0; color: #4b5563;">Overall Uptime</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #111827;">${stats.uptime}%</p>
            </div>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; text-align: center;">
              <h3 style="margin: 0; color: #4b5563;">Incidents</h3>
              <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #ef4444;">${stats.incidents}</p>
            </div>
          </div>

          <p style="text-align: center;">
            <a href="${FRONTEND_URL}/dashboard" style="background-color: #000; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View Details</a>
          </p>
        </div>
      `
    });

    if (error) {
      logger.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    logger.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send suspicious login alert email
 */
export const sendSuspiciousLoginAlert = async (email, username, loginDetails) => {
  if (!isEmailAvailable()) {
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { ip, userAgent, timestamp, location } = loginDetails;
    const resend = getResendClient();

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '⚠️ New Login Detected - Uptime Monitor',
      html: `
                </div>
                <div class="warning">
                  <strong>Was this you?</strong>
                  <p>If you recognize this activity, you can safely ignore this email.</p>
                  <p>If you did NOT log in, we recommend:</p>
                  <ul>
                    <li>Change your password immediately</li>
                    <li>Enable two-factor authentication</li>
                    <li>Review your recent account activity</li>
                  </ul>
                </div>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Uptime Monitor. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      logger.error('Failed to send suspicious login alert:', error);
      return { success: false, error };
    }

    logger.info(`Suspicious login alert sent to ${email}`);
    return { success: true, data };
  } catch (error) {
    logger.error('Error sending suspicious login alert:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendPasswordResetEmail,
  send2FAEnabledEmail,
  sendSuspiciousLoginAlert,
  sendVerificationEmail,
  sendMonitorAlert,
  sendWeeklyReport
};
