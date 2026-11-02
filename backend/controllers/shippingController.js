const { sendEmail, getOrderShippedTemplate } = require('../utils/sendEmail');
const smsWhatsappService = require('../services/smsWhatsappService');
/**
 * Calculate packaging weight and dimensions automatically from order items
 */
async function calculatePackageDimensions(order) {
  let sumWeight = 0;
  let maxL = 10;
  let maxB = 10;
  let sumH = 0;

  if (order && order.orderItems && order.orderItems.length > 0) {
    try {
      await order.populate('orderItems.product');
      for (const item of order.orderItems) {
        const prod = item.product || {};
        const qty = Number(item.qty) || 1;
        const w = Number(prod.shippingWeight) || 0.2;
        const l = Number(prod.shippingLength) || 10;
        const b = Number(prod.shippingBreadth) || 10;
        const h = Number(prod.shippingHeight) || 5;

        sumWeight += w * qty;
        maxL = Math.max(maxL, l);
        maxB = Math.max(maxB, b);
        sumH += h * Math.min(qty, 4);
      }
    } catch (err) {
      console.warn('Auto dimension calculation warning:', err.message);
    }
  }

  return {
    weight: sumWeight > 0 ? Number(sumWeight.toFixed(2)) : 0.5,
    length: Math.max(10, maxL),
    breadth: Math.max(10, maxB),
    height: Math.max(5, sumH),
  };
}

const Order = require('../models/orderModel');
const ad2shipService = require('../services/ad2shipService');

/**
 * @desc    Calculate courier rates for a specific order
 * @route   POST /api/shipping/order/:id/rates
 * @access  Private/Admin
 */
const getOrderRates = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const autoDims = await calculatePackageDimensions(order);
    const weight = req.body.weight !== undefined ? Number(req.body.weight) : autoDims.weight;
    const length = req.body.length !== undefined ? Number(req.body.length) : autoDims.length;
    const breadth = req.body.breadth !== undefined ? Number(req.body.breadth) : autoDims.breadth;
    const height = req.body.height !== undefined ? Number(req.body.height) : autoDims.height;
    const { pickupPincode } = req.body;

    const deliveryPincode = order.shippingAddress && order.shippingAddress.postalCode;
    if (!deliveryPincode) {
      return res.status(400).json({ message: 'Order does not have a valid delivery pincode.' });
    }

    const paymentType = order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD' ? 'cod' : 'prepaid';
    const invoiceAmount = order.totalPrice || 1000;

    const rateData = await ad2shipService.calculateRates({
      pickupPincode,
      deliveryPincode,
      orderType: 'forward',
      paymentType,
      weight,
      length,
      breadth,
      height,
      invoiceAmount,
    });

    res.json({
      success: true,
      data: rateData,
      dimensions: { weight, length, breadth, height },
    });
  } catch (error) {
    console.error('Ad2Ship rate calculation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to calculate shipping rates.',
    });
  }
};

/**
 * @desc    Ship an order with Ad2Ship (create order if needed, assign courier, generate AWB & label)
 * @route   POST /api/shipping/order/:id/ship
 * @access  Private/Admin
 */
const shipOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cannot ship a cancelled order.' });
    }

    const autoDims = await calculatePackageDimensions(order);
    const weight = req.body.weight !== undefined ? Number(req.body.weight) : autoDims.weight;
    const length = req.body.length !== undefined ? Number(req.body.length) : autoDims.length;
    const breadth = req.body.breadth !== undefined ? Number(req.body.breadth) : autoDims.breadth;
    const height = req.body.height !== undefined ? Number(req.body.height) : autoDims.height;
    const {
      courierPartnerId,
      courierName,
      pickupAddress,
    } = req.body;

    if (!courierPartnerId) {
      return res.status(400).json({ message: 'CourierPartnerId is required to ship an order.' });
    }

    const isCod = order.paymentMethod === 'Cash on Delivery' || order.paymentMethod === 'COD';
    const paymentType = isCod ? 'cod' : 'prepaid';
    const collectableAmount = isCod ? order.totalPrice : 0;

    // Step 1: Create Order in Ad2Ship if not already created
    let ad2shipOrderId = order.ad2ship && order.ad2ship.orderId;

    if (!ad2shipOrderId) {
      // Use clean order number format like #SOVRA-10023
      const orderNumber = `SOVRA-${order._id.toString().slice(-6).toUpperCase()}`;

      const createdAd2ShipOrder = await ad2shipService.createOrder({
        orderNumber,
        orderType: 'forward',
        paymentType,
        orderDate: order.createdAt || new Date(),
        weight,
        length,
        breadth,
        height,
        invoiceAmount: order.totalPrice,
        collectableAmount,
        shippingAddress: {
          fullName: order.shippingAddress.fullName || (order.user && order.user.name) || 'Customer',
          address: order.shippingAddress.address,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          postalCode: order.shippingAddress.postalCode,
          phone: order.shippingAddress.phone || (order.user && order.user.phone) || '9999999999',
          email: (order.user && order.user.email) || '',
        },
        billingAddress: null,
        pickupAddress,
        products: order.orderItems.map((item) => ({
          name: item.name,
          sku: item.product ? item.product.toString() : 'SKU-SOVRA',
          qty: item.qty,
          price: item.price,
        })),
        discount: order.discountPrice || 0,
        shippingCharge: order.shippingPrice || 0,
      });

      ad2shipOrderId = createdAd2ShipOrder.order_id;
      if (!order.ad2ship) order.ad2ship = {};
      order.ad2ship.orderId = ad2shipOrderId;
      order.ad2ship.orderNumber = orderNumber;
    }

    // Step 2: Book / Ship with selected courier partner
    const shipResult = await ad2shipService.shipOrder({
      orderId: ad2shipOrderId,
      courierPartnerId,
    });

    const shipmentData = shipResult.data || {};
    const awbNumber = shipmentData.awb_number || '';
    const finalCourierName = courierName || shipmentData.courier || shipmentData.courier_keyword || 'Ad2Ship Courier';

    // Step 3: Attempt label generation immediately
    let labelUrl = '';
    try {
      const labelRes = await ad2shipService.generateLabel({ orderId: ad2shipOrderId });
      labelUrl = (labelRes && (labelRes.label || labelRes.data?.label)) || '';
    } catch (labelErr) {
      console.warn('Ad2Ship immediate label generation warning:', labelErr.message);
    }

    // Step 4: Update Order in Database
    order.status = 'Shipped';
    order.carrier = finalCourierName;
    order.trackingNumber = awbNumber;

    if (!order.ad2ship) order.ad2ship = {};
    order.ad2ship.orderId = ad2shipOrderId;
    order.ad2ship.awbNumber = awbNumber;
    order.ad2ship.courierName = finalCourierName;
    order.ad2ship.courierPartnerId = Number(courierPartnerId);
    order.ad2ship.paymentType = paymentType;
    order.ad2ship.totalCharges = Number(shipResult.total_charges) || 0;
    order.ad2ship.shippingCharges = Number(shipResult.shipping_charges) || 0;
    order.ad2ship.codCharges = Number(shipResult.cod_charges) || 0;
    order.ad2ship.routeCode = shipmentData.route_code || '';
    order.ad2ship.labelUrl = labelUrl || order.ad2ship.labelUrl || '';
    order.ad2ship.shippedAt = new Date();
    order.ad2ship.shipmentStatus = 'Shipped';
    order.ad2ship.weight = weight;
    order.ad2ship.length = length;
    order.ad2ship.breadth = breadth;
    order.ad2ship.height = height;

    await order.save();

    // Automated luxury shipment email notification to customer
    const frontendUrl = process.env.FRONTEND_URL || 'https://sovrajewellery.com';
    const trackingUrl = `${frontendUrl.replace(/\/+$/, '')}/order/${order._id}`;

    try {
      const recipientEmail = (order.user && order.user.email) || (order.shippingAddress && order.shippingAddress.email);
      if (recipientEmail) {
        await sendEmail({
          email: recipientEmail,
          subject: `Your Sovra Order #${order._id.toString().slice(-6).toUpperCase()} Has Shipped (${finalCourierName})`,
          html: getOrderShippedTemplate({
            order,
            courier: finalCourierName,
            awbNumber,
            trackingUrl,
          }),
        });
        console.log(`Automated shipment notification dispatched to ${recipientEmail}`);
      }
    } catch (emailErr) {
      console.warn('Automated shipment email warning:', emailErr.message);
    }

    // Automated luxury WhatsApp & SMS dispatch notifications to customer
    try {
      const notifyResult = await smsWhatsappService.sendDispatchNotifications({
        order,
        courier: finalCourierName,
        awbNumber,
        trackingUrl,
      });

      if (!order.ad2ship.notifications) {
        order.ad2ship.notifications = {};
      }
      if (notifyResult.sms && notifyResult.sms.success) {
        order.ad2ship.notifications.smsSent = true;
        order.ad2ship.notifications.smsSentAt = new Date();
        order.ad2ship.notifications.smsMessageId = notifyResult.sms.messageId || notifyResult.sms.requestId || '';
      }
      if (notifyResult.whatsapp && notifyResult.whatsapp.success) {
        order.ad2ship.notifications.whatsappSent = true;
        order.ad2ship.notifications.whatsappSentAt = new Date();
        order.ad2ship.notifications.whatsappMessageId = notifyResult.whatsapp.messageId || '';
      }
      await order.save();
      console.log('Automated WhatsApp & SMS dispatch notifications processed successfully');
    } catch (notifyErr) {
      console.warn('Automated WhatsApp/SMS dispatch notification warning:', notifyErr.message);
    }

    res.json({
      success: true,
      message: 'Order shipped successfully with Ad2Ship.',
      order,
      shipment: {
        ad2shipOrderId,
        awbNumber,
        courier: finalCourierName,
        labelUrl,
        charges: shipResult.total_charges,
      },
    });
  } catch (error) {
    console.error('Ship order error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to ship order with Ad2Ship.',
    });
  }
};

