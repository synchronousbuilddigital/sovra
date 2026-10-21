const express = require('express');
const router = express.Router();
const { subscribeNewsletter } = require('../controllers/newsletterController');
const { newsletterLimiter } = require('../middleware/rateLimiters');

router.post('/subscribe', newsletterLimiter, subscribeNewsletter);

module.exports = router;

