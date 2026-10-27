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
    const netTaxableAmount = Math.max(0, serverSubtotal - finalDiscount);
    const serverTaxPrice = Math.round(netTaxableAmount * 0.08); // 8% jewellery tax
    const serverShippingPrice = 0; // Complimentary luxury shipping
    const serverTotalPrice = netTaxableAmount + serverTaxPrice + serverShippingPrice;

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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #fff; color: #111; padding: 30px; font-size: 12px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e5e7eb; padding: 30px; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 20px; }
            .brand-col { display: flex; gap: 14px; align-items: flex-start; }
            .brand-logo { height: 60px; width: auto; object-fit: contain; }
            .brand-title { font-size: 24px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; line-height: 1; }
            .brand-tag { font-size: 10px; font-weight: 700; color: #6e5b44; text-transform: uppercase; margin-top: 4px; }
            .company-info { font-size: 11px; color: #4b5563; margin-top: 6px; line-height: 1.4; }
            .meta-col { text-align: right; }
            .invoice-badge { font-size: 22px; font-weight: 800; text-transform: uppercase; color: #000; }
            .meta-item { margin-top: 4px; font-size: 11px; }
            .meta-item strong { color: #111; }
            .paid-badge { display: inline-block; background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; margin-top: 5px; }
            .address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
            .address-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 14px; border-radius: 4px; }
            .address-card h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 6px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            .items-table th { background: #f3f4f6; text-align: left; padding: 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid #e5e7eb; }
            .items-table td { padding: 10px; border: 1px solid #e5e7eb; font-size: 11px; }
            .summary-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
            .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
            .grand-total { border-top: 2px solid #111; padding-top: 8px; font-size: 16px; font-weight: 800; }
            .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #6b7280; }
            @media print {
              body { padding: 0; background: #fff; }
              .invoice-box { border: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div class="brand-col">
                <img src="/logo.png" alt="SOVRA" class="brand-logo" onerror="this.style.display='none'" />
                <div>
                  <div class="brand-title">SOVRA</div>
                  <div class="brand-tag">Demi-Fine Everyday Jewellery • Udaipur</div>
                  <div class="company-info">
                    <strong>Sovra Lifestyle Private Limited</strong><br/>
                    23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001, Rajasthan<br/>
                    Email: support@sovra.in | Phone: +91 9571746435 | Web: www.sovra.in<br/>
                    <strong>GSTIN: 08AAECS1234F1Z5</strong> (State Code: 08-Rajasthan)
                  </div>
                </div>
              </div>
              <div class="meta-col">
                <div class="invoice-badge">TAX INVOICE</div>
                <div style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Original for Recipient</div>
                <div class="meta-item">Invoice No: <strong>INV-SOV-${order._id.toString().slice(-8).toUpperCase()}</strong></div>
                <div class="meta-item">Date: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></div>
                <div class="meta-item">Order ID: <strong>#SOV-${order._id.toString().slice(-8).toUpperCase()}</strong></div>
                <div class="meta-item">Payment: <strong>${order.paymentMethod || 'Online Prepaid'}</strong></div>
                <div><span class="paid-badge" style="${order.status === 'Cancelled' ? 'background:#fee2e2;color:#991b1b;border-color:#fca5a5;' : !order.isPaid && order.paymentMethod !== 'Cash on Delivery' ? 'background:#fef3c7;color:#92400e;border-color:#fde68a;' : ''}">${order.status === 'Cancelled' ? 'CANCELLED (VOID)' : order.isPaid ? 'PAID' : (order.paymentMethod === 'Cash on Delivery' ? 'COD PENDING' : 'UNPAID')}</span></div>
              </div>
            </div>

            <div class="address-grid">
              <div class="address-card">
                <h4>Billed To (Customer)</h4>
                <strong>${order.shippingAddress.fullName || order.user.name}</strong><br/>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
                ${order.shippingAddress.country}<br/>
                ${order.user.email ? 'Email: ' + order.user.email + '<br/>' : ''}
                ${(order.shippingAddress.phone || order.user.phone) ? 'Phone: ' + (order.shippingAddress.phone || order.user.phone) : ''}
              </div>
              <div class="address-card">
                <h4>Shipped To (Delivery Destination)</h4>
                <strong>${order.shippingAddress.fullName || order.user.name}</strong><br/>
                ${order.shippingAddress.address}<br/>
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
                ${order.shippingAddress.country}<br/>
                Logistics: ${order.carrier || 'Express Courier (Insured Delivery)'}
              </div>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 30px; text-align: center;">#</th>
                  <th>Item Description</th>
                  <th style="width: 70px; text-align: center;">HSN</th>
                  <th style="width: 40px; text-align: center;">Qty</th>
                  <th style="width: 80px; text-align: right;">Unit Rate</th>
                  <th style="width: 80px; text-align: right;">Taxable</th>
                  <th style="width: 80px; text-align: right;">GST (3%)</th>
                  <th style="width: 90px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${order.orderItems.map((item, i) => {
                  const gross = item.price * item.qty;
                  const taxVal = Math.round((gross / 1.03) * 100) / 100;
                  const gstVal = Math.round((gross - taxVal) * 100) / 100;
                  return `
                    <tr>
                      <td style="text-align: center; color: #6b7280;">${i + 1}</td>
                      <td>
                        <strong>${item.name}</strong><br/>
                        <span style="font-size: 10px; color: #6b7280;">SKU: SOV-${item.product.toString().slice(-6).toUpperCase()} • 18K PVD Gold Plating</span>
                      </td>
                      <td style="text-align: center; font-family: monospace;">7117</td>
                      <td style="text-align: center; font-weight: bold;">${item.qty}</td>
                      <td style="text-align: right; font-family: monospace;">₹${item.price.toLocaleString('en-IN')}</td>
                      <td style="text-align: right; font-family: monospace;">₹${taxVal.toLocaleString('en-IN')}</td>
                      <td style="text-align: right; font-family: monospace;">₹${gstVal.toLocaleString('en-IN')}</td>
                      <td style="text-align: right; font-weight: bold; font-family: monospace;">₹${gross.toLocaleString('en-IN')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="summary-grid">
              <div style="font-size: 10px; color: #4b5563;">
                <p><strong>Declaration & Returns:</strong></p>
                <p>1. Anti-tarnish, waterproof, certified 18K PVD gold plating.</p>
                <p>2. 7-Day hassle-free returns & exchange on unworn items with tag.</p>
                <p>3. Tax payable under reverse charge: No.</p>
                <p style="margin-top: 6px; font-style: italic;">Computer generated Tax Invoice under Rule 48 of CGST Rules, 2017.</p>
              </div>
              <div>
                <div class="total-row"><span>Items Subtotal:</span><span>₹${order.orderItems.reduce((acc, it) => acc + (it.price * it.qty), 0).toLocaleString('en-IN')}</span></div>
                ${order.discountPrice > 0 ? `<div class="total-row" style="color: #047857;"><span>Discount:</span><span>- ₹${order.discountPrice.toLocaleString('en-IN')}</span></div>` : ''}
                <div class="total-row"><span>Shipping:</span><span>${order.shippingPrice > 0 ? '₹' + order.shippingPrice.toLocaleString('en-IN') : 'FREE'}</span></div>
                <div class="total-row" style="color: #6b7280; font-size: 11px;"><span>GST 3% (Included):</span><span>₹${totalGst.toLocaleString('en-IN')}</span></div>
                <div class="total-row grand-total"><span>Grand Total:</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
              </div>
            </div>

            <div class="footer">
              <div>SOVRA JEWELLERY • UDAIPUR • WWW.SOVRA.IN</div>
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
