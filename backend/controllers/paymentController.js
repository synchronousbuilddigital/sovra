const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { getRazorpayInstance } = require('../config/razorpay');
const logger = require('../utils/logger');
const { sendEmail, getOrderConfirmationTemplate } = require('../utils/sendEmail');

const getNormalizedKeyId = () => {
  let key = (process.env.RAZORPAY_KEY_ID || '').trim();
  if (key.startsWith('zp_')) key = 'r' + key;
  return key;
};

/**
 * @desc    Get Razorpay Public Configuration
 * @route   GET /api/payment/config
 * @access  Private
 */
const getRazorpayConfig = (req, res) => {
  res.json({
    keyId: getNormalizedKeyId(),
    currency: 'INR',
  });
};

/**
 * @desc    Initialize Razorpay Order from Server-Verified Order Record
 * @route   POST /api/payment/create-order/:id
 * @access  Private
 * 
 * SECURITY: Amount is strictly computed from the database order.
 * Client cannot tamper with price, discount, or tax values.
 */
const createRazorpayOrder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order identifier format.' });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order record not found.' });
    }

    // IDOR Check: Ensure customer owns the order (or is admin)
    const isOwner = order.user && order.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      logger.warn(`Unauthorized payment attempt by user ${req.user._id} on order ${id}`);
      return res.status(403).json({ message: 'Access denied: You do not have authorization for this order.' });
    }

    // Idempotency: Prevent re-paying an already settled order
    if (order.isPaid) {
      return res.status(400).json({ message: 'This order has already been paid and settled.' });
    }

    // STRICT SERVER-SIDE CALCULATION:
    // Convert Rupees to Paise (integer only)
    const amountInPaise = Math.round(Number(order.totalPrice) * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({ message: 'Order total amount must be greater than zero.' });
    }

    // Idempotency: If a Razorpay order was already created for this DB order,
    // return it immediately instead of creating a new one. This prevents a
    // double-click from overwriting the stored razorpayOrderId and causing a
    // "Gateway order reference mismatch" on the verify step.
    if (order.razorpayOrderId) {
      logger.info(`Reusing existing Razorpay order ${order.razorpayOrderId} for internal Order: ${order._id}`);
      return res.status(200).json({
        success: true,
        razorpayOrderId: order.razorpayOrderId,
        amount: amountInPaise,
        currency: 'INR',
        orderId: order._id,
        keyId: getNormalizedKeyId(),
      });
    }

    const razorpay = getRazorpayInstance();
    const receiptId = `rcpt_${order._id.toString().slice(-14)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
        customerEmail: req.user.email || '',
      },
    });

    // Persist the generated Razorpay order ID
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    logger.info(`Razorpay order created: ${razorpayOrder.id} for internal Order: ${order._id}`);

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: order._id,
      keyId: getNormalizedKeyId(),
    });
  } catch (error) {
    logger.error('Error creating Razorpay order:', error);
    res.status(500).json({
      message: 'Failed to initialize payment gateway order.',
      error: process.env.NODE_ENV === 'production' ? null : error.message,
    });
  }
};

/**
 * @desc    Cryptographically Verify and Capture Razorpay Payment Signature
 * @route   POST /api/payment/verify
 * @access  Private
 * 
 * SECURITY:
 * 1. Constant-time timing-safe HMAC-SHA256 comparison.
 * 2. Order ID parity matching with DB record.
 * 3. Anti-replay prevention against duplicate payment IDs.
 */
const verifyPayment = async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // Strict input validation
  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      message: 'Incomplete payment payload: orderId, razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
    });
  }

  if (
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_signature !== 'string'
  ) {
    return res.status(400).json({ message: 'Invalid payload parameter types.' });
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order identifier format.' });
  }

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Associated order record not found.' });
    }

    // IDOR Check
    const isOwner = order.user && order.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: You are not authorized for this order.' });
    }

    // Idempotency: If already paid, return success without duplicate actions
    if (order.isPaid) {
      return res.status(200).json({
        success: true,
        message: 'Order payment is already finalized and settled.',
        order,
      });
    }

    // Verify order ID parity
    if (order.razorpayOrderId && order.razorpayOrderId !== razorpay_order_id) {
      logger.warn(`Razorpay Order ID mismatch for order ${orderId}. Expected ${order.razorpayOrderId}, received ${razorpay_order_id}`);
      return res.status(400).json({ message: 'Security alert: Gateway order reference mismatch.' });
    }

    // Anti-Replay: Ensure this payment ID hasn't been redeemed by another order
    const replayOrder = await Order.findOne({
      razorpayPaymentId: razorpay_payment_id,
      _id: { $ne: order._id },
    });

    if (replayOrder) {
      logger.error(`Replay attack detected: payment ID ${razorpay_payment_id} already attached to order ${replayOrder._id}`);
      return res.status(409).json({ message: 'Security alert: Transaction ID has already been redeemed on another order.' });
    }

    // Cryptographic HMAC-SHA256 signature calculation
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      logger.error('CRITICAL: RAZORPAY_KEY_SECRET is not configured on the server.');
      return res.status(500).json({ message: 'Treasury verification service misconfigured.' });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent side-channel timing attacks
    const signatureBuffer = Buffer.from(razorpay_signature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      logger.warn(`Cryptographic signature verification failed for order ${orderId} by user ${req.user._id}`);
      return res.status(400).json({
        success: false,
        message: 'Cryptographic signature verification failed. Transaction tampering detected.',
      });
    }

    // Atomic update: only succeeds if the order is still unpaid and has no
    // payment ID. This prevents a replay / double-spend if two verification
    // requests arrive simultaneously for the same order.
    const updatedOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        isPaid: false,
        $or: [
          { razorpayPaymentId: { $exists: false } },
          { razorpayPaymentId: null },
        ],
      },
      {
        $set: {
          isPaid: true,
          paidAt: new Date(),
          status: 'Processing',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          paymentResult: {
            id: razorpay_payment_id,
            status: 'captured',
            update_time: new Date().toISOString(),
            email_address: req.user.email || '',
          },
        },
      },
      { new: true }
    );

    if (!updatedOrder) {
      logger.warn(`Order ${orderId} is already settled or in-progress — concurrent request rejected.`);
      return res.status(409).json({ message: 'Order is already settled or in process.' });
    }
    logger.info(`Payment verified and captured for Order: ${updatedOrder._id}, Payment: ${razorpay_payment_id}`);

    // Atomically clear user cart only upon successful payment verification
    try {
      await User.findByIdAndUpdate(order.user, { $set: { cart: [] } });
      logger.info(`User cart cleared after successful payment for user ${order.user}`);
    } catch (cartErr) {
      logger.error('Failed to clear user cart after payment verification:', cartErr);
    }

    // Asynchronously dispatch confirmation email
    try {
      const orderUser = await User.findById(order.user);
      if (orderUser && orderUser.email) {
        sendEmail({
          email: orderUser.email,
          subject: `Payment Confirmed - SOVRA #${order._id.toString().slice(-6).toUpperCase()}`,
          html: getOrderConfirmationTemplate(updatedOrder, orderUser),
        }).catch((err) => logger.error('Order confirmation email failed to send:', err));
      }
    } catch (emailErr) {
      logger.error('Failed to prepare order confirmation email:', emailErr);
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully.',
      order: updatedOrder,
    });
  } catch (error) {
    logger.error('Payment verification system error:', error);
    res.status(500).json({ message: 'Internal server error during payment verification.' });
  }
};

