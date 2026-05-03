const SizePricing = require('../models/SizePricing');

// 1. Get Size Pricing by size and stockType
exports.getSizePricing = async (req, res) => {
  try {
    const { size, stockType } = req.query;
    if (!size || !stockType) {
      return res.status(400).json({ success: false, error: 'Size and stockType are required' });
    }
    const pricing = await SizePricing.findOne({ size, stockType });
    res.json({ success: true, data: pricing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 2. Update Size Pricing by size and stockType
exports.updateSizePricing = async (req, res) => {
  try {
    const { size, stockType, mrp, rate, updatedByName } = req.body;
    if (!size || !stockType) {
      return res.status(400).json({ success: false, error: 'Size and stockType are required' });
    }

    const updatedData = {
      mrp: Number(mrp) || 0,
      rate: Number(rate) || 0,
    };

    const pricing = await SizePricing.findOneAndUpdate(
      { size, stockType },
      {
        $set: updatedData,
        $push: {
          history: {
            action: 'updated',
            updatedBy: req.user?.id,
            updatedByName,
            changes: updatedData,
            timestamp: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Size pricing updated successfully',
      data: pricing
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
