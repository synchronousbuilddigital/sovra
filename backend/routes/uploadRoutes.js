const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

router.post('/', protect, admin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      logger.error(`Image upload error: ${err.message}`);
      return res.status(400).json({
        message: err.message || 'Image upload failed. Please verify the file is a valid image under 15MB.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image file was provided' });
    }

    // Return the secure Cloudinary URL
    const fileUrl = req.file.path || req.file.secure_url || req.file.url;
    return res.json({ url: fileUrl });
  });
});

module.exports = router;
