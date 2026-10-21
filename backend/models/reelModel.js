const mongoose = require('mongoose');

const reelSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    default: 'Jewellery',
    trim: true,
  },
  image: {
    type: String,
    required: true,
    trim: true,
  },
  video: {
    type: String,
    default: '',
    trim: true,
  },
  productId: {
    type: String,
    default: '',
    trim: true,
  },
  price: {
    type: String,
    default: '',
    trim: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isHomeShowcase: {
    type: Boolean,
    default: false,
  },
  homeOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Middleware to keep title and name in sync
reelSchema.pre('save', function (next) {
  if (this.title && !this.name) this.name = this.title;
  if (this.name && !this.title) this.title = this.name;
  next();
});

const Reel = mongoose.model('Reel', reelSchema);

module.exports = Reel;
