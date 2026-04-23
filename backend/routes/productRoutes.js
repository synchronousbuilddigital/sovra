const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { createProductSchema, updateProductSchema } = require('../validation/product.schema.js');

// All product routes
router.route('/').get(getProducts).post(protect, admin, validate(createProductSchema), createProduct);
router.route('/:id').get(getProductById).put(protect, admin, validate(updateProductSchema), updateProduct).delete(protect, admin, deleteProduct);
router.route('/:id/reviews').post(protect, createProductReview);

module.exports = router;
