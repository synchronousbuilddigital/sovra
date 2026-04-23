const mongoose = require('mongoose');

const promoSchema = mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true }, // percentage
  isActive: { type: Boolean, required: true, default: true },
  expiryDate: { type: Date },
  limit: { type: Number },
  usedCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Promo = mongoose.model('Promo', promoSchema);
module.exports = Promo;
