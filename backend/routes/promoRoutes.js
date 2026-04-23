const express = require('express');
const router = express.Router();
const { getPromos, createPromo, deletePromo, validatePromo } = require('../controllers/promoController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getPromos)
  .post(protect, admin, createPromo);

router.get('/validate/:code', protect, validatePromo);

router.route('/:id')
  .delete(protect, admin, deletePromo);

module.exports = router;


