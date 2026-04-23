const Material = require('../models/materialModel');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Private/Admin
const getMaterials = async (req, res) => {
  const materials = await Material.find({});
  res.json(materials);
};

// @desc    Add new material
// @route   POST /api/materials
// @access  Private/Admin
const addMaterial = async (req, res) => {
  const { name, type, amount, status, threshold } = req.body;

  const material = new Material({
    name,
    type,
    amount,
    status,
    threshold,
  });

  const createdMaterial = await material.save();
  res.status(201).json(createdMaterial);
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private/Admin
const updateMaterial = async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (material) {
    material.name = req.body.name || material.name;
    material.type = req.body.type || material.type;
    material.amount = req.body.amount || material.amount;
    material.status = req.body.status || material.status;
    material.threshold = req.body.threshold || material.threshold;

    const updatedMaterial = await material.save();
    res.json(updatedMaterial);
  } else {
    res.status(404).json({ message: 'Material not found' });
  }
};

module.exports = {
  getMaterials,
  addMaterial,
  updateMaterial,
};
