const express = require('express');
const router = express.Router();
const { getProductionReport } = require('../controllers/productionController');

router.get('/production-report', getProductionReport);

module.exports = router;
