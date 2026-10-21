const express = require('express');
const router = express.Router();
const {
  getReels,
  getReelById,
  createReel,
  updateReel,
  updateHomeShowcase,
  deleteReel,
} = require('../controllers/reelController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getReels)
  .post(protect, admin, createReel);

router.route('/home-showcase')
  .put(protect, admin, updateHomeShowcase);

router.route('/:id')
  .get(getReelById)
  .put(protect, admin, updateReel)
  .delete(protect, admin, deleteReel);

module.exports = router;
