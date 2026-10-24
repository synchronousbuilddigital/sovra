const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let instance = null;

const getRazorpayInstance = () => {
  if (instance) return instance;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    logger.warn('Razorpay credentials not fully configured in environment variables.');
  }

  instance = new Razorpay({
    key_id: key_id || 'rzp_test_placeholder',
    key_secret: key_secret || 'secret_placeholder',
  });

  return instance;
};

module.exports = {
  getRazorpayInstance,
};
