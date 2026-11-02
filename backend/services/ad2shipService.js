/**
 * Ad2Ship Logistics Service
 * Senior-engineered integration with Ad2Ship courier aggregation API.
 * Handles rate calculation, order booking, courier assignment, label/manifest generation, and tracking.
 */

const getApiConfig = () => {
  const endpoint = (process.env.AD2SHIP_API_ENDPOINT || 'https://pro.ad2ship.com/api/').replace(/\/+$/, '') + '/';
  const apiKey = process.env.AD2SHIP_API_KEY || '';
  if (!apiKey) {
    throw new Error('AD2SHIP_API_KEY is not configured in environment variables.');
  }
  return { endpoint, apiKey };
};

/**
 * Returns default or configured pickup warehouse address details.
 * Can be overridden in admin dashboard or .env.
 */
const getPickupAddress = (custom = {}) => {
  return {
    WarehouseName: custom.warehouseName || process.env.AD2SHIP_PICKUP_WAREHOUSE_NAME || 'Miraan Collections',
    ContactName: custom.contactName || process.env.AD2SHIP_PICKUP_CONTACT_NAME || 'Saurabh Jain',
    AddressLine1: custom.addressLine1 || process.env.AD2SHIP_PICKUP_ADDRESS_LINE1 || '23, Pulla',
    AddressLine2: custom.addressLine2 || process.env.AD2SHIP_PICKUP_ADDRESS_LINE2 || 'Beside Platinum Square, RK Circle',
    City: custom.city || process.env.AD2SHIP_PICKUP_CITY || 'Udaipur',
    State: custom.state || process.env.AD2SHIP_PICKUP_STATE || 'Rajasthan',
    Pincode: String(custom.pincode || process.env.AD2SHIP_PICKUP_PINCODE || '313001').replace(/\D/g, ''),
    Contact: String(custom.contact || process.env.AD2SHIP_PICKUP_CONTACT || '9560681117').replace(/\D/g, ''),
    Email: custom.email || process.env.AD2SHIP_PICKUP_EMAIL || 'support@sovra.in',
  };
};

/**
 * Helper to make robust, timeout-controlled JSON POST requests to Ad2Ship
 */
async function ad2shipRequest(path, payload, timeoutMs = 15000) {
  const { endpoint, apiKey } = getApiConfig();
  const url = `${endpoint}${path.replace(/^\/+/, '')}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const requestBody = {
    ApiKey: apiKey,
    ...payload,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timer);

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Ad2Ship returned non-JSON response (HTTP ${response.status}): ${text.slice(0, 200)}`);
    }

    if (!response.ok) {
      const errMsg = (data && (data.message || data.error)) || `HTTP ${response.status}`;
      throw new Error(`Ad2Ship API error (${path}): ${errMsg}`);
    }

    return data;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error(`Ad2Ship API request timed out after ${timeoutMs}ms for ${path}`);
    }
    throw err;
  }
}

/**
 * Calculate shipping rates from courier partners for given package specs and pincodes
 */
async function calculateRates({
  pickupPincode,
  deliveryPincode,
  orderType = 'forward',
  paymentType = 'prepaid',
  weight = 0.5,
  length = 10,
  breadth = 10,
  height = 5,
  invoiceAmount = 1000,
}) {
  const defaultPickup = getPickupAddress();
  const fromPin = parseInt(String(pickupPincode || defaultPickup.Pincode).replace(/\D/g, ''), 10);
  const toPin = parseInt(String(deliveryPincode).replace(/\D/g, ''), 10);

  if (!toPin || isNaN(toPin)) {
    throw new Error('Valid delivery pincode is required for rate calculation.');
  }

  const payload = {
    PickupPincode: fromPin,
    DeliveryPincode: toPin,
    OrderType: orderType.toLowerCase(),
    PaymentType: paymentType.toLowerCase(),
    Weight: Number(weight) || 0.5,
    Length: Number(length) || 10,
    Breadth: Number(breadth) || 10,
    Height: Number(height) || 5,
    InvoiceAmount: Number(invoiceAmount) || 0,
  };

  const response = await ad2shipRequest('rate-calculator', payload);

  if (response.status === false) {
    throw new Error(response.message || 'Pincode not serviceable or rate calculation failed.');
  }

  return response.data || response;
}

/**
 * Format a date object/string to Ad2Ship format: "YYYY-MM-DD HH:mm:ss"
 */
