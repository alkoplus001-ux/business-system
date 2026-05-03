
// middlewares/upload.js
const multer = require('multer');
const { storage } = require('../config/cloudinary'); // Cloudinary storage

// Optional: fileFilter can still be added if needed to accept only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
