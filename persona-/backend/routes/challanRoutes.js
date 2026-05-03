const express = require('express');
const router = express.Router();
const challanController = require('../controllers/challanController');
const auth = require('../middlewares/auth');

// All challan routes require authentication
router.use(auth);

// Specific routes FIRST
router.get('/party-summary', challanController.getPartySummaryV2);
router.get('/latest-invoice', challanController.getLatestInvoice);
router.get('/article/:article/variants', challanController.getArticleVariants);
router.get('/article-suggestions', challanController.getArticleSuggestions);
router.get('/party-names', challanController.getPartyNames);
router.post('/stock-check', challanController.checkStock);
router.get('/stock-available', challanController.getStockAvailable);

// General list/create
router.post('/', challanController.createChallan);
router.get('/', challanController.getAllChallans);

// Param routes LAST
router.get('/:id', challanController.getChallan);
router.put('/:id', challanController.updateChallan);
router.delete('/:id', challanController.deleteChallan);
router.post('/migrate-challan-ids', challanController.migrateChallanIds);

module.exports = router;
