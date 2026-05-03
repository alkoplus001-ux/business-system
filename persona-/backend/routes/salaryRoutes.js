const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const {
  getSalaryReport,
  patchSalaryEntry,
  getSalaryEntryById,
  debugSalaryEntries
} = require('../controllers/salaryController');

router.use(auth);

router.get('/salary-report', getSalaryReport);
router.get('/debug-entries', debugSalaryEntries);
router.patch('/:id', patchSalaryEntry);
router.get('/:id', getSalaryEntryById);

module.exports = router;
