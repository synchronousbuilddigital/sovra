const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'sovra_products',
      resource_type: 'image',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'heic', 'heif', 'jfif', 'JPG', 'PNG', 'JPEG', 'WEBP', 'AVIF'],
      transformation: [
        { quality: 'auto:good', fetch_format: 'auto' }
      ],
    };
  },
});

const fileFilter = (req, file, cb) => {
  // Ensure only image files are accepted
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPG, PNG, WEBP, etc.) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file size
  },
});

module.exports = { cloudinary, upload };
