const express = require('express');
const router = express.Router();
const {
  getStats,
  getRevenueData,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/stats').get(protect, admin, getStats);
router.route('/revenue').get(protect, admin, getRevenueData);

module.exports = router;
