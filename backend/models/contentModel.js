const mongoose = require('mongoose');

const contentSchema = mongoose.Schema({
  homeHeroImage: { type: String, required: true },
  homeHeroHeadline: { type: String, required: true },
  storyNarrative: { type: String, required: true },
  activeCollection: { type: String, default: 'Celestial Body' },
}, {
  timestamps: true,
});

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