/**
 * @desc    Fetch/generate printable shipping label
 * @route   GET /api/shipping/order/:id/label
 * @access  Private/Admin
 */
const getOrderLabel = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderId = order.ad2ship && order.ad2ship.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'This order has not been registered with Ad2Ship yet.' });
    }

    // Check if label is already cached
    if (order.ad2ship.labelUrl) {
      return res.json({ success: true, labelUrl: order.ad2ship.labelUrl });
    }

    const response = await ad2shipService.generateLabel({ orderId });
    const labelUrl = response.label || (response.data && response.data.label) || '';

    if (labelUrl) {
      order.ad2ship.labelUrl = labelUrl;
      await order.save();
    }

    res.json({
      success: true,
      labelUrl,
      message: response.message || 'Label generated successfully.',
    });
  } catch (error) {
    console.error('Get label error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to generate shipping label.',
    });
  }
};

/**
 * @desc    Generate pickup manifest
 * @route   POST /api/shipping/order/:id/manifest
 * @access  Private/Admin
 */
const getOrderManifest = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderId = order.ad2ship && order.ad2ship.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'This order has not been booked with Ad2Ship.' });
    }

    const response = await ad2shipService.generateManifest({ orderId });

    if (order.ad2ship) {
      order.ad2ship.manifestGenerated = true;
      await order.save();
    }

    res.json({
      success: true,
      message: response.message || 'Manifest generated successfully.',
      data: response,
    });
  } catch (error) {
    console.error('Manifest generation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to generate manifest.',
    });
  }
};

