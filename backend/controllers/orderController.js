const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Promo = require('../models/promoModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');
const { sendEmail, getOrderConfirmationTemplate } = require('../utils/sendEmail');


// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    promoCode
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Atomic Stock Check and Decrement
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { session, new: true }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name}` });
      }
    }

    // 2. Validate Promo Code
    let finalDiscount = 0;
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true }).session(session);
      if (promo && (!promo.expiryDate || new Date(promo.expiryDate) > new Date()) && (!promo.limit || promo.usedCount < promo.limit)) {
        finalDiscount = (itemsPrice * promo.discount) / 100;
        promo.usedCount += 1;
        await promo.save({ session });
      }
    }

    // 3. Create Order
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      promoCode,
      discountPrice: finalDiscount
    });

    const createdOrder = await order.save({ session });

    // 4. Clear User Cart
    const user = await User.findById(req.user._id).session(session);
    if (user) {
      user.cart = [];
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    // 5. Send Confirmation Email (Async, non-blocking after order success)
    try {
      const orderUser = await User.findById(req.user._id);
      const emailOptions = {
        email: orderUser.email,
        subject: `Order Confirmation - SOVRA #${createdOrder._id.toString().slice(-6).toUpperCase()}`,
        html: getOrderConfirmationTemplate(createdOrder, orderUser)
      };
      await sendEmail(emailOptions);
    } catch (emailErr) {
      console.error('Email confirmation failed:', emailErr);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error('Order error:', error);
    res.status(500).json({ message: 'Error processing order registration' });
  }
};


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving record from vault' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Treasury update failure' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Archive search failure' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort('-createdAt');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error: Archival search failed' });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { status, trackingNumber, carrier, reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = status;
    order.trackingNumber = trackingNumber || order.trackingNumber;
    order.carrier = carrier || order.carrier;
    order.statusUpdateReason = reason || order.statusUpdateReason;

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    if (status === 'Cancelled') {
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.qty }
        });
      }
    }

    const updatedOrder = await order.save();

    // Notify User
    const user = await User.findById(order.user);
    if (user) {
      let message = `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`;
      if (status === 'Shipped' && trackingNumber) {
        message += ` Track via ${carrier}: ${trackingNumber}`;
      }
      user.notifications.push({
        title: `Order Update - ${status}`,
        message,
        type: 'Order'
      });
      await user.save();
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};


// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const { reason } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      res.status(401).json({ message: 'Not authorized to cancel this order' });
      return;
    }

    if (order.status === 'Delivered' || order.status === 'Shipped') {
      res.status(400).json({ message: 'Cannot cancel order after it has been shipped or delivered' });
      return;
    }

    if (order.status === 'Cancelled') {
      res.status(400).json({ message: 'Order is already cancelled' });
      return;
    }

    order.status = 'Cancelled';
    order.statusUpdateReason = reason || 'Cancelled by user/admin request.';
    const updatedOrder = await order.save();

    // Increment/Restore product stock atomically
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.qty }
      });
    }

    // Notify User
    const user = await User.findById(order.user);
    if (user) {
      user.notifications.push({
        title: 'Order Cancelled',
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} has been cancelled. Reason: ${order.statusUpdateReason}`,
        type: 'Order'
      });
      await user.save();
    }

    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};


// @desc    Request order return
// @route   POST /api/orders/:id/return
// @access  Private
const createOrderReturn = async (req, res) => {
  const { reason, details, images } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (!order.isDelivered) {
      res.status(400).json({ message: 'Can only request return for delivered orders' });
      return;
    }

    if (order.returnRequest.isRequested) {
      res.status(400).json({ message: 'Return already requested for this order' });
      return;
    }

    order.returnRequest = {
      isRequested: true,
      reason,
      details,
      images,
      status: 'Pending',
      requestedAt: Date.now(),
    };
    order.status = 'Return Requested';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update return status
// @route   PUT /api/orders/:id/return-status
// @access  Private/Admin
const updateReturnStatus = async (req, res) => {
  const { status, adminNotes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.returnRequest) {
      order.returnRequest.status = status;
      order.returnRequest.adminNotes = adminNotes;

      if (status === 'Approved') {
        order.status = 'Return Approved';
      } else if (status === 'Rejected') {
        order.status = 'Return Rejected';
      }

      const updatedOrder = await order.save();

      // Notify User
      const user = await User.findById(order.user);
      if (user) {
        user.notifications.push({
          title: `Return Request ${status}`,
          message: `Your return request for order #${order._id.toString().slice(-6).toUpperCase()} has been ${status.toLowerCase()}.${adminNotes ? ' Note: ' + adminNotes : ''}`,
          type: 'Order'
        });
        await user.save();
      }

      res.json(updatedOrder);
    } else {
      res.status(400).json({ message: 'No return request found for this order' });
    }
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Update order internal notes
// @route   PUT /api/orders/:id/notes
// @access  Private/Admin
const updateOrderNotes = async (req, res) => {
  const { notes } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.internalNotes = notes;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

// @desc    Generate Order Invoice (HTML)
// @route   GET /api/orders/:id/invoice
// @access  Private/Admin
const getOrderInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.send(`
      <html>
        <head>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 60px; color: #1a1a1a; line-height: 1.6; }
            .header { border-bottom: 1px solid #1a1a1a; padding-bottom: 30px; display: flex; justify-content: space-between; align-items: baseline; }
            .headline { font-size: 2.5rem; letter-spacing: -0.05em; font-weight: 300; font-style: italic; }
            .meta { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.2em; opacity: 0.6; }
            .items { width: 100%; border-collapse: collapse; margin-top: 60px; }
            .items th { text-align: left; border-bottom: 1px solid #eee; padding: 15px; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; font-weight: 900; }
            .items td { padding: 25px 15px; border-bottom: 1px solid #f9f9f9; font-size: 0.9rem; }
            .total { margin-top: 60px; text-align: right; border-top: 1px solid #1a1a1a; padding-top: 30px; }
            @media print { body { padding: 20px; } .header { border-bottom-width: 2px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="headline">SOVRA ATELIER</div>
            <div class="meta">Certificate of Acquisition #${order._id.toString().slice(-6).toUpperCase()}</div>
          </div>
          <div style="margin-top: 60px; display: grid; grid-template-cols: 1fr 1fr; gap: 40px;">
            <div>
              <p class="meta" style="margin-bottom: 10px;">Acquired By</p>
              <strong>${order.user.name}</strong><br/>
              ${order.shippingAddress.address}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.country}<br/>
              ${order.user.email}
            </div>
            <div style="text-align: right;">
              <p class="meta" style="margin-bottom: 10px;">Date of Registry</p>
              ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Archival Piece</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `
                <tr>
                  <td style="font-style: italic;">${item.name}</td>
                  <td>${item.qty}</td>
                  <td>₹${item.price.toLocaleString()}</td>
                  <td style="font-weight: 600;">₹${(item.price * item.qty).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <div style="font-size: 0.8rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em;">Final Treasury Valuation</div>
            <div style="font-size: 3rem; font-style: italic; margin-top: 10px; font-weight: 300;">₹${order.totalPrice.toLocaleString()}</div>
          </div>
          <div style="margin-top: 100px; font-size: 0.65rem; opacity: 0.4; letter-spacing: 0.05em; text-align: center;">
            Authenticity and provenance guaranteed by Maison Sovra. This acquisition is recorded in the permanent archive.
          </div>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};

module.exports = {
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
};
