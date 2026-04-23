const mongoose = require('mongoose');

const materialSchema = mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // 'Metal', 'Gem'
  amount: { type: String, required: true },
  status: { type: String, required: true, default: 'Stable' }, // 'Stable', 'Low Stock', 'Critical'
  threshold: { type: String, required: true }
}, {
  timestamps: true
});

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
