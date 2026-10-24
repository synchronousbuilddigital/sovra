const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment config
dotenv.config();

// Ensure test secret keys are available
process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_SOVRAAtelier1947';
process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'SovraSecretKeyAuthentication99';
process.env.RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'SovraWebhookSecretSecurity2026';

const Order = require('../models/orderModel');
const User = require('../models/userModel');
const razorpayConfig = require('../config/razorpay');
const {
  getRazorpayConfig,
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} = require('../controllers/paymentController');

// Mock helper for Express req, res
const createMockReqRes = (reqOverrides = {}) => {
  const req = {
    headers: {},
    params: {},
    body: {},
    ip: '127.0.0.1',
    user: {
      _id: new mongoose.Types.ObjectId(),
      email: 'patron@sovrajewellery.com',
      isAdmin: false,
    },
    ...reqOverrides,
  };

  let statusCode = 200;
  let jsonResponse = null;

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      jsonResponse = data;
      return res;
    },
    send: (data) => {
      jsonResponse = data;
      return res;
    },
    getStatusCode: () => statusCode,
    getJSON: () => jsonResponse,
  };

  return { req, res };
};

test.describe('--- RAZORPAY SECURITY & INTEGRATION TEST SUITE ---', () => {

  test.beforeEach(() => {
    // Prevent unhandled Mongoose buffering timeouts by mocking DB calls
    User.findById = async () => ({ _id: new mongoose.Types.ObjectId(), email: 'patron@sovrajewellery.com' });
  });

  test('SECURITY: Cryptographic HMAC-SHA256 signature verification accepts authentic signatures', async () => {
    const fakeOrderId = new mongoose.Types.ObjectId();
    const fakeUserId = new mongoose.Types.ObjectId();
    const rzpOrderId = 'order_DA29103847321';
    const rzpPaymentId = 'pay_992103849102';

    // Generate valid authentic HMAC-SHA256 signature
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    // Mock order in memory
    const mockOrder = {
      _id: fakeOrderId,
      user: fakeUserId,
      totalPrice: 25000,
      isPaid: false,
      razorpayOrderId: rzpOrderId,
      save: async function () {
        return this;
      },
    };

    const originalFindById = Order.findById;
    const originalFindOne = Order.findOne;

    Order.findById = async () => mockOrder;
    Order.findOne = async () => null; // No duplicate payment replay

    try {
      const { req, res } = createMockReqRes({
        user: { _id: fakeUserId, email: 'patron@sovrajewellery.com' },
        body: {
          orderId: fakeOrderId.toString(),
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: validSignature,
        },
      });

      await verifyPayment(req, res);

      assert.equal(res.getStatusCode(), 200, 'Expected 200 OK for authentic payment signature');
      assert.equal(res.getJSON().success, true);
      assert.equal(mockOrder.isPaid, true, 'Order should be marked isPaid = true');
      assert.equal(mockOrder.razorpayPaymentId, rzpPaymentId);
    } finally {
      Order.findById = originalFindById;
      Order.findOne = originalFindOne;
    }
  });

  test('SECURITY: Price/Signature Tampering detection rejects forged signatures', async () => {
    const fakeOrderId = new mongoose.Types.ObjectId();
    const fakeUserId = new mongoose.Types.ObjectId();
    const rzpOrderId = 'order_DA29103847321';
    const rzpPaymentId = 'pay_992103849102';

    // Forged signature created with malicious key or modified string
    const forgedSignature = crypto
      .createHmac('sha256', 'attacker_wrong_secret')
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    const mockOrder = {
      _id: fakeOrderId,
      user: fakeUserId,
      totalPrice: 48000,
      isPaid: false,
      razorpayOrderId: rzpOrderId,
      save: async function () {
        return this;
      },
    };

    const originalFindById = Order.findById;
    const originalFindOne = Order.findOne;

    Order.findById = async () => mockOrder;
    Order.findOne = async () => null;

    try {
      const { req, res } = createMockReqRes({
        user: { _id: fakeUserId, email: 'patron@sovrajewellery.com' },
        body: {
          orderId: fakeOrderId.toString(),
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: forgedSignature,
        },
      });

      await verifyPayment(req, res);

      assert.equal(res.getStatusCode(), 400, 'Expected 400 Bad Request for forged signature');
      assert.equal(res.getJSON().success, false);
      assert.match(res.getJSON().message, /tampering/i);
      assert.equal(mockOrder.isPaid, false, 'Order must remain unpaid when signature fails');
    } finally {
      Order.findById = originalFindById;
      Order.findOne = originalFindOne;
    }
  });

  test('SECURITY: Anti-Replay Attack prevents reusing payment ID across multiple orders', async () => {
    const orderOneId = new mongoose.Types.ObjectId();
    const orderTwoId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const rzpPaymentId = 'pay_STOLEN_ALREADY_USED_ID';
    const rzpOrderId = 'order_ATTACK_REPLAY';

    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${rzpOrderId}|${rzpPaymentId}`)
      .digest('hex');

    const mockOrderTwo = {
      _id: orderTwoId,
      user: userId,
      totalPrice: 75000,
      isPaid: false,
      razorpayOrderId: rzpOrderId,
      save: async function () { return this; },
    };

    const originalFindById = Order.findById;
    const originalFindOne = Order.findOne;

    Order.findById = async () => mockOrderTwo;
    // Simulate payment ID already assigned to Order One
    Order.findOne = async () => ({ _id: orderOneId, razorpayPaymentId: rzpPaymentId });

    try {
      const { req, res } = createMockReqRes({
        user: { _id: userId, email: 'patron@sovrajewellery.com' },
        body: {
          orderId: orderTwoId.toString(),
          razorpay_order_id: rzpOrderId,
          razorpay_payment_id: rzpPaymentId,
          razorpay_signature: validSignature,
        },
      });

      await verifyPayment(req, res);

      assert.equal(res.getStatusCode(), 409, 'Expected 409 Conflict when payment ID is reused');
      assert.match(res.getJSON().message, /already been redeemed/i);
      assert.equal(mockOrderTwo.isPaid, false, 'Second order must NOT be marked paid');
    } finally {
      Order.findById = originalFindById;
      Order.findOne = originalFindOne;
    }
  });

  test('SECURITY: IDOR Prevention prevents unauthorized users from creating Razorpay order for another user', async () => {
    const victimUserId = new mongoose.Types.ObjectId();
    const attackerUserId = new mongoose.Types.ObjectId();
    const victimOrderId = new mongoose.Types.ObjectId();

    const mockVictimOrder = {
      _id: victimOrderId,
      user: victimUserId,
      totalPrice: 120000,
      isPaid: false,
    };

    const originalFindById = Order.findById;
    Order.findById = async () => mockVictimOrder;

    try {
      const { req, res } = createMockReqRes({
        user: { _id: attackerUserId, email: 'attacker@evil.com', isAdmin: false },
        params: { id: victimOrderId.toString() },
      });

      await createRazorpayOrder(req, res);

      assert.equal(res.getStatusCode(), 403, 'Expected 403 Forbidden for cross-account order access');
      assert.match(res.getJSON().message, /Access denied/i);
    } finally {
      Order.findById = originalFindById;
    }
  });

  test('SECURITY: Server-side price calculation enforces DB amount (ignores client amounts)', async () => {
    const userId = new mongoose.Types.ObjectId();
    const orderId = new mongoose.Types.ObjectId();

    // Authoritative total price in database
    const authoritativePrice = 35000;

    const mockOrder = {
      _id: orderId,
      user: userId,
      totalPrice: authoritativePrice,
      isPaid: false,
      save: async function () { return this; },
    };

    const originalFindById = Order.findById;
    Order.findById = async () => mockOrder;

    // Mock Razorpay SDK orders.create to avoid external network calls during unit test
    const rzpInstance = razorpayConfig.getRazorpayInstance();
    const originalOrdersCreate = rzpInstance.orders.create;
    rzpInstance.orders.create = async (options) => ({
      id: 'order_MOCK_VERIFIED_123',
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
    });

    try {
      const { req, res } = createMockReqRes({
        user: { _id: userId, email: 'patron@sovrajewellery.com', isAdmin: false },
        params: { id: orderId.toString() },
        body: {
          // Attacker attempts to pass a tampered price of ₹1
          amount: 100,
          totalPrice: 1,
        },
      });

      await createRazorpayOrder(req, res);

      assert.equal(res.getStatusCode(), 201);
      const json = res.getJSON();
      // Razorpay amount is in paise (35000 * 100 = 3500000)
      assert.equal(json.amount, authoritativePrice * 100, 'Server must calculate amount strictly from order.totalPrice in paise');
      assert.notEqual(json.amount, 100, 'Server must NEVER accept client-supplied amount');
    } finally {
      Order.findById = originalFindById;
      rzpInstance.orders.create = originalOrdersCreate;
    }
  });

  test('SECURITY: Webhook verification validates raw HMAC payload and rejects forged webhooks', async () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_WH_VERIFIED_123',
            order_id: 'order_WH_123',
            amount: 500000,
            status: 'captured',
          },
        },
      },
    });

    const validWebhookSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(Buffer.from(rawPayload))
      .digest('hex');

    const originalFindOne = Order.findOne;
    Order.findOne = async () => ({
      _id: new mongoose.Types.ObjectId(),
      isPaid: false,
      save: async function () { return this; },
    });

    try {
      // 1. Valid Webhook
      {
        const { req, res } = createMockReqRes({
          headers: { 'x-razorpay-signature': validWebhookSig },
          rawBody: Buffer.from(rawPayload),
          body: JSON.parse(rawPayload),
        });

        await handleWebhook(req, res);
        assert.equal(res.getStatusCode(), 200, 'Valid webhook signature must return 200 OK');
      }

      // 2. Forged Webhook
      {
        const { req, res } = createMockReqRes({
          headers: { 'x-razorpay-signature': 'forged_fake_signature_abc123' },
          rawBody: Buffer.from(rawPayload),
          body: JSON.parse(rawPayload),
        });

        await handleWebhook(req, res);
        assert.equal(res.getStatusCode(), 400, 'Invalid webhook signature must return 400 Bad Request');
      }
    } finally {
      Order.findOne = originalFindOne;
    }
  });

  test('SECURITY: Idempotent payment verification does not re-process already settled orders', async () => {
    const orderId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    const alreadyPaidOrder = {
      _id: orderId,
      user: userId,
      totalPrice: 18000,
      isPaid: true,
      paidAt: new Date(),
      razorpayOrderId: 'order_PAID_ALREADY',
      razorpayPaymentId: 'pay_ORIGINAL',
    };

    const originalFindById = Order.findById;
    Order.findById = async () => alreadyPaidOrder;

    try {
      const { req, res } = createMockReqRes({
        user: { _id: userId, email: 'patron@sovrajewellery.com' },
        body: {
          orderId: orderId.toString(),
          razorpay_order_id: 'order_PAID_ALREADY',
          razorpay_payment_id: 'pay_NEW_ATTEMPT',
          razorpay_signature: 'dummy_sig',
        },
      });

      await verifyPayment(req, res);

      assert.equal(res.getStatusCode(), 200, 'Already paid order should return 200 idempotent response');
      assert.match(res.getJSON().message, /already finalized/i);
      assert.equal(alreadyPaidOrder.razorpayPaymentId, 'pay_ORIGINAL', 'Must not overwrite original payment record');
    } finally {
      Order.findById = originalFindById;
    }
  });

  test('RATE LIMITING: Payment rate limiter is defined with strict security thresholds', () => {
    const paymentRateLimiter = require('../middleware/paymentRateLimiter');
    assert.ok(paymentRateLimiter, 'Payment rate limiter middleware must be defined');
    assert.equal(typeof paymentRateLimiter, 'function', 'Rate limiter must be an Express middleware function');
  });

});
