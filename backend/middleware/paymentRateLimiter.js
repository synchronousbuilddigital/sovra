const rateLimit = require('express-rate-limit');

/**
 * High-Security Rate Limiter for Financial & Payment Transactions
 * Mitigates brute-force attacks against cryptographic signatures,
 * denial-of-service, and malicious order generation loops.
 */
const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 30, // Limit each client to 30 payment operations per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    keyGeneratorIpFallback: false,
  },
  message: {
    status: 429,
    message: 'High frequency of payment operations detected from this client. Please wait 15 minutes before retrying.'
  },
  keyGenerator: (req) => {
    // Key by authenticated user ID if present, otherwise by client IP
    return req.user ? `user_${req.user._id}` : req.ip;
  }
});

module.exports = paymentRateLimiter;
