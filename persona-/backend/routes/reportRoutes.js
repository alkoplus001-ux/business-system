const express = require('express');
const router = express.Router();
const { getProductionReport } = require('../controllers/salarySettingController');

// Route to fetch report
router.get('/production-report', getProductionReport);

module.exports = router;
