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
  const { code, discount, expiryDate, limit } = req.body;

  const promoExists = await Promo.findOne({ code });

  if (promoExists) {
    res.status(400).json({ message: 'Promo code already exists' });
    return;
  }

  const promo = new Promo({
    code,
    discount,
    expiryDate,
    limit
  });

  const createdPromo = await promo.save();
  res.status(201).json(createdPromo);
};

// @desc    Delete promo
// @route   DELETE /api/promos/:id
// @access  Private/Admin
const deletePromo = async (req, res) => {
  const promo = await Promo.findById(req.params.id);

  if (promo) {
    await promo.deleteOne();

    res.json({ message: 'Promo removed' });
  } else {
    res.status(404).json({ message: 'Promo not found' });
  }
};

// @desc    Validate promo code
// @route   GET /api/promos/validate/:code
// @access  Private
const validatePromo = async (req, res) => {
  try {
    const promo = await Promo.findOne({ code: req.params.code.toUpperCase() });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid artisanal code.' });
    }

    if (!promo.isActive) {
      return res.status(400).json({ message: 'This code is no longer active.' });
    }

    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ message: 'This code has expired.' });
    }

    if (promo.limit && promo.usedCount >= promo.limit) {
      return res.status(400).json({ message: 'This code has reached its usage limit.' });
    }

    res.json({
      code: promo.code,
      discount: promo.discount
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