function formatAd2ShipDate(d = new Date()) {
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  const YYYY = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const DD = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${YYYY}-${MM}-${DD} ${hh}:${mm}:${ss}`;
}

/**
 * Create an order in Ad2Ship system
 */
async function createOrder({
  orderNumber,
  orderType = 'forward',
  paymentType = 'prepaid',
  orderDate,
  weight = 0.5,
  length = 10,
  breadth = 10,
  height = 5,
  invoiceAmount,
  collectableAmount = 0,
  shippingAddress,
  billingAddress,
  pickupAddress,
  products = [],
  discount = 0,
  shippingCharge = 0,
}) {
  const pickup = getPickupAddress(pickupAddress);

  const cleanPhone = (val, fallback = '9999999999') => {
    const digits = String(val || '').replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : fallback;
  };

  const shipAddr = {
    CustomerName: shippingAddress.fullName || shippingAddress.name || 'Customer',
    AddressLine1: shippingAddress.address || 'Address Line 1',
    AddressLine2: shippingAddress.address2 || shippingAddress.city || '',
    City: shippingAddress.city || '',
    State: shippingAddress.state || '',
    Pincode: String(shippingAddress.postalCode || shippingAddress.pincode || '').replace(/\D/g, ''),
    Contact: cleanPhone(shippingAddress.phone),
    Email: shippingAddress.email || '',
  };

  const billAddr = billingAddress
    ? {
        CustomerName: billingAddress.fullName || shipAddr.CustomerName,
        AddressLine1: billingAddress.address || shipAddr.AddressLine1,
        AddressLine2: billingAddress.address2 || shipAddr.AddressLine2,
        City: billingAddress.city || shipAddr.City,
        State: billingAddress.state || shipAddr.State,
        Pincode: String(billingAddress.postalCode || shipAddr.Pincode).replace(/\D/g, ''),
        Contact: cleanPhone(billingAddress.phone || shipAddr.Contact),
        Email: billingAddress.email || shipAddr.Email,
      }
    : shipAddr;

  const productDetails = (products && products.length > 0)
    ? products.map((item, idx) => ({
        Name: String(item.name || `Item ${idx + 1}`).slice(0, 100),
        SKU: String(item.sku || item.product || `SKU-${idx + 1}`).slice(0, 50),
        QTY: String(item.qty || item.quantity || 1),
        Amount: String(Number(item.price || 0).toFixed(2)),
      }))
    : [
        {
          Name: 'Jewellery Item',
          SKU: 'SOVRA-JW',
          QTY: '1',
          Amount: String(Number(invoiceAmount || 0).toFixed(2)),
        },
      ];

  const isCod = paymentType.toLowerCase() === 'cod';
  const finalCollectable = isCod ? Number(collectableAmount || invoiceAmount || 0) : 0;

  const orderPayload = {
    OrderNumber: String(orderNumber),
    OrderType: orderType.toLowerCase(),
    PaymentType: isCod ? 'cod' : 'prepaid',
    OrderDate: formatAd2ShipDate(orderDate),
    Weight: Number(weight) || 0.5,
    Length: Number(length) || 10,
    Breadth: Number(breadth) || 10,
    Height: Number(height) || 5,
    InvoiceAmount: Number(invoiceAmount) || 0,
    CollectableAmount: finalCollectable,
    Addresses: {
      ShippingAddress: shipAddr,
      BillingAddress: billAddr,
      PickupAddress: pickup,
    },
    ProductDetails: productDetails,
    EwayBill: '',
    GstNumber: '',
    ShippingCharge: String(shippingCharge || 0),
    CodCharge: isCod ? '0' : '0',
    Discount: String(discount || 0),
  };

  const response = await ad2shipRequest('order-create', {
    OrderDetails: [orderPayload],
  });

  // Response can be array of results: [ { order_id, status, message } ]
  const result = Array.isArray(response) ? response[0] : response;

  if (!result || result.status === false || !result.order_id) {
    throw new Error((result && result.message) || 'Failed to create order on Ad2Ship.');
  }

  return result;
}

/**
 * Assign courier partner and generate AWB for an order
 */
async function shipOrder({ orderId, courierPartnerId }) {
  if (!orderId) {
    throw new Error('Ad2Ship orderId is required to ship an order.');
  }
  if (!courierPartnerId) {
    throw new Error('CourierPartnerId is required to ship an order.');
  }

  const response = await ad2shipRequest('order-ship', {
    OrderID: Number(orderId),
    CourierPartnerId: Number(courierPartnerId),
  });

  if (response.status === false) {
    throw new Error(response.message || 'Order shipment failed on Ad2Ship.');
  }

  return response;
}

/**
 * Generate and retrieve shipping label URL
 */
async function generateLabel({ orderId }) {
  if (!orderId) throw new Error('Ad2Ship orderId is required for label generation.');
  const response = await ad2shipRequest('generate-label', {
    OrderID: Number(orderId),
  });
  if (response.status === false) {
    throw new Error(response.message || 'Unable to generate label.');
  }
  return response;
}

/**
 * Generate manifest
 */
async function generateManifest({ orderId }) {
  if (!orderId) throw new Error('Ad2Ship orderId is required for manifest generation.');
  const response = await ad2shipRequest('generate-manifest', {
    OrderID: Number(orderId),
  });
  if (response.status === false) {
    throw new Error(response.message || 'Unable to generate manifest.');
  }
  return response;
}

/**
 * Generate tax invoice
 */
async function generateInvoice({ orderId }) {
  if (!orderId) throw new Error('Ad2Ship orderId is required for invoice generation.');
  const response = await ad2shipRequest('generate-invoice', {
    OrderID: Number(orderId),
  });
  if (response.status === false) {
    throw new Error(response.message || 'Unable to generate invoice.');
  }
  return response;
}

/**
 * Track an order by AWB Number
 */
async function trackOrder({ awbNumber }) {
  if (!awbNumber) throw new Error('AWB number is required to track an order.');
  const response = await ad2shipRequest('order-track', {
    AWBNumber: String(awbNumber).trim(),
  });
  return response;
}

module.exports = {
  getPickupAddress,
  calculateRates,
  createOrder,
  shipOrder,
  generateLabel,
  generateManifest,
  generateInvoice,
  trackOrder,
};

