const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'The Archive',
    },
    desc: {
      type: String,
      trim: true,
      default: '',
    },
    tagline: {
      type: String,
      trim: true,
      default: '',
    },
    count: {
      type: String,
      trim: true,
      default: '',
    },
    homeImage: {
      type: String,
      required: [true, 'Please provide an image for the Home Screen category card'],
      trim: true,
    },
    collectionImage: {
      type: String,
      trim: true,
      default: '',
    },
    showOnHome: {
      type: Boolean,
      default: false,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fallback collectionImage to homeImage if empty before saving
categorySchema.pre('save', function (next) {
  if (!this.collectionImage || this.collectionImage.trim() === '') {
    this.collectionImage = this.homeImage;
  }
  if (!this.title || this.title.trim() === '') {
    this.title = `Exclusive ${this.name}`;
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
