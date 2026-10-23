const express = require('express');
const router = express.Router();
const {
  getCategories,
  getHomeCategories,
  createCategory,
  updateCategory,
  toggleHomeCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route for Home Screen Hero categories
router.get('/home', getHomeCategories);

// Main categories route: GET (public), POST (admin only)
router.route('/')
  .get(getCategories)
  .post(protect, admin, createCategory);

// Quick toggle home screen status (admin only)
router.patch('/:id/toggle-home', protect, admin, toggleHomeCategory);

// By ID routes: PUT, DELETE (admin only)
router.route('/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

module.exports = router;
