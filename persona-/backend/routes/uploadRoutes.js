const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/'); // यह folder बनाना होगा
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed!'), false);
    }
  }
});

// Image upload route
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (req.file) {
      res.json({ 
        success: true, 
        imageUrl: `/uploads/products/${req.file.filename}` 
      });
    } else {
      res.status(400).json({ success: false, error: 'No image uploaded' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
