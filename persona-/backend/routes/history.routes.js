const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', historyController.getHistory);
router.get('/page-of-article', historyController.getPageOfArticle);
router.delete('/:id', historyController.deleteHistoryEntry);
router.post('/permanent-delete-article', historyController.permanentDeleteArticleAndResetSalaries);

module.exports = router;
