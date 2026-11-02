const express = require('express');
const router = express.Router();
const {
  getOrderRates,
  shipOrder,
  getOrderLabel,
  getOrderManifest,
  getOrderInvoice,
  trackOrder,
  getPickupConfig,
  checkPincodeServiceability,
  lookupPincode,
} = require('../controllers/shippingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public: Check delivery pincode serviceability & estimated delivery date (EDD)
router.post('/check-pincode', checkPincodeServiceability);

// Public: Auto-fetch verified City & State from postal pincode
router.post('/lookup-pincode', lookupPincode);

// Pickup configuration
router.get('/config/pickup', protect, admin, getPickupConfig);

// Calculate shipping rates for an order
router.post('/order/:id/rates', protect, admin, getOrderRates);

// Book and ship order with courier partner
router.post('/order/:id/ship', protect, admin, shipOrder);

// Shipping label
router.get('/order/:id/label', protect, admin, getOrderLabel);

// Manifest
router.post('/order/:id/manifest', protect, admin, getOrderManifest);

// Invoice
router.get('/order/:id/invoice', protect, admin, getOrderInvoice);

// Live tracking (Order owner or Admin)
router.get('/order/:id/track', protect, trackOrder);

module.exports = router;

