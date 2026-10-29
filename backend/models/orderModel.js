const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
    },
  ],
  shippingAddress: {
    fullName: { type: String },
    phone: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  razorpayOrderId: { type: String, index: true },
  razorpayPaymentId: { type: String, index: true, unique: true, sparse: true },
  razorpaySignature: { type: String },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String },
    method: { type: String },
    bank: { type: String },
    wallet: { type: String },
    vpa: { type: String },
  },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  status: { type: String, required: true, default: 'Pending' }, // 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'
  returnRequest: {
    isRequested: { type: Boolean, default: false },
    reason: { type: String },
    details: { type: String },
    images: [{ type: String }],
    adminNotes: { type: String },
    status: { type: String, default: 'Pending' }, // 'Pending', 'Approved', 'Rejected'
    requestedAt: { type: Date },
  },
  internalNotes: { type: String, default: '' },
  trackingNumber: { type: String, default: '' },
  carrier: { type: String, default: '' },
  statusUpdateReason: { type: String, default: '' }, // For cancellations or return rejections
  promoCode: { type: String },
  discountPrice: { type: Number, default: 0.0 },
}, {




  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
