const rateLimit = require('express-rate-limit');

// Strict limiter for authentication attempts (Login, Password Reset)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts per 15 min per IP
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for OTP verification & resends
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 verification requests per 15 min
  message: { message: 'Too many OTP attempts. Please wait 15 minutes before retrying.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter for public newsletter subscriptions to prevent email bombing
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 newsletter subscriptions per hour per IP
  message: { message: 'Too many newsletter requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  otpLimiter,
  newsletterLimiter,
};
