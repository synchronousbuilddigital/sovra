const nodemailer = require('nodemailer');

/**
 * Strip HTML tags to produce a clean plain-text fallback
 * Ensures emails are multipart/alternative to satisfy spam filters (SpamAssassin, Gmail, Yahoo)
 */
const stripHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+\n/g, '\n\n')
    .trim();
};

/**
 * Send an email using Nodemailer via SMTP
 * @param {Object} options - Email options (email, subject, text, html)
 */
const sendEmail = async (options) => {
  const isCustomSmtp = Boolean(process.env.SMTP_HOST);

  const config = isCustomSmtp ? {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  } : {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  const transporter = nodemailer.createTransport(config);

  // Automatically ensure plain text counterpart exists for multipart/alternative
  const plainText = options.text || stripHtml(options.html);

  const mailOptions = {
    from: `"SOVRA Jewellery" <${process.env.EMAIL_USER}>`,
    to: options.email,
    replyTo: process.env.EMAIL_USER,
    subject: options.subject,
    text: plainText,
    html: options.html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
      ...(options.headers || {})
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    throw new Error('Email failed to send. Please check your configuration.');
  }
};

/**
 * Plain text version of OTP email
 */
const getOTPText = (otp, name, type = 'verification') => {
  const isReset = type === 'reset';
  const intro = isReset
    ? 'We received a request to reset your password for your SOVRA account.'
    : 'To verify your identity and protect your SOVRA account, please use the code below.';

  const action = isReset
    ? 'Enter this 6-digit code on the reset password screen to establish a new password.'
    : 'Enter this 6-digit code on the verification screen to activate your account.';

  return `SOVRA - Maison of Fine Jewellery
=============================================

Hello ${name || 'there'},

${intro}

${action}

YOUR ACCESS CODE: ${otp}

This code is valid for 10 minutes.

${isReset ? 'If you did not request a password reset, you can safely ignore this email. Your account remains secure.' : 'If you did not initiate this request, please disregard this email.'}

=============================================
Maison SOVRA
23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001
Official Website: https://sovrajewellery.com
`;
};

/**
 * HTML version of OTP email with strict email client compatibility
 */
const getOTPTemplate = (otp, name, type = 'verification') => {
  const isReset = type === 'reset';
  const title = isReset ? 'Password Reset Code' : 'Access Verification';
  const subtitle = isReset ? 'Account Recovery' : 'Maison of Fine Jewellery';
  const introMessage = isReset
    ? 'We received a request to reset the password for your SOVRA account. To set a new password, please enter the one-time verification code below.'
    : 'To ensure the security of your account and complete your verification, please use the unique access code provided below.';
  const disclaimer = isReset
    ? 'If you did not request a password reset, please ignore this email. Your current password remains active and secure.'
    : 'If you did not initiate this request, please disregard this correspondence.';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title} - SOVRA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Georgia', serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #eae6df; border-radius: 8px; overflow: hidden; padding: 45px 35px; color: #1a1a1a;">
          <tr>
            <td align="center" style="padding-bottom: 30px; border-bottom: 1px solid #f2ede4;">
              <h1 style="font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; font-size: 24px; margin: 0; color: #1a1a1a;">SOVRA</h1>
              <p style="font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: #8c7b68; margin: 8px 0 0 0;">${subtitle}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 0 25px 0;">
              <p style="font-size: 16px; font-style: italic; color: #333333; margin: 0 0 20px 0;">Hello ${name || 'there'},</p>
              <p style="font-size: 14px; line-height: 1.8; color: #555555; margin: 0 0 30px 0;">
                ${introMessage}
              </p>
              <div style="background-color: #fcfbf9; border: 1px solid #ece7df; border-radius: 6px; padding: 30px 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #8c7b68; display: block; margin-bottom: 12px; font-family: sans-serif; font-weight: 600;">Your 6-Digit Code</span>
                <span style="font-size: 38px; font-weight: 400; letter-spacing: 0.35em; color: #1a1a1a; font-family: 'Courier New', Courier, monospace; display: inline-block;">${otp}</span>
              </div>
              <p style="font-size: 12px; line-height: 1.7; color: #777777; text-align: center; margin: 25px 0 0 0;">
                This code is valid for <strong>10 minutes</strong>.<br />
                ${disclaimer}
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f2ede4; padding-top: 30px; text-align: center;">
              <p style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; font-family: sans-serif;">Maison Sovra</p>
              <div style="font-size: 11px; color: #aaaaaa; line-height: 1.6; font-family: sans-serif;">
                23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001<br />
                <a href="https://sovrajewellery.com" style="color: #8c7b68; text-decoration: none;">www.sovrajewellery.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const getNewsletterTemplate = (email) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to SOVRA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #eae6df; border-radius: 8px; padding: 45px 35px; color: #1a1a1a;">
          <tr>
            <td align="center" style="padding-bottom: 30px; border-bottom: 1px solid #f2ede4;">
              <h1 style="font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; font-size: 24px; margin: 0; color: #1a1a1a;">SOVRA</h1>
              <p style="font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: #8c7b68; margin: 8px 0 0 0;">The Inner Circle</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 0 25px 0;">
              <p style="font-size: 16px; font-style: italic; color: #333333; margin: 0 0 20px 0;">Welcome to the Inner Circle,</p>
              <p style="font-size: 14px; line-height: 1.8; color: #555555; margin: 0 0 30px 0;">
                You have successfully joined our exclusive collective. As a member of the Inner Circle, you will be the first to witness our limited archival releases, seasonal journals, and the radiance of the Aravalli hills.
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f2ede4; padding-top: 30px; text-align: center;">
              <p style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; font-family: sans-serif;">Maison Sovra</p>
              <div style="font-size: 11px; color: #aaaaaa; line-height: 1.6; font-family: sans-serif;">
                23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001<br />
                <a href="https://sovrajewellery.com" style="color: #8c7b68; text-decoration: none;">www.sovrajewellery.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const getOrderConfirmationTemplate = (order, user) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">${item.name} x ${item.qty}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - SOVRA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: 'Georgia', serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf9f6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border: 1px solid #eae6df; border-radius: 8px; padding: 45px 35px; color: #1a1a1a;">
          <tr>
            <td align="center" style="padding-bottom: 30px; border-bottom: 1px solid #f2ede4;">
              <h1 style="font-weight: 300; letter-spacing: 0.35em; text-transform: uppercase; font-size: 24px; margin: 0; color: #1a1a1a;">SOVRA</h1>
              <p style="font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; color: #8c7b68; margin: 8px 0 0 0;">Confirmation of Acquisition</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 0 25px 0;">
              <p style="font-size: 16px; font-style: italic; color: #333333; margin: 0 0 20px 0;">Hello ${user.name || 'there'},</p>
              <p style="font-size: 14px; line-height: 1.8; color: #555555; margin: 0 0 30px 0;">
                Your curated selection of archival pieces has been successfully recorded in our registry. Our artisans are now preparing your curation for dispatch.
              </p>
              <div style="margin-bottom: 30px;">
                <h3 style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">Order Details #${order._id.toString().slice(-6).toUpperCase()}</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 20px 0 10px; font-weight: bold; font-size: 16px;">Total Acquisition Value</td>
                    <td style="padding: 20px 0 10px; font-weight: bold; font-size: 16px; text-align: right;">₹${order.totalPrice.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
              <div style="background-color: #fcfbf9; border: 1px solid #ece7df; border-radius: 6px; padding: 20px; font-size: 12px; color: #666; margin-bottom: 30px;">
                <strong>Shipping to:</strong><br />
                ${order.shippingAddress.address}<br />
                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br />
                ${order.shippingAddress.country}
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f2ede4; padding-top: 30px; text-align: center;">
              <p style="font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #999999; margin: 0 0 8px 0; font-family: sans-serif;">Maison Sovra</p>
              <div style="font-size: 11px; color: #aaaaaa; line-height: 1.6; font-family: sans-serif;">
                23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001<br />
                <a href="https://sovrajewellery.com" style="color: #8c7b68; text-decoration: none;">www.sovrajewellery.com</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

module.exports = {
  sendEmail,
  getOTPTemplate,
  getOTPText,
  getNewsletterTemplate,
  getOrderConfirmationTemplate,
  stripHtml
};
