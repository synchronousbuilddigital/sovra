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
    video: { type: String, default: '' },
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
  ad2ship: {
    orderId: { type: Number },
    orderNumber: { type: String, default: '' },
    awbNumber: { type: String, default: '', index: true },
    courierName: { type: String, default: '' },
    courierPartnerId: { type: Number },
    orderType: { type: String, default: 'forward' },
    paymentType: { type: String, default: 'prepaid' },
    labelUrl: { type: String, default: '' },
    invoiceUrl: { type: String, default: '' },
    manifestGenerated: { type: Boolean, default: false },
    shipmentStatus: { type: String, default: '' },
    totalCharges: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    codCharges: { type: Number, default: 0 },
    routeCode: { type: String, default: '' },
    weight: { type: Number, default: 0.5 },
    length: { type: Number, default: 10 },
    breadth: { type: Number, default: 10 },
    height: { type: Number, default: 5 },
    shippedAt: { type: Date },
    lastTrackedAt: { type: Date },
    trackingHistory: [
      {
        statusCode: String,
        status: String,
        statusDescription: String,
        location: String,
        eventDate: String,
        remarks: String,
      },
    ],
    notifications: {
      smsSent: { type: Boolean, default: false },
      smsSentAt: { type: Date },
      smsMessageId: { type: String, default: '' },
      whatsappSent: { type: Boolean, default: false },
      whatsappSentAt: { type: Date },
      whatsappMessageId: { type: String, default: '' },
      lastError: { type: String, default: '' },
    },
  },
}, {
  timestamps: true,
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
