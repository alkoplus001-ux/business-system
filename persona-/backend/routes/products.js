const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload'); 
const Product = require('../models/Product');
const ExcelJS = require('exceljs');
const Company = require('../models/Company');

const {
  createProduct,
  getProducts,
  bulkDelete,
  bulkRestore,
  importExcel,
  getStockHistory,
  getProductsByCategory,
//  getSalaryReport,
  getProductById,
  updateProduct,
  getDeletedProducts,
  permanentDelete,
  getArticleOptions, 
  getArticleDetails ,
   getArticleGenderInfo,
  getArticleGenderSizeInfo,
   getAllowedGendersForArticle,
   getAllUserEntriesForProduct,
   
} = require('../controllers/productController');


const {
  getSizePricing,
  updateSizePricing
} = require('../controllers/SizePricingController'); 



router.use(auth);

router.get('/', getProducts);

router.get('/article-options', getArticleOptions);

// Company-wise distinct stock types
router.get('/stock-types', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const types = await Product.distinct('stockType', { companyId, isDeleted: false, stockType: { $nin: [null, ''] } });
    res.json({ success: true, data: types.sort() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


router.get('/suggestions', async (req, res) => {
  try {
    const { field, search } = req.query;
    const allowedFields = ['article', 'color', 'size', 'packing'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({
        success: false,
        error: "Invalid field. Allowed fields: article, color, size, packing"
      });
    }

    const mongoose = require('mongoose');
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const query = { companyId, isDeleted: false };
    if (search) query[field] = { $regex: search, $options: 'i' };
    const values = await Product.distinct(field, query);

    res.json({
      success: true,
      data: values.filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch suggestions"
    });
  }
});


router.get('/smart-article-info', getArticleDetails); 

router.get('/history', auth, getStockHistory);
//router.get('/salary-report', auth, getSalaryReport);
router.get('/deleted', auth, getDeletedProducts);
router.get('/category/:stockType/:gender', getProductsByCategory);

// किसी product के लिए सभी user entries निकालने के लिए
router.get('/:id/salary-entries', auth, getAllUserEntriesForProduct);

router.get('/size-pricing', auth, getSizePricing); 
router.put('/size-pricing', auth, updateSizePricing); 

router.get('/article-gender-info', getArticleGenderInfo);
router.get('/article-gender-size-info', getArticleGenderSizeInfo);

router.get('/allowed-genders', getAllowedGendersForArticle);
// Suggest article names (company-wise): /products/articles-suggestions?search=XYZ
router.get('/articles-suggestions', async (req, res) => {
  try {
    const { search = '' } = req.query;
    if (!search.trim()) return res.json({ data: [] });
    const mongoose = require('mongoose');
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);
    const matches = await Product.find({
      companyId,
      isDeleted: false,
      article: { $regex: `^${search.trim()}`, $options: "i" }
    }).distinct('article');
    res.json({ data: matches.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ data: [] });
  }
});
router.get('/export-all', async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const [products, company] = await Promise.all([
      Product.find({ companyId, isDeleted: { $ne: true } }),
      Company.findById(companyId)
    ]);

    const companyName = company ? company.name : 'Products';
    const safeFileName = companyName.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
      { header: 'Article', key: 'article', width: 20 },
      { header: 'Gender', key: 'gender', width: 15 },
      { header: 'Stock Type', key: 'stockType', width: 15 },
      { header: 'Color', key: 'color', width: 15 },
      { header: 'Size', key: 'size', width: 10 },
      { header: 'Cartons', key: 'cartons', width: 10 },
      { header: 'Pair/Carton', key: 'pairPerCarton', width: 12 },
      { header: 'MRP', key: 'mrp', width: 10 },
      { header: 'Rate', key: 'rate', width: 10 },
      { header: 'Series', key: 'series', width: 15 },
      { header: 'Created By', key: 'createdBy', width: 20 },
    ];

    products.forEach(p => {
      worksheet.addRow({
        article: p.article,
        gender: p.gender,
        stockType: p.stockType,
        color: p.color,
        size: p.size,
        cartons: p.cartons,
        pairPerCarton: p.pairPerCarton,
        mrp: p.mrp,
        rate: p.rate,
        series: p.series,
        createdBy: p.createdBy
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${safeFileName}-Products.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    res.status(500).json({ message: 'Export failed' });
  }
});

router.get('/:id', auth, getProductById);
router.put('/:id', auth, upload.single('image'), updateProduct); 
router.post('/', auth, upload.single('image'), createProduct); 
router.post('/bulk-delete', auth, bulkDelete);
router.post('/bulk-restore', auth, bulkRestore);



router.post('/import', auth, importExcel);
router.post('/permanent-delete', auth, permanentDelete); 


module.exports = router;
