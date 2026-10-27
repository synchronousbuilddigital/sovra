const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let instance = null;
let cachedKey = null;

const getRazorpayInstance = () => {
  let key_id = (process.env.RAZORPAY_KEY_ID || '').trim();
  const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

  // Defensive fix in case leading 'r' was omitted
  if (key_id.startsWith('zp_')) {
    key_id = 'r' + key_id;
  }

  if (instance && cachedKey === key_id) return instance;

  if (!key_id || !key_secret) {
    logger.warn('Razorpay credentials not fully configured in environment variables.');
  }

  cachedKey = key_id;
  instance = new Razorpay({
    key_id: key_id || 'rzp_test_placeholder',
    key_secret: key_secret || 'secret_placeholder',
  });

  return instance;
};

module.exports = {
  getRazorpayInstance,
};
