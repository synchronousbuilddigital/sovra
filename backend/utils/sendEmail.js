const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer
 * @param {Object} options - Email options (email, subject, html)
 */
const sendEmail = async (options) => {
  // Config for Nodemailer
  // We prioritize SMTP_HOST/PORT if provided, otherwise fallback to Gmail service
  const config = process.env.SMTP_HOST ? {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT == 465,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  } : {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  };

  const transporter = nodemailer.createTransport(config);

  const mailOptions = {
    from: `"SOVRA" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    throw new Error('Email failed to send. Please check your configuration.');
  }
};

const getOTPTemplate = (otp, name) => {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; padding: 60px 40px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; font-size: 24px; margin: 0;">SOVRA</h1>
        <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #999; margin-top: 10px;">Maison of Fine Jewellery</p>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="font-size: 16px; font-style: italic; color: #444; margin-bottom: 25px;">Chère ${name || 'Patron'},</p>
        <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 30px;">
          To ensure the security of your private curation and maintain the exclusivity of our collective, please verify your entry using the unique access code provided below.
        </p>
      </div>

      <div style="background-color: #fcfcfc; border: 1px solid #f5f5f5; padding: 40px 20px; text-align: center; margin-bottom: 40px;">
        <span style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #999; display: block; margin-bottom: 15px;">Your Access Code</span>
        <span style="font-size: 36px; font-weight: 300; letter-spacing: 0.5em; color: #1a1a1a;">${otp}</span>
      </div>

      <p style="font-size: 12px; line-height: 1.8; color: #888; text-align: center; margin-bottom: 50px;">
        This code is valid for verification for the next 10 minutes.<br />
        If you did not initiate this request, please disregard this correspondence.
      </p>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 40px; text-align: center;">
        <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #bbb; margin-bottom: 15px;">Maison Sovra</p>
        <div style="font-size: 10px; color: #ccc;">
          23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001
        </div>
      </div>
    </div>
  `;
};

const getNewsletterTemplate = (email) => {
  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; padding: 60px 40px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; font-size: 24px; margin: 0;">SOVRA</h1>
        <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #999; margin-top: 10px;">The Inner Circle</p>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="font-size: 16px; font-style: italic; color: #444; margin-bottom: 25px;">Welcome to the Inner Circle,</p>
        <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 30px;">
          You have successfully joined our exclusive collective. As a member of the Inner Circle, you will be the first to witness our limited archival releases, seasonal journals, and the radiance of the Aravalli hills.
        </p>
      </div>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 40px; text-align: center;">
        <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #bbb; margin-bottom: 15px;">Maison Sovra</p>
        <div style="font-size: 10px; color: #ccc;">
          23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001
        </div>
      </div>
    </div>
  `;
};

const getOrderConfirmationTemplate = (order, user) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px;">${item.name} x ${item.qty}</td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">₹${item.price.toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0f0f0; padding: 60px 40px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="font-weight: 300; letter-spacing: 0.3em; text-transform: uppercase; font-size: 24px; margin: 0;">SOVRA</h1>
        <p style="font-size: 10px; letter-spacing: 0.5em; text-transform: uppercase; color: #999; margin-top: 10px;">Confirmation of Acquisition</p>
      </div>

      <div style="margin-bottom: 40px;">
        <p style="font-size: 16px; font-style: italic; color: #444; margin-bottom: 25px;">Chère ${user.name},</p>
        <p style="font-size: 14px; line-height: 1.8; color: #666; margin-bottom: 30px;">
          Your curated selection of archival pieces has been successfully recorded in our registry. Our artisans are now preparing your curation for dispatch.
        </p>
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px;">Order Details #${order._id.toString().slice(-6).toUpperCase()}</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
          <tr>
            <td style="padding: 20px 0 10px; font-weight: bold; font-size: 16px;">Total Acquisition Value</td>
            <td style="padding: 20px 0 10px; font-weight: bold; font-size: 16px; text-align: right;">₹${order.totalPrice.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fcfcfc; border: 1px solid #f5f5f5; padding: 20px; font-size: 12px; color: #666; margin-bottom: 40px;">
        <strong>Shipping to:</strong><br />
        ${order.shippingAddress.address}<br />
        ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br />
        ${order.shippingAddress.country}
      </div>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 40px; text-align: center;">
        <p style="font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #bbb; margin-bottom: 15px;">Maison Sovra</p>
        <div style="font-size: 10px; color: #ccc;">
          23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001
        </div>
      </div>
    </div>
  `;
};

module.exports = { sendEmail, getOTPTemplate, getNewsletterTemplate, getOrderConfirmationTemplate };

