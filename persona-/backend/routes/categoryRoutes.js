
const express = require('express');
const router = express.Router();
const { getProductsByCategory } = require('../controllers/productController');

router.get('/:stockType/:gender', getProductsByCategory);

module.exports = router;
