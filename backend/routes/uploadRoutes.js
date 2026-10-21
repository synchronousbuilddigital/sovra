const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ url: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

module.exports = router;

