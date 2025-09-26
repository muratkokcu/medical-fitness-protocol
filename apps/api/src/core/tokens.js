const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate secure random tokens
function generateReadToken() {
  return crypto.randomBytes(32).toString('hex');
}

function generateAdminToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate JWT tokens for API access
function generateJWT(payload, expiresIn = '7d') {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyJWT(token) {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}

// Validate report access token
async function validateReportAccess(submissionId, accessToken, tokenType = 'read') {
  const Submission = require('../models/Submission');

  try {
    let submission;

    if (tokenType === 'read') {
      submission = await Submission.findByReadToken(accessToken);
    } else if (tokenType === 'admin') {
      submission = await Submission.findByAdminToken(accessToken);
    } else {
      throw new Error('Invalid token type');
    }

    if (!submission) {
      throw new Error('Invalid access token');
    }

    if (submission._id.toString() !== submissionId) {
      throw new Error('Token does not match submission');
    }

    return submission;
  } catch (error) {
    throw new Error(`Access validation failed: ${error.message}`);
  }
}

// Generate secure codes
function generateReportCode() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `MF-TR-${year}-${month}${day}-${random}`;
}

function generateShortCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Token utilities
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function compareTokens(token, hashedToken) {
  const tokenHash = hashToken(token);
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hashedToken));
}

// Cleanup expired tokens (reports only now)
async function cleanupExpiredTokens() {
  const Report = require('../models/Report');

  try {
    // Cleanup expired reports
    const expiredReports = await Report.cleanupExpired();

    console.log(`Cleaned up ${expiredReports.modifiedCount} expired reports`);

    return {
      reports: expiredReports.modifiedCount
    };
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    throw error;
  }
}

// Rate limiting helpers
const tokenUsageMap = new Map();

function checkTokenRateLimit(token, maxUsesPerHour = 10) {
  const now = Date.now();
  const hour = Math.floor(now / (1000 * 60 * 60));
  const key = `${token}-${hour}`;

  const usage = tokenUsageMap.get(key) || 0;

  if (usage >= maxUsesPerHour) {
    throw new Error('Token rate limit exceeded');
  }

  tokenUsageMap.set(key, usage + 1);

  // Cleanup old entries
  if (tokenUsageMap.size > 10000) {
    const cutoff = hour - 1;
    for (const [mapKey] of tokenUsageMap) {
      if (mapKey.endsWith(`-${cutoff}`) || mapKey.endsWith(`-${cutoff - 1}`)) {
        tokenUsageMap.delete(mapKey);
      }
    }
  }

  return true;
}

module.exports = {
  // Token generation
  generateReadToken,
  generateAdminToken,
  generateJWT,
  generateReportCode,
  generateShortCode,

  // Token validation
  verifyJWT,
  validateReportAccess,

  // Utilities
  hashToken,
  compareTokens,
  cleanupExpiredTokens,
  checkTokenRateLimit
};