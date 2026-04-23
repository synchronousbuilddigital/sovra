const express = require('express');
const router = express.Router();
const {
  authUser,
  registerUser,
  verifyOTP,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  addToWishlist,
  removeFromWishlist,
  addToCart,
  updateCartQty,
  removeFromCart,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  forgotPassword,
  resetPassword,
  getAddresses,
  addAddress,
  updateAddress,
  removeAddress,
  trackRecentlyViewed,
  getRecentlyViewed,
  getAbandonedCarts,
  sendRecoveryNote,

} = require('../controllers/userController');
const { getNotifications, markAsRead } = require('../controllers/notificationController');


const { protect, admin } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerUserSchema, loginUserSchema, updateUserProfileSchema } = require('../validation/user.schema.js');

// Public routes
router.post('/', validate(registerUserSchema), registerUser);
router.post('/login', validate(loginUserSchema), authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User specific private routes
router.route('/profile').get(protect, getUserProfile).put(protect, validate(updateUserProfileSchema), updateUserProfile);
router.route('/verify-otp').post(protect, verifyOTP);
router.route('/resend-otp').post(protect, resendOTP);

// Address Book routes
router.route('/addresses').get(protect, getAddresses).post(protect, addAddress);
router.route('/addresses/:id').put(protect, updateAddress).delete(protect, removeAddress);


// Wishlist routes
router.route('/wishlist').post(protect, addToWishlist);
router.route('/wishlist/:id').delete(protect, removeFromWishlist);

// Cart routes
router.route('/cart').post(protect, addToCart);
router.route('/cart/:id').put(protect, updateCartQty).delete(protect, removeFromCart);

// Recently Viewed
router.route('/recently-viewed').get(protect, getRecentlyViewed).post(protect, trackRecentlyViewed);

// Notifications
router.route('/notifications').get(protect, getNotifications);
router.route('/notifications/:id/read').put(protect, markAsRead);


// Admin routes
router.route('/').get(protect, admin, getUsers);
router.route('/admin/abandoned-carts').get(protect, admin, getAbandonedCarts);
router.route('/admin/send-recovery/:id').post(protect, admin, sendRecoveryNote);
router.route('/:id').delete(protect, admin, deleteUser).get(protect, admin, getUserById).put(protect, admin, updateUser);


module.exports = router;
