const express = require('express');
const router = express.Router();
const SalarySetting = require('../models/SalarySetting');

// Save a new salary setting
router.post('/', async (req, res) => {
  try {
    const newSetting = new SalarySetting(req.body);
    await newSetting.save();
    res.json({ success: true, data: newSetting });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get latest salary setting
router.get('/', async (req, res) => {
  try {
    const settings = await SalarySetting.findOne().sort({ effectiveFrom: -1 });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
