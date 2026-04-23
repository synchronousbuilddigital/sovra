const express = require('express');
const router = express.Router();
const {
  getMaterials,
  addMaterial,
  updateMaterial,
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, admin, getMaterials).post(protect, admin, addMaterial);
router.route('/:id').put(protect, admin, updateMaterial);

module.exports = router;