/**
 * @desc    Generate Ad2Ship Invoice
 * @route   GET /api/shipping/order/:id/invoice
 * @access  Private/Admin
 */
const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderId = order.ad2ship && order.ad2ship.orderId;
    if (!orderId) {
      return res.status(400).json({ message: 'Order not booked with Ad2Ship.' });
    }

    if (order.ad2ship.invoiceUrl) {
      return res.json({ success: true, invoiceUrl: order.ad2ship.invoiceUrl });
    }

    const response = await ad2shipService.generateInvoice({ orderId });
    const invoiceUrl = response.invoice || (response.data && response.data.invoice) || '';

    if (invoiceUrl) {
      order.ad2ship.invoiceUrl = invoiceUrl;
      await order.save();
    }

    res.json({
      success: true,
      invoiceUrl,
      message: response.message || 'Invoice generated.',
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to generate invoice.',
    });
  }
};

/**
 * @desc    Track order shipment by Order ID (accessible by order owner or admin)
 * @route   GET /api/shipping/order/:id/track
 * @access  Private
 */
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // IDOR Prevention: Only order owner or admin can track
    const orderUserId = order.user ? (order.user._id ? order.user._id.toString() : order.user.toString()) : null;
    if (orderUserId !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied: You are not authorized to track this order.' });
    }

    const awbNumber = (order.ad2ship && order.ad2ship.awbNumber) || order.trackingNumber;
    if (!awbNumber) {
      return res.status(400).json({
        success: false,
        message: 'No tracking / AWB number assigned to this order yet.',
      });
    }

    let trackingData;
    try {
      trackingData = await ad2shipService.trackOrder({ awbNumber });
    } catch (trackErr) {
      console.warn('Ad2Ship live tracking query warning:', trackErr.message);
      // Return cached history if available
      return res.json({
        success: true,
        cached: true,
        awbNumber,
        courier: order.carrier || order.ad2ship?.courierName,
        status: order.ad2ship?.shipmentStatus || order.status,
        history: order.ad2ship?.trackingHistory || [],
        message: 'Using cached tracking state.',
      });
    }

    // If Ad2Ship provides tracking scans / stages, update order record
    if (trackingData) {
      const scans = trackingData.scans || trackingData.data?.scans || trackingData.tracking_history || [];
      if (Array.isArray(scans) && scans.length > 0) {
        order.ad2ship.trackingHistory = scans.map((s) => ({
          statusCode: s.status_code || s.code || '',
          status: s.status || s.activity || '',
          statusDescription: s.status_description || s.details || '',
          location: s.location || '',
          eventDate: s.date || s.time || s.event_date || '',
          remarks: s.remarks || s.comment || '',
        }));
      }

      if (trackingData.status || trackingData.current_status) {
        order.ad2ship.shipmentStatus = trackingData.status || trackingData.current_status;
      }

      order.ad2ship.lastTrackedAt = new Date();
      await order.save();
    }

    res.json({
      success: true,
      awbNumber,
      courier: order.carrier || order.ad2ship?.courierName,
      status: order.ad2ship?.shipmentStatus || order.status,
      data: trackingData,
    });
  } catch (error) {
    console.error('Tracking endpoint error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error tracking shipment.',
    });
  }
};

/**
 * @desc    Get configured pickup warehouse info
 * @route   GET /api/shipping/config/pickup
 * @access  Private/Admin
 */
