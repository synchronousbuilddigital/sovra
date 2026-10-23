const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  getMyOrders,
  getOrders,
  cancelOrder,
  createOrderReturn,
  updateReturnStatus,
  updateOrderNotes,
  getOrderInvoice
} = require('../controllers/orderController');
const { protect, admin, requireVerified } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, requireVerified, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

router.route('/:id/cancel').put(protect, requireVerified, cancelOrder);

router.route('/:id/return').post(protect, requireVerified, createOrderReturn);
router.route('/:id/return-status').put(protect, admin, updateReturnStatus);

router.route('/:id/notes').put(protect, admin, updateOrderNotes);

router.route('/:id/invoice').get(protect, admin, getOrderInvoice);


module.exports = router;
