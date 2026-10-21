const mongoose = require('mongoose');

const promoSchema = mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true, 
    trim: true 
  },
  discount: { 
    type: Number, 
    required: true,
    min: 1,
    max: 100
  }, // percentage 1% - 100%
  isActive: { 
    type: Boolean, 
    required: true, 
    default: true 
  },
  expiryDate: { 
    type: Date 
  },
  limit: { 
    type: Number,
    min: 1
  },
  usedCount: { 
    type: Number, 
    default: 0 
  },
  usedBy: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  perUserLimit: { 
    type: Number, 
    default: 1,
    min: 1
  },
  minOrderAmount: { 
    type: Number, 
    default: 0 
  },
  maxDiscountAmount: { 
    type: Number, 
    default: null 
  }
}, {
  timestamps: true
});

const Promo = mongoose.model('Promo', promoSchema);
module.exports = Promo;