const getPickupConfig = async (req, res) => {
  try {
    const pickup = ad2shipService.getPickupAddress();
    res.json({ success: true, pickup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Calculate delivery date skipping Sundays
 */
function calculateDeliveryDate(businessDays = 3) {
  const d = new Date();
  let added = 0;
  while (added < businessDays) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) {
      added++;
    }
  }
  return d;
}

/**
 * Format delivery date for customer presentation (e.g., "Thursday, Nov 6")
 */
function formatEddDate(d) {
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Intelligent zone mapping based on Indian postal regions originating from Udaipur (313001)
 */
function getZoneFallbackEstimate(pincode) {
  const p = String(pincode);
  const firstDigit = p[0];
  const firstTwo = p.slice(0, 2);

  // Rajasthan (30 - 34)
  if (['30', '31', '32', '33', '34'].includes(firstTwo)) {
    return { minDays: 2, maxDays: 3, zone: 'Rajasthan (Intra-State)' };
  }
  // Delhi NCR / Haryana / Punjab (11 - 16)
  if (['11', '12', '13', '14', '15', '16'].includes(firstTwo)) {
    return { minDays: 3, maxDays: 4, zone: 'North Region (Delhi NCR / Punjab / Haryana)' };
  }
  // Gujarat / Western (36 - 39)
  if (['36', '37', '38', '39'].includes(firstTwo)) {
    return { minDays: 2, maxDays: 4, zone: 'West Region (Gujarat)' };
  }
  // Maharashtra / MP (40 - 49)
  if (firstDigit === '4') {
    return { minDays: 3, maxDays: 5, zone: 'West / Central Region (Maharashtra / MP)' };
  }
  // UP / Uttarakhand (20 - 28)
  if (firstDigit === '2') {
    return { minDays: 3, maxDays: 5, zone: 'North Region (UP / Uttarakhand)' };
  }
  // South Region: Karnataka, Telangana, AP, Tamil Nadu, Kerala (50 - 69)
  if (firstDigit === '5' || firstDigit === '6') {
    return { minDays: 4, maxDays: 6, zone: 'South Region' };
  }
  // East / North East (70 - 79)
  if (firstDigit === '7') {
    return { minDays: 5, maxDays: 7, zone: 'East & North East Region' };
  }
  // Bihar / Jharkhand (80 - 85)
  if (firstDigit === '8') {
    return { minDays: 4, maxDays: 6, zone: 'East Central Region' };
  }

  return { minDays: 4, maxDays: 6, zone: 'Rest of India' };
}

/**
 * @desc    Check pincode serviceability and calculate Estimated Delivery Date (EDD)
 * @route   POST /api/shipping/check-pincode
 * @access  Public (Guest & Registered Customers)
 */
const checkPincodeServiceability = async (req, res) => {
  try {
    const rawPincode = req.body.pincode;
    const cleanPin = String(rawPincode || '').replace(/\D/g, '');

    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        serviceable: false,
        message: 'Please enter a valid 6-digit Indian delivery pincode.',
      });
    }

    const defaultPickup = ad2shipService.getPickupAddress();
    const pickupPin = defaultPickup.Pincode || '313001';

    let isServiceable = false;
    let minDays = 4;
    let maxDays = 6;
    let partnersCount = 0;
    let fastestCourier = '';

    try {
      const rateData = await ad2shipService.calculateRates({
        pickupPincode: pickupPin,
        deliveryPincode: cleanPin,
        weight: 0.5,
        length: 10,
        breadth: 10,
        height: 5,
        orderType: 'forward',
        paymentType: 'prepaid',
      });

      const partners = rateData.partners || [];
      if (partners.length > 0) {
        isServiceable = true;
        partnersCount = partners.length;
        const validDays = partners
          .map((p) => Number(p.estimate_days))
          .filter((d) => !isNaN(d) && d > 0);

        if (validDays.length > 0) {
          minDays = Math.min(...validDays);
          maxDays = Math.max(...validDays);
        }

        const airCourier = partners.find((p) => String(p.mode).toLowerCase() === 'air');
        fastestCourier = (airCourier && (airCourier.display_name || airCourier.name)) || partners[0].display_name || partners[0].name;
      }
    } catch (apiErr) {
      const errMsg = apiErr.message || '';
      // If Ad2Ship explicitly confirms unserviceable
      if (errMsg.toLowerCase().includes('not serviceable')) {
        return res.json({
          success: true,
          serviceable: false,
          pincode: cleanPin,
          message: 'Delivery is currently unavailable to pincode ' + cleanPin + '.',
        });
      }

      // If network timeout or external API disruption, apply intelligent zone fallback
      console.warn('Ad2Ship live query fallback for pin', cleanPin, ':', errMsg);
      const fallback = getZoneFallbackEstimate(cleanPin);
      isServiceable = true;
      minDays = fallback.minDays;
      maxDays = fallback.maxDays;
      fastestCourier = 'Express Courier';
    }

    if (!isServiceable) {
      return res.json({
        success: true,
        serviceable: false,
        pincode: cleanPin,
        message: 'Delivery is currently unavailable to pincode ' + cleanPin + '.',
      });
    }

    const eddDate = calculateDeliveryDate(minDays);
    const formattedEdd = formatEddDate(eddDate);

    res.json({
      success: true,
      serviceable: true,
      pincode: cleanPin,
      estimatedDeliveryDate: formattedEdd,
      estimatedDays: `${minDays} - ${Math.max(minDays + 2, maxDays)} business days`,
      fastestCourier: fastestCourier || 'Express Air',
      couriersAvailable: partnersCount,
      freeDelivery: true,
      codAvailable: false,
      returnPolicy: 'Official Transit Exchange Protection',
      message: `Delivery by ${formattedEdd} | Free Express Shipping`,
    });
  } catch (error) {
    console.error('Check pincode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify pincode serviceability.',
    });
  }
};

