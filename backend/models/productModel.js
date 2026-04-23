const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
});


const productSchema = mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  details: { type: String, required: true },
  material: { type: String, required: true, default: 'Stainless Steel' },
  plating: { type: String, default: 'Gold 18K PVD Plating' },
  stone: { type: String, default: 'Natural' },
  length: { type: String, default: '46 cm' },
  weight: { type: String, default: '6g' },
  features: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  img: { type: String, required: true },
  images: { type: [String], default: [] },
  hero: { type: Boolean, default: false },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  shuffleOrder: { type: Number, default: 0 },
}, {

  timestamps: true,
});


const Product = mongoose.model('Product', productSchema);

module.exports = Product;
