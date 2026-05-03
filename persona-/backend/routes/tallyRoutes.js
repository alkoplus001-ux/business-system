const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getSalesRegister,
  getPurchaseRegister,
  getStockSummary,
  getPartyLedger,
  getDayBook,
  getTallySummary,
  exportSalesXML,
  exportStockXML,
  pushSalesToTally,
  pushStockToTally,
  verifyTallyCompany,
  setTallyCompanyName
} = require('../controllers/tallyController');

router.use(auth);

router.get('/summary', getTallySummary);
router.get('/sales-register', getSalesRegister);
router.get('/purchase-register', getPurchaseRegister);
router.get('/stock-summary', getStockSummary);
router.get('/party-ledger', getPartyLedger);
router.get('/day-book', getDayBook);
router.get('/export/sales-xml', exportSalesXML);
router.get('/export/stock-xml', exportStockXML);
router.post('/push/sales', pushSalesToTally);
router.post('/push/stock', pushStockToTally);
router.get('/verify-company', verifyTallyCompany);
router.post('/set-company-name', setTallyCompanyName);

module.exports = router;
