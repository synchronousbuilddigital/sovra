const express = require('express');
const router = express.Router();
const {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const paymentRateLimiter = require('../middleware/paymentRateLimiter');

// Public gateway public key discovery (Protected by user session + rate limiting)
router.get('/config', protect, paymentRateLimiter, getRazorpayConfig);

// Initialize a payment order with Razorpay
router.post('/create-order/:id', protect, paymentRateLimiter, createRazorpayOrder);

// Cryptographically verify signature and settle order
router.post('/verify', protect, paymentRateLimiter, verifyPayment);

// Asynchronous Razorpay webhook (No auth middleware - uses HMAC signature verification)
router.post('/webhook', handleWebhook);

module.exports = router;
