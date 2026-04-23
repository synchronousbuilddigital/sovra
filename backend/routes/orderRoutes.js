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
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, updateOrderToPaid);

router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

router.route('/:id/status').put(protect, admin, updateOrderStatus);

router.route('/:id/cancel').put(protect, cancelOrder);

router.route('/:id/return').post(protect, createOrderReturn);
router.route('/:id/return-status').put(protect, admin, updateReturnStatus);

router.route('/:id/notes').put(protect, admin, updateOrderNotes);

router.route('/:id/invoice').get(protect, admin, getOrderInvoice);

module.exports = router;
