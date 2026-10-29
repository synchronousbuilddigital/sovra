const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const logger = require('../utils/logger');

/**
 * Cancels orders that are still Pending & unpaid after 30 minutes,
 * and restores their stock atomically.
 */
const cancelExpiredOrders = async () => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const abandonedOrders = await Order.find({
      status: 'Pending',
      isPaid: false,
      createdAt: { $lt: thirtyMinutesAgo },
    });

    if (abandonedOrders.length === 0) return;

    logger.info(`Order expiry worker: cancelling ${abandonedOrders.length} abandoned order(s).`);

    for (const order of abandonedOrders) {
      // Mark cancelled first to prevent double-processing
      order.status = 'Cancelled';
      order.statusUpdateReason = 'Automated timeout: Payment not completed within 30 minutes.';
      await order.save();

      // Restore stock for each item
      for (const item of order.orderItems) {
        if (item.product && item.qty > 0) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.qty },
          });
        }
      }

      logger.info(`Expired order ${order._id} cancelled and stock restored.`);
    }
  } catch (err) {
    logger.error('Order expiry worker error:', err);
  }
};

module.exports = { cancelExpiredOrders };