/**
 * @desc    Razorpay Server-to-Server Webhook Handler
 * @route   POST /api/payment/webhook
 * @access  Public (Authenticated via HMAC header x-razorpay-signature)
 * 
 * Asynchronously reconciles payment captures or failed orders.
 */
const handleWebhook = async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.warn('RAZORPAY_WEBHOOK_SECRET is not configured on the server.');
    return res.status(500).json({ message: 'Webhook endpoint inactive.' });
  }

  if (!webhookSignature || !req.rawBody) {
    return res.status(400).json({ message: 'Missing webhook signature or raw payload.' });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    const signatureBuffer = Buffer.from(webhookSignature, 'utf-8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');

    const isValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!isValid) {
      logger.warn('Unauthorized Razorpay webhook invocation: signature mismatch.');
      return res.status(400).json({ message: 'Invalid webhook signature.' });
    }

    const event = req.body;
    logger.info(`Valid Razorpay Webhook Event: ${event.event}`);

    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || event.payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await Order.findOne({ razorpayOrderId });
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'Processing';
          order.razorpayPaymentId = razorpayPaymentId || order.razorpayPaymentId;
          order.paymentResult = {
            id: razorpayPaymentId,
            status: paymentEntity?.status || 'captured',
            update_time: new Date().toISOString(),
            method: paymentEntity?.method,
            bank: paymentEntity?.bank,
            wallet: paymentEntity?.wallet,
            vpa: paymentEntity?.vpa,
          };
          await order.save();
          logger.info(`Order ${order._id} marked as paid via webhook (${event.event})`);

          // Atomically clear user cart upon successful webhook payment confirmation
          try {
            await User.findByIdAndUpdate(order.user, { $set: { cart: [] } });
            logger.info(`User cart cleared via webhook for user ${order.user}`);
          } catch (cartErr) {
            logger.error('Failed to clear user cart via webhook:', cartErr);
          }
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    logger.error('Webhook execution failure:', error);
    res.status(500).json({ message: 'Webhook internal error.' });
  }
};

module.exports = {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
};
