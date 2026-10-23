const express = require('express');
const router = express.Router();
const {
  getProducts,
  getHomeProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  toggleHomeProduct,
} = require('../controllers/productController');
const { protect, admin, requireVerified } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProductSchema, updateProductSchema } = require('../validation/product.schema.js');

// Home featured products (max 8)
router.get('/home', getHomeProducts);

// All product routes
router.route('/').get(getProducts).post(protect, admin, validate(createProductSchema), createProduct);
router.route('/:id/toggle-home').patch(protect, admin, toggleHomeProduct).put(protect, admin, toggleHomeProduct);
router.route('/:id').get(getProductById).put(protect, admin, validate(updateProductSchema), updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, requireVerified, createProductReview);


module.exports = router;
