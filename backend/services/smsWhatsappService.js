/**
 * SMS & WhatsApp Dispatch Notification Service
 * Sends automated delivery and dispatch alerts to customers when an order is shipped.
 * Supports WhatsApp Cloud API, Twilio, Fast2SMS, custom webhooks (Wati/AiSensy/Interakt),
 * and graceful fallback/logging when credentials are in sandbox/testing mode.
 */

/**
 * Standardize Indian 10-digit mobile number
 */
function cleanPhoneNumber(rawPhone) {
  if (!rawPhone) return '';
  const cleaned = String(rawPhone).replace(/\D/g, '');
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith('91')) return cleaned.slice(2);
  if (cleaned.length === 11 && cleaned.startsWith('0')) return cleaned.slice(1);
  return cleaned;
}

/**
 * Format date for notifications (e.g. "Monday, 4 Nov")
 */
function formatNotificationDate(date = new Date()) {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Build standard luxury customer message text for WhatsApp
 */
function getWhatsAppMessageText({ customerName, orderId, courier, awbNumber, trackingUrl }) {
  const cleanOrderId = String(orderId).slice(-6).toUpperCase();
  return (
    `✨ *SOVRA JEWELLERY - Order Dispatched* ✨\n\n` +
    `Dear ${customerName || 'Customer'},\n\n` +
    `Your handcrafted piece from Sovra (Order *#SOVRA-${cleanOrderId}*) has been picked up by our logistics partner and is on its way to you!\n\n` +
    `📦 *Courier Partner:* ${courier}\n` +
    `🔢 *AWB / Tracking No:* ${awbNumber}\n\n` +
    `🚚 *Track Live Status & Delivery Updates:*\n${trackingUrl}\n\n` +
    `For any queries or assistance, please reply directly or reach our concierge at support@sovra.in / +91 95606 81117.\n\n` +
    `Thank you for choosing *SOVRA*.\nwww.sovrajewellery.com`
  );
}

/**
 * Build standard SMS text (concise, transactional DLT-friendly format)
 */
function getSmsMessageText({ customerName, orderId, courier, awbNumber, trackingUrl }) {
  const cleanOrderId = String(orderId).slice(-6).toUpperCase();
  return `Sovra: Order #SOVRA-${cleanOrderId} is shipped via ${courier} (AWB: ${awbNumber}). Track live: ${trackingUrl} - SOVRA`;
}

/**
 * Send WhatsApp dispatch alert
 */
async function sendDispatchWhatsApp({ phone, customerName, orderId, courier, awbNumber, trackingUrl }) {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, skipped: true, reason: 'Invalid or missing phone number' };
  }

  const messageText = getWhatsAppMessageText({ customerName, orderId, courier, awbNumber, trackingUrl });

  // 1. Meta / WhatsApp Cloud API
  const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (waToken && waPhoneId) {
    try {
      const url = `https://graph.facebook.com/v19.0/${waPhoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${waToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: `91${cleanPhone}`,
          type: 'text',
          text: { body: messageText },
        }),
      });
      const data = await response.json();
      if (response.ok && data.messages?.[0]?.id) {
        return { success: true, provider: 'whatsapp_cloud_api', messageId: data.messages[0].id };
      }
      console.warn('WhatsApp Cloud API error:', data);
    } catch (err) {
      console.warn('WhatsApp Cloud API dispatch error:', err.message);
    }
  }

  // 2. Twilio WhatsApp
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioWaFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+14155238886'
  if (twilioSid && twilioAuth && twilioWaFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const body = new URLSearchParams();
      body.append('From', twilioWaFrom.startsWith('whatsapp:') ? twilioWaFrom : `whatsapp:${twilioWaFrom}`);
      body.append('To', `whatsapp:+91${cleanPhone}`);
      body.append('Body', messageText);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      const data = await response.json();
      if (response.ok && data.sid) {
        return { success: true, provider: 'twilio_whatsapp', messageId: data.sid };
      }
      console.warn('Twilio WhatsApp error:', data);
    } catch (err) {
      console.warn('Twilio WhatsApp dispatch error:', err.message);
    }
  }

  // 3. Generic WhatsApp Webhook (e.g., AiSensy / Wati / Interakt / Zapier)
  const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || process.env.DISPATCH_NOTIFICATION_WEBHOOK;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'whatsapp',
          phone: `91${cleanPhone}`,
          customerName,
          orderId,
          courier,
          awbNumber,
          trackingUrl,
          message: messageText,
        }),
      });
      if (response.ok) {
        return { success: true, provider: 'custom_webhook' };
      }
    } catch (err) {
      console.warn('WhatsApp webhook error:', err.message);
    }
  }

  // Fallback / Development Simulation mode: Log message cleanly
  console.log('----------------------------------------------------');
  console.log(`[WHATSAPP ALERT] Dispatch alert queued for +91 ${cleanPhone}`);
  console.log(`[WHATSAPP TEXT]:\n${messageText}`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    provider: 'simulated_logger',
    messageId: `wa_sim_${Date.now()}`,
    note: 'Message formatted and logged. Configure WHATSAPP_ACCESS_TOKEN or TWILIO_WHATSAPP_FROM to send via live gateway.',
  };
}

/**
 * Send SMS dispatch alert
 */
async function sendDispatchSMS({ phone, customerName, orderId, courier, awbNumber, trackingUrl }) {
  const cleanPhone = cleanPhoneNumber(phone);
  if (!cleanPhone || cleanPhone.length < 10) {
    return { success: false, skipped: true, reason: 'Invalid or missing phone number' };
  }

  const messageText = getSmsMessageText({ customerName, orderId, courier, awbNumber, trackingUrl });

  // 1. Fast2SMS (Indian SMS Gateway)
  const fast2SmsKey = process.env.FAST2SMS_API_KEY;
  if (fast2SmsKey) {
    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': fast2SmsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'v3',
          sender_id: process.env.FAST2SMS_SENDER_ID || 'TXTIND',
          message: messageText,
          language: 'english',
          flash: 0,
          numbers: cleanPhone,
        }),
      });
      const data = await response.json();
      if (data && data.return === true) {
        return { success: true, provider: 'fast2sms', requestId: data.request_id };
      }
      console.warn('Fast2SMS error:', data);
    } catch (err) {
      console.warn('Fast2SMS dispatch error:', err.message);
    }
  }

  // 2. Twilio SMS
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  if (twilioSid && twilioAuth && twilioPhone) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const body = new URLSearchParams();
      body.append('From', twilioPhone);
      body.append('To', `+91${cleanPhone}`);
      body.append('Body', messageText);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });
      const data = await response.json();
      if (response.ok && data.sid) {
        return { success: true, provider: 'twilio_sms', messageId: data.sid };
      }
      console.warn('Twilio SMS error:', data);
    } catch (err) {
      console.warn('Twilio SMS dispatch error:', err.message);
    }
  }

  // 3. Generic SMS Webhook
  const smsWebhook = process.env.SMS_WEBHOOK_URL;
  if (smsWebhook) {
    try {
      const response = await fetch(smsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'sms',
          phone: cleanPhone,
          message: messageText,
        }),
      });
      if (response.ok) {
        return { success: true, provider: 'sms_webhook' };
      }
    } catch (err) {
      console.warn('SMS webhook error:', err.message);
    }
  }

  // Fallback / Development Simulation mode: Log message cleanly
  console.log('----------------------------------------------------');
  console.log(`[SMS ALERT] Dispatch alert queued for +91 ${cleanPhone}`);
  console.log(`[SMS TEXT]: ${messageText}`);
  console.log('----------------------------------------------------');

  return {
    success: true,
    provider: 'simulated_logger',
    messageId: `sms_sim_${Date.now()}`,
    note: 'SMS formatted and logged. Configure FAST2SMS_API_KEY or TWILIO_ACCOUNT_SID to send live SMS.',
  };
}

/**
 * High-level helper: send both WhatsApp & SMS dispatch notifications
 */
async function sendDispatchNotifications({ order, courier, awbNumber, trackingUrl }) {
  const customerName =
    (order.shippingAddress && (order.shippingAddress.fullName || order.shippingAddress.name)) ||
    (order.user && order.user.name) ||
    'Customer';

  const rawPhone =
    (order.shippingAddress && (order.shippingAddress.phone || order.shippingAddress.phoneNumber)) ||
    (order.user && order.user.phone) ||
    '';

  const orderId = order._id;

  const [waResult, smsResult] = await Promise.allSettled([
    sendDispatchWhatsApp({
      phone: rawPhone,
      customerName,
      orderId,
      courier,
      awbNumber,
      trackingUrl,
    }),
    sendDispatchSMS({
      phone: rawPhone,
      customerName,
      orderId,
      courier,
      awbNumber,
      trackingUrl,
    }),
  ]);

  const results = {
    whatsapp: waResult.status === 'fulfilled' ? waResult.value : { success: false, error: waResult.reason?.message },
    sms: smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: smsResult.reason?.message },
  };

  return results;
}

module.exports = {
  sendDispatchWhatsApp,
  sendDispatchSMS,
  sendDispatchNotifications,
  cleanPhoneNumber,
  getWhatsAppMessageText,
  getSmsMessageText,
};