/**
 * @desc    Lookup Indian postal pincode details (City, District, State)
 * @route   POST /api/shipping/lookup-pincode
 * @access  Public
 */
const lookupPincode = async (req, res) => {
  try {
    const rawPin = req.body.pincode;
    const cleanPin = String(rawPin || '').replace(/\D/g, '');

    if (!cleanPin || cleanPin.length !== 6 || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please enter a valid 6-digit Indian postal pincode.',
      });
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const postRes = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (postRes.ok) {
        const postData = await postRes.json();
        const entry = Array.isArray(postData) ? postData[0] : null;

        if (entry && entry.Status === 'Success' && Array.isArray(entry.PostOffice) && entry.PostOffice.length > 0) {
          const firstOffice = entry.PostOffice[0];
          const city = firstOffice.District || firstOffice.Block || firstOffice.Circle || firstOffice.Name;
          const state = firstOffice.State;
          const postOffices = entry.PostOffice.map(po => po.Name).slice(0, 8);

          return res.json({
            success: true,
            valid: true,
            pincode: cleanPin,
            city,
            district: firstOffice.District,
            state,
            postOffices,
            message: `Verified: ${city}, ${state}`,
          });
        } else {
          return res.status(404).json({
            success: false,
            valid: false,
            pincode: cleanPin,
            message: 'Invalid or non-existent Indian delivery pincode.',
          });
        }
      }
    } catch (fetchErr) {
      console.warn('India Post API error, falling back to zone mapping:', fetchErr.message);
    }

    // Fallback: If external India Post network is slow, apply internal zone heuristic
    const fallback = getZoneFallbackEstimate(cleanPin);
    if (fallback && fallback.cityHint) {
      return res.json({
        success: true,
        valid: true,
        pincode: cleanPin,
        city: fallback.cityHint,
        district: fallback.cityHint,
        state: fallback.zone,
        message: `Verified: ${fallback.cityHint}`,
      });
    }

    res.status(400).json({
      success: false,
      valid: false,
      message: 'Invalid delivery pincode.',
    });
  } catch (err) {
    console.error('Lookup pincode error:', err);
    res.status(500).json({ success: false, valid: false, message: 'Server error looking up pincode.' });
  }
};

module.exports = {
  getOrderRates,
  shipOrder,
  getOrderLabel,
  getOrderManifest,
  getOrderInvoice,
  trackOrder,
  getPickupConfig,
  checkPincodeServiceability,
  lookupPincode,
};

