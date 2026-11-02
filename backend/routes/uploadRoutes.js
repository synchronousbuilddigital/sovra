const express = require('express');
const router = express.Router();
const { upload, videoUpload } = require('../config/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Admin product image upload
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

// Customer exchange unboxing video and photo upload (MP4/MOV up to 100MB)
router.post('/exchange-media', protect, (req, res) => {
  videoUpload.single('media')(req, res, (err) => {
    if (err) {
      logger.error(`Exchange media upload error: ${err.message}`);
      return res.status(400).json({
        message: err.message || 'Video upload failed. Please verify the video is valid and under 100MB.'
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No media file was uploaded' });
    }

    const fileUrl = req.file.path || req.file.secure_url || req.file.url;
    const isVideo = req.file.mimetype ? req.file.mimetype.startsWith('video/') : false;

    return res.json({
      url: fileUrl,
      mimetype: req.file.mimetype,
      isVideo,
      publicId: req.file.filename,
    });
  });
});

module.exports = router;
