const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getPromos, getActivePromos, createPromo, deletePromo, validatePromo } = require('../controllers/promoController');
const { protect, admin, optionalProtect } = require('../middleware/authMiddleware');

// Dedicated rate limiter to prevent coupon code enumeration / brute-force guessing
const promoValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // max 20 validation attempts per 15 minutes per IP
  message: { message: 'Too many coupon validation attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.route('/')
  .get(protect, admin, getPromos)
  .post(protect, admin, createPromo);

// Active promos visible to customers in voucher section
router.get('/active', optionalProtect, getActivePromos);

router.get('/validate/:code', optionalProtect, promoValidateLimiter, validatePromo);

router.route('/:id')
  .delete(protect, admin, deletePromo);

module.exports = router;


