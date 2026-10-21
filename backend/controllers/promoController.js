const Promo = require('../models/promoModel');

// @desc    Get all promos
// @route   GET /api/promos
// @access  Private/Admin
const getPromos = async (req, res) => {
  try {
    const promos = await Promo.find({});
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new promo
// @route   POST /api/promos
// @access  Private/Admin
const createPromo = async (req, res) => {
  try {
    const { code, discount, expiryDate, limit, perUserLimit, minOrderAmount, maxDiscountAmount } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'Promo code is required.' });
    }

    const normalizedCode = code.trim().toUpperCase();

    if (normalizedCode.length < 3 || normalizedCode.length > 30) {
      return res.status(400).json({ message: 'Promo code must be between 3 and 30 characters.' });
    }

    const numDiscount = Number(discount);
    if (isNaN(numDiscount) || numDiscount < 1 || numDiscount > 100) {
      return res.status(400).json({ message: 'Discount percentage must be a number between 1 and 100.' });
    }

    let parsedLimit;
    if (limit !== undefined && limit !== null && limit !== '') {
      parsedLimit = Number(limit);
      if (isNaN(parsedLimit) || parsedLimit < 1) {
        return res.status(400).json({ message: 'Usage limit must be at least 1.' });
      }
    }

    let parsedExpiry;
    if (expiryDate) {
      parsedExpiry = new Date(expiryDate);
      if (isNaN(parsedExpiry.getTime())) {
        return res.status(400).json({ message: 'Invalid expiry date.' });
      }
    }

    const promoExists = await Promo.findOne({ code: normalizedCode });
    if (promoExists) {
      return res.status(400).json({ message: `Promo code "${normalizedCode}" already exists.` });
    }

    const promo = new Promo({
      code: normalizedCode,
      discount: numDiscount,
      expiryDate: parsedExpiry,
      limit: parsedLimit,
      perUserLimit: perUserLimit ? Math.max(1, Number(perUserLimit) || 1) : 1,
      minOrderAmount: minOrderAmount ? Math.max(0, Number(minOrderAmount) || 0) : 0,
      maxDiscountAmount: maxDiscountAmount ? Math.max(1, Number(maxDiscountAmount) || 1) : null,
      usedCount: 0,
      usedBy: []
    });

    const createdPromo = await promo.save();
    res.status(201).json(createdPromo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete promo
// @route   DELETE /api/promos/:id
// @access  Private/Admin
const deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findById(req.params.id);

    if (promo) {
      await promo.deleteOne();
      res.json({ message: 'Promo removed successfully' });
    } else {
      res.status(404).json({ message: 'Promo not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Validate promo code
// @route   GET /api/promos/validate/:code
// @access  Private
const validatePromo = async (req, res) => {
  try {
    const rawCode = (req.params.code || '').trim().toUpperCase();

    if (!rawCode) {
      return res.status(400).json({ message: 'Coupon code is required.' });
    }

    const promo = await Promo.findOne({ code: rawCode });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid artisanal coupon code.' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ message: 'This code is no longer active.' });
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This coupon code has expired.' });
    }

    if (promo.limit && promo.usedCount >= promo.limit) {
      return res.status(400).json({ message: 'This coupon code has reached its maximum usage limit.' });
    }

    // Per-user redemption check
    if (req.user && promo.usedBy && Array.isArray(promo.usedBy)) {
      const userRedemptionCount = promo.usedBy.filter(
        (userId) => userId.toString() === req.user._id.toString()
      ).length;

      const allowedPerUser = promo.perUserLimit || 1;
      if (userRedemptionCount >= allowedPerUser) {
        return res.status(400).json({
          message: 'You have already redeemed this coupon code on a previous order.'
        });
      }
    }

    // Minimum order amount check if subtotal is provided in query
    if (req.query.subtotal) {
      const subtotal = Number(req.query.subtotal);
      if (!isNaN(subtotal) && promo.minOrderAmount > 0 && subtotal < promo.minOrderAmount) {
        return res.status(400).json({
          message: `Minimum cart subtotal of ₹${promo.minOrderAmount.toLocaleString()} required for this coupon.`
        });
      }
    }

    res.json({
      code: promo.code,
      discount: promo.discount,
      minOrderAmount: promo.minOrderAmount || 0,
      maxDiscountAmount: promo.maxDiscountAmount || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPromos,
  createPromo,
  deletePromo,
  validatePromo,
};

