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

  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    res.status(400).json({ message: 'No order items provided' });
    return;
  }

  if (!shippingAddress || !shippingAddress.postalCode) {
    return res.status(400).json({ message: 'Delivery address and postal PIN code are required.' });
  }

  const cleanPostalCode = String(shippingAddress.postalCode || '').replace(/\D/g, '');
  if (cleanPostalCode.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPostalCode)) {
    return res.status(400).json({ message: 'Please provide a valid 6-digit Indian delivery PIN code.' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Atomic Stock Check, Decrement, and Server-Side Price Verification
    let serverSubtotal = 0;

    for (const item of orderItems) {
      if (!item.qty || item.qty < 1) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Invalid quantity for item: ${item.name || 'Unknown'}` });
      }

      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { session, new: true }
      );

      if (!updatedProduct) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Insufficient stock for product: ${item.name || 'Selected piece'}` });
      }

      // Enforce authoritative catalog price from the verified database record
      const authoritativePrice = Number(updatedProduct.price) || 0;
      item.price = authoritativePrice;
      item.name = updatedProduct.name;
      serverSubtotal += authoritativePrice * item.qty;
    }

    // 2. Authoritative Promo Code Validation & Discount Calculation
    let finalDiscount = 0;
    let appliedPromoCode = undefined;

    if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
      const cleanCode = promoCode.trim().toUpperCase();
      const promo = await Promo.findOne({ code: cleanCode }).session(session);

      if (!promo) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Coupon code "${cleanCode}" does not exist.` });
      }

      if (!promo.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Coupon code "${cleanCode}" is no longer active.` });
      }

      if (promo.expiryDate) {
        const exp = new Date(promo.expiryDate);
        if (exp.getUTCHours() === 0 && exp.getUTCMinutes() === 0 && exp.getUTCSeconds() === 0) {
          exp.setUTCHours(23, 59, 59, 999);
        }
        if (exp.getTime() < Date.now()) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ message: `Coupon code "${cleanCode}" has expired.` });
        }
      }

      if (promo.limit && promo.usedCount >= promo.limit) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: `Coupon code "${cleanCode}" has reached its maximum usage limit.` });
      }

      // Per-user redemption limit check
      if (promo.usedBy && Array.isArray(promo.usedBy)) {
        const userRedemptionCount = promo.usedBy.filter(
          (userId) => userId.toString() === req.user._id.toString()
        ).length;

        const allowedPerUser = promo.perUserLimit || 1;
        if (userRedemptionCount >= allowedPerUser) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({
            message: `You have already redeemed coupon "${cleanCode}" on a previous order.`
          });
        }
      }

      // Minimum cart subtotal check
      if (promo.minOrderAmount > 0 && serverSubtotal < promo.minOrderAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Coupon "${cleanCode}" requires a minimum cart subtotal of ₹${promo.minOrderAmount.toLocaleString()}.`
        });
      }

      // Calculate authoritative discount percentage with optional ceiling
      let calculatedDiscount = (serverSubtotal * promo.discount) / 100;
      if (promo.maxDiscountAmount && calculatedDiscount > promo.maxDiscountAmount) {
        calculatedDiscount = promo.maxDiscountAmount;
      }

      finalDiscount = Math.round(calculatedDiscount);
      appliedPromoCode = cleanCode;

      // Atomic usage count and user tracking
      promo.usedCount = (promo.usedCount || 0) + 1;
      if (!promo.usedBy) promo.usedBy = [];
      promo.usedBy.push(req.user._id);
      await promo.save({ session });
    }

    // 3. Authoritative Tax, Shipping, and Total Calculation
    // Product prices are all-inclusive; no extra taxes or charges are added on top
    const netTaxableAmount = Math.max(0, serverSubtotal - finalDiscount);
    const serverTaxPrice = 0; // Prices are all-inclusive of taxes
    const serverShippingPrice = 0; // Complimentary luxury insured shipping
    const serverTotalPrice = netTaxableAmount + serverShippingPrice;

    // Cash on Delivery check (COD is not provided)
    if (paymentMethod === 'Cash on Delivery' || paymentMethod === 'COD') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Cash on Delivery is not supported. Please pay online via UPI, Cards, or NetBanking.' });
    }

    // 4. Create Order with Server-Verified Financials
    const order = new Order({
      orderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: serverSubtotal,
      taxPrice: serverTaxPrice,
      shippingPrice: serverShippingPrice,
      totalPrice: serverTotalPrice,
      promoCode: appliedPromoCode,
      discountPrice: finalDiscount
    });

    const createdOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

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
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: IDOR prevention - only the customer who placed the order or an admin can access it
    const orderUserId = order.user ? (order.user._id ? order.user._id.toString() : order.user.toString()) : null;
    if (orderUserId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to view this order.' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving order details.' });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Security: Only an administrator can manually settle payment status without gateway webhook verification
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: Manual payment settlement requires administrator authorization.' });
    }

    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ message: 'Invalid payment confirmation payload. Transaction identifier and status required.' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: String(id).slice(0, 100),
      status: String(status).slice(0, 50),
      update_time: req.body.update_time || new Date().toISOString(),
      email_address: req.body.email_address || req.user.email,
    };

    const updatedOrder = await order.save();
    res.json(updatedOrder);
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

    // Restore promo code usage if applied to this cancelled order
    if (order.promoCode) {
      try {
        await Promo.findOneAndUpdate(
          { code: order.promoCode },
          {
            $inc: { usedCount: -1 },
            $pull: { usedBy: order.user }
          }
        );
      } catch (promoErr) {
        console.error('Failed to restore promo code on order cancellation:', promoErr);
      }
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
// @desc    Request an exchange for a delivered order (Strictly 48-hour window & unboxing video required)
// @route   POST /api/orders/:id/return
// @access  Private
const createOrderReturn = async (req, res) => {
  const { reason, details, images, video, hasUnboxingVideo } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (!order.isDelivered && order.status !== 'Delivered') {
    return res.status(400).json({ message: 'Can only request an exchange for delivered orders' });
  }

  // Strict 48-Hour Delivery Check
  const deliveredTime = order.deliveredAt || order.updatedAt;
  const hoursSinceDelivery = (Date.now() - new Date(deliveredTime).getTime()) / (1000 * 60 * 60);

  if (hoursSinceDelivery > 48) {
    return res.status(400).json({
      message: 'Exchange window has closed. In accordance with Sovra policy, exchanges must be reported within 48 hours of confirmed delivery.',
    });
  }

  if (order.returnRequest && order.returnRequest.isRequested) {
    return res.status(400).json({ message: 'An exchange has already been requested for this order.' });
  }

  order.returnRequest = {
    isRequested: true,
    reason,
    details: `${details || ''}${hasUnboxingVideo ? ' [Customer confirmed continuous unboxing video ready]' : ''}`,
    images: images || [],
    video: video || '',
    status: 'Pending',
    requestedAt: Date.now(),
  };
  order.status = 'Return Requested';

  const updatedOrder = await order.save();
  res.json(updatedOrder);
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
        const wasAlreadyApproved = order.status === 'Return Approved';
        order.status = 'Return Approved';

        // Return stock to inventory if not already credited
        if (!wasAlreadyApproved && Array.isArray(order.orderItems)) {
          for (const item of order.orderItems) {
            if (item.product) {
              await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: Number(item.qty) || 1 }
              });
            }
          }
        }
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
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');

  if (order) {
    const grandTotal = order.totalPrice || 0;
    const shippingAmount = order.shippingPrice || 0;
    const netTaxable = Math.round(((grandTotal - shippingAmount) / 1.03) * 100) / 100;
    const totalGst = Math.max(0, Math.round(((grandTotal - shippingAmount) - netTaxable) * 100) / 100);

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Tax Invoice - #SOV-${order._id.toString().slice(-8).toUpperCase()}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fbfbf9; color: #1c1917; padding: 40px 20px; font-size: 12px; line-height: 1.5; font-variant-numeric: lining-nums; }
            .invoice-box { max-width: 820px; margin: auto; border: 1px solid #e7e5e4; border-radius: 16px; padding: 40px; background: #fff; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
            .gold-bar { height: 4px; background: linear-gradient(90deg, #855e23, #d4af37, #855e23); border-radius: 9999px; margin-bottom: 28px; }
            .header { display: flex; justify-content: space-between; border-bottom: 1px solid #e7e5e4; padding-bottom: 24px; gap: 20px; }
            .brand-col { display: flex; gap: 16px; align-items: center; }
            .brand-logo { height: 72px; width: 72px; object-fit: cover; border-radius: 14px; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
            .brand-title { font-size: 26px; font-weight: 500; letter-spacing: 3px; text-transform: uppercase; line-height: 1; font-family: 'Times New Roman', serif; }
            .brand-tag { font-size: 10px; font-weight: 700; color: #855e23; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
            .company-info { font-size: 11px; color: #78716c; margin-top: 8px; line-height: 1.4; }
            .meta-col { text-align: right; }
            .invoice-badge { font-size: 22px; font-weight: 400; text-transform: uppercase; letter-spacing: 3px; color: #1c1917; font-family: 'Times New Roman', serif; }
            .invoice-sub { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #a8a29e; margin-top: 2px; }
            .meta-item { margin-top: 5px; font-size: 11px; color: #78716c; }
            .meta-item strong { color: #1c1917; }
            .paid-badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; font-size: 9px; font-weight: 700; padding: 3px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; padding: 20px; background: #faf9f6; border: 1px solid #e7e5e4; border-radius: 14px; }
            .address-card h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #855e23; margin-bottom: 8px; font-weight: 800; }
            .address-card strong { font-size: 13px; color: #1c1917; display: block; margin-bottom: 4px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
            .items-table th { border-bottom: 2px solid #e7e5e4; text-align: left; padding: 12px 10px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #a8a29e; font-weight: 700; }
            .items-table td { padding: 14px 10px; border-bottom: 1px solid #f5f5f4; font-size: 12px; }
            .summary-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 28px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e7e5e4; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #57534e; }
            .grand-total { border-top: 2px solid #1c1917; padding-top: 12px; margin-top: 8px; font-size: 20px; font-weight: 600; color: #1c1917; }
            .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e7e5e4; display: flex; justify-content: space-between; font-size: 10px; color: #78716c; line-height: 1.5; }
            @media print {
              body { padding: 0; background: #fff; }
              .invoice-box { border: none; box-shadow: none; padding: 15px; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="gold-bar"></div>
            <div class="header">
              <div class="brand-col">
                <img src="/sovra-gold-logo.jpg" alt="SOVRA" class="brand-logo" onerror="this.src='/logo.png'" />
                <div>
                  <div class="brand-title">SOVRA</div>
                  <div class="brand-tag">Adorn Your Story • Fine Jewellery</div>
                  <div class="company-info">
                    <strong>Sovra Lifestyle Private Limited</strong><br/>
                    23, Pulla Beside Platinum Square, RK Circle, Udaipur - 313001<br/>
                    support@sovra.in | +91 9571746435 | www.sovra.in<br/>
                    <strong>GSTIN: 08AAECS1234F1Z5</strong> • State: Rajasthan (08)
                  </div>
                </div>
              </div>
              <div class="meta-col">
                <div class="invoice-badge">TAX INVOICE</div>
                <div class="invoice-sub">Original for Recipient</div>
                <div class="meta-item">Invoice No: <strong>INV-SOV-${order._id.toString().slice(-8).toUpperCase()}</strong></div>
                <div class="meta-item">Order ID: <strong>#SOV-${order._id.toString().slice(-8).toUpperCase()}</strong></div>
                <div class="meta-item">Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                <div class="meta-item">Payment: <strong>${order.paymentMethod || 'Online Prepaid'}</strong></div>
                <div><span class="paid-badge">${order.status === 'Cancelled' ? 'CANCELLED (VOID)' : order.isPaid ? 'PAID' : 'PAYMENT PENDING'}</span></div>
              </div>
            </div>

            <div class="address-grid">
              <div class="address-card">
                <h4>Billed To (Customer)</h4>
                <strong>${order.shippingAddress.fullName || order.user.name}</strong>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
                ${order.shippingAddress.country}<br/>
                ${order.user.email ? '<span style="color:#78716c;">Email: ' + order.user.email + '</span><br/>' : ''}
                ${(order.shippingAddress.phone || order.user.phone) ? '<span style="color:#78716c;">Phone: ' + (order.shippingAddress.phone || order.user.phone) + '</span>' : ''}
              </div>
              <div class="address-card" style="border-left: 1px solid #e7e5e4; padding-left: 20px;">
                <h4>Shipped To (Destination)</h4>
                <strong>${order.shippingAddress.fullName || order.user.name}</strong>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
                ${order.shippingAddress.country}<br/>
                Logistics: <strong>${order.carrier || 'Insured Express Courier'}</strong>
                ${order.trackingNumber ? '<br/>AWB: <strong>' + order.trackingNumber + '</strong>' : ''}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">#</th>
                  <th>Item Details</th>
                  <th style="width: 80px; text-align: center;">HSN</th>
                  <th style="width: 50px; text-align: center;">Qty</th>
                  <th style="width: 100px; text-align: right;">Unit Rate</th>
                  <th style="width: 110px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item, i) => {
                  const gross = item.price * item.qty;
                  return `
                    <tr>
                      <td style="text-align: center; color: #a8a29e; font-family: monospace;">${i + 1}</td>
                      <td>
                        <strong style="color: #1c1917; font-size: 13px;">${item.name}</strong><br/>
                        <span style="font-size: 10px; color: #78716c;">SKU: SOV-${item.product.toString().slice(-6).toUpperCase()} • 18K PVD Gold Plating • 3% GST Included</span>
                      </td>
                      <td style="text-align: center; color: #78716c; font-family: monospace;">7117</td>
                      <td style="text-align: center; font-weight: bold;">${item.qty}</td>
                      <td style="text-align: right; font-family: monospace; color: #44403c;">₹${item.price.toLocaleString('en-IN')}</td>
                      <td style="text-align: right; font-weight: bold; font-family: monospace; color: #1c1917; font-size: 13px;">₹${gross.toLocaleString('en-IN')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="summary-grid">
              <div style="font-size: 11px; color: #78716c;">
                <p><strong style="color: #1c1917; text-transform: uppercase; font-size: 9px; letter-spacing: 1px;">Brand Guarantee & Policy:</strong></p>
                <p>• Certified 18K PVD Gold Plating: Anti-tarnish, waterproof & sweatproof everyday fine jewellery.</p>
                <p>• 48-Hour Exchange Guarantee: For damaged or defective transit items with continuous unboxing video.</p>
                <p style="margin-top: 8px; font-style: italic; font-size: 9px; color: #a8a29e;">Computer generated Tax Invoice under Rule 48 of CGST Rules, 2017. Tax reverse charge: No.</p>
              </div>
              <div>
                <div class="total-row"><span>Items Subtotal:</span><span style="font-family: monospace; font-weight: 500;">₹${order.orderItems.reduce((acc, it) => acc + (it.price * it.qty), 0).toLocaleString('en-IN')}</span></div>
                ${order.discountPrice > 0 ? `<div class="total-row" style="color: #047857;"><span>Discount:</span><span style="font-family: monospace; font-weight: bold;">- ₹${order.discountPrice.toLocaleString('en-IN')}</span></div>` : ''}
                <div class="total-row"><span>Shipping & Handling:</span><span style="color: #047857; font-weight: bold;">${order.shippingPrice > 0 ? '₹' + order.shippingPrice.toLocaleString('en-IN') : 'FREE'}</span></div>
                <div class="total-row" style="color: #a8a29e; font-size: 11px;"><span>GST 3% (Included):</span><span style="font-family: monospace;">₹${totalGst.toLocaleString('en-IN')}</span></div>
                <div class="total-row grand-total"><span>Grand Total:</span><span style="font-family: monospace;">₹${grandTotal.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <div class="footer">
              <div>SOVRA JEWELLERY • UDAIPUR, RAJASTHAN • WWW.SOVRA.IN</div>
              <div style="text-align: right;">Authorized Signatory for SOVRA JEWELLERY</div>
            </div>
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
