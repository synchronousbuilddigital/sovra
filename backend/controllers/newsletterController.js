const { sendEmail, getNewsletterTemplate } = require('../utils/sendEmail');
const logger = require('../utils/logger');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Send welcome email
    await sendEmail({
      email,
      subject: 'Welcome to the SOVRA Inner Circle',
      html: getNewsletterTemplate(email),
    });

    logger.info(`New newsletter subscription: ${email}`);
    res.status(200).json({ message: 'Successfully joined the Inner Circle. Please check your inbox for a confirmation.' });
  } catch (error) {
    logger.error(`Newsletter subscription failed for ${email}: ${error.message}`);
    res.status(500).json({ message: 'Failed to send confirmation email. Please try again later.' });
  }
};

module.exports = { subscribeNewsletter };
