const express = require('express');
const router  = express.Router();
const auth    = require('../middlewares/auth');
const {
  recordPayment,
  getPayments,
  getOutstanding,
  getPLStatement,
  getGSTReport,
  deletePayment
} = require('../controllers/accountingController');

router.use(auth);

router.post('/payments',       recordPayment);
router.get('/payments',        getPayments);
router.delete('/payments/:id', deletePayment);
router.get('/outstanding',     getOutstanding);
router.get('/pl-statement',    getPLStatement);
router.get('/gst-report',      getGSTReport);

module.exports = router;
