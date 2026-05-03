
// // LOCATION: server/controllers/historyController.js
const History = require('../models/History');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const Challan = require('../models/Challan');

const SalaryEntry = require('../models/SalaryEntry');




exports.getHistory = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = '',
      action,
      updatedBy,
      productId,
      userId,
      from,
      to,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 50, 1);
    const skip = (pageNum - 1) * limitNum;

    // ✅ BASE FILTER — scoped to company
    const filter = { companyId: req.user.companyId };

    // Existing filters
    if (productId) filter.product = productId;
    if (userId) filter.updatedBy = userId;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    // ✅ Action filter
    if (action) filter.action = action;

    // ✅ GLOBAL SEARCH CONDITIONS
    const orClauses = [];

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');

      // 🔥 Article / color / size search via Product collection
      const productIds = await Product.find({
        $or: [
          { article: regex },
          { color: regex },
          { size: regex },
        ],
      }).distinct('_id');

      if (productIds.length) {
        orClauses.push({ product: { $in: productIds } });
      }

      // Direct string fields on History
      orClauses.push(
        { note: regex },
        { updatedByName: regex },
        { partyName: regex },
        { invoiceNo: regex }
      );
    }

    // ✅ UpdatedBy filter (name ya username)
    if (updatedBy) {
      orClauses.push(
        { updatedByName: updatedBy },
        { 'updatedBy.username': updatedBy }
      );
    }

    if (orClauses.length > 0) {
      filter.$or = orClauses;
    }

    // ✅ Count + data parallel
    const [totalCount, rawHistory] = await Promise.all([
      History.countDocuments(filter),
      History.find(filter)
        .populate('product', 'article gender size color')
        .populate('updatedBy', 'username')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const history = rawHistory.map((h) => {
      if (!h.product) {
        h.product = {
          article: '',
          gender: '',
          size: '',
          color: '',
        };
      }
      if (!h.updatedByName && h.updatedBy?.username) {
        h.updatedByName = h.updatedBy.username;
      }
      return h;
    });

    const totalPages = Math.max(
      Math.ceil(totalCount / limitNum),
      1
    );

    res.json({
      success: true,
      data: history,
      totalCount,
      totalPages,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error('History fetch error:', err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

exports.deleteHistoryEntry = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const historyEntry = await History.findOne({ _id: id, companyId: req.user.companyId }).session(session).populate('product');
    if (!historyEntry) {
      return res.status(404).json({ success: false, error: 'History record not found' });
    }

    const action = historyEntry.action;
    const product = historyEntry.product;
    if (!product) throw new Error('Associated product not found');

    // Only allow certain actions
    if (!['CHALLAN_OUT', 'CHALLAN_IN', 'UPDATE', 'ADD'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Deletion not allowed for this history entry' });
    }

    const cartonChange = historyEntry.quantityChanged;

    // === 1️⃣ Handle CHALLAN actions (keep existing logic) ===
    if (action === 'CHALLAN_OUT') {
      product.cartons += Math.abs(cartonChange);
      product.cartonsChallanedOut = Math.max(0, (product.cartonsChallanedOut || 0) - Math.abs(cartonChange));
      await product.save({ session });
    } else if (action === 'CHALLAN_IN') {
      product.cartons = Math.max(0, product.cartons - cartonChange);
      product.cartonsChallanedOut = (product.cartonsChallanedOut || 0) + cartonChange;
      await product.save({ session });
    }

    // === 2️⃣ Handle ADD/UPDATE actions ===
    if (['UPDATE', 'ADD'].includes(action)) {
      // First revert the salary entry
      await SalaryEntry.findOneAndUpdate(
        {
          createdBy: historyEntry.updatedByName, // ✅ FIXED: Use history user
          article: product.article,
          gender: product.gender,
          createdAt: {
            $gte: new Date(historyEntry.timestamp.setHours(0, 0, 0, 0)), // ✅ FIXED: Use history timestamp  
            $lte: new Date(historyEntry.timestamp.setHours(23, 59, 59, 999))
          }
        },
        {
          $inc: {
            cartons: -cartonChange, 
            totalPairs: -(cartonChange * product.pairPerCarton)
          }
        },
        { session }
      );

      // ✅ NEW: Recalculate product.cartons from ALL SalaryEntry records
      const agg = await SalaryEntry.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, total: { $sum: "$cartons" } } }
      ]).session(session);
      
      product.cartons = agg[0]?.total || 0;
      await product.save({ session });
    }

    // === 3️⃣ Handle CHALLAN revert (keep existing) ===
    if (action === 'CHALLAN_OUT' && historyEntry.invoiceNo) {
      const challan = await Challan.findOne({ invoiceNo: historyEntry.invoiceNo }).session(session);
      if (challan) {
        challan.items = challan.items.filter(item => 
          !(
            item.article.toUpperCase() === product.article.toUpperCase() &&
            item.size === product.size &&
            item.color.toUpperCase() === product.color.toUpperCase()
          )
        );
        if (challan.items.length === 0) {
          await Challan.deleteOne({ _id: challan._id }).session(session);
        } else {
          await challan.save({ session });
        }
      }
    }

    // === 4️⃣ Delete the history entry ===
    await History.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'History entry deleted, stock, salary, and challan reverted' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};



exports.permanentDeleteArticleAndResetSalaries = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    const { article, gender, size, color } = req.body;
    
    if (!article) return res.status(400).json({ success: false, error: 'article required' });

    const articleRegex = new RegExp(`^${article}$`, 'i');
    const genderRegex = gender ? new RegExp(`^${gender}$`, 'i') : null;

    await session.withTransaction(async () => {
      // 1. Find products to delete
      const productQuery = { article: articleRegex };
      if (gender) productQuery.gender = genderRegex;
      if (size) productQuery.size = size;
      if (color) productQuery.color = new RegExp(`^${color}$`, 'i');

      const productsToDelete = await Product.find(productQuery).session(session);
      
      if (productsToDelete.length === 0) {
        throw new Error('No products found to delete');
      }

      const productIds = productsToDelete.map(p => p._id);
      
      // 2. ✅ IMAGE PRESERVATION
      const imagePreservationMap = new Map();
      
      for (let product of productsToDelete) {
        if (product.image) {
          const key = `${product.article}_${product.gender}`;
          if (!imagePreservationMap.has(key)) {
            imagePreservationMap.set(key, product.image);
          }
        }
      }

      // Transfer images to sibling products
      for (let [key, imageUrl] of imagePreservationMap) {
        const [article, gender] = key.split('_');
        
        const siblingProduct = await Product.findOneAndUpdate(
          {
            article: new RegExp(`^${article}$`, 'i'),
            gender: gender.toLowerCase(),
            _id: { $nin: productIds },
            isDeleted: false,
            $or: [
              { image: { $exists: false } },
              { image: null },
              { image: "" }
            ]
          },
          { $set: { image: imageUrl } },
          { session, new: true }
        );

        if (siblingProduct) {
          console.log(`✅ Image preserved: ${article} ${gender} → ${siblingProduct.size}x${siblingProduct.color}`);
        }
      }
      
      // 3. ✅ CRITICAL FIX: Only delete SalaryEntries for SPECIFIC products
      let totalDeletedSalaryEntries = 0;
      
      for (let productId of productIds) {
        const deletedSalaryEntries = await SalaryEntry.deleteMany({
          product: productId // ✅ ONLY this specific product
        }, { session });
        
        totalDeletedSalaryEntries += deletedSalaryEntries.deletedCount;
        console.log(`🗑️ Deleted ${deletedSalaryEntries.deletedCount} salary entries for product ${productId}`);
      }

      // 4. Delete products and history
      const deleteResult = await Product.deleteMany({ _id: { $in: productIds } }, { session });
      await History.deleteMany({ product: { $in: productIds } }, { session });

      console.log(`🗑️ Deleted ${deleteResult.deletedCount} products`);

      // 5. ✅ RECALCULATE remaining products' totals
      const remainingProducts = await Product.find({
        article: articleRegex,
        gender: genderRegex || { $exists: true },
        isDeleted: false
      }).session(session);

      for (let product of remainingProducts) {
        // Recalculate this product's total cartons from SalaryEntry
        const totalSalary = await SalaryEntry.aggregate([
          { $match: { product: product._id } },
          { $group: { _id: null, total: { $sum: "$cartons" } } }
        ]).session(session);
        
        const newTotal = totalSalary[0]?.total || 0;
        product.cartons = newTotal;
        await product.save({ session });
        console.log(`📦 Updated product: ${product.article} ${product.size}x${product.color} = ${newTotal} cartons`);
      }

      console.log(`✅ Transaction Summary:`);
      console.log(`   - Products deleted: ${deleteResult.deletedCount}`);
      console.log(`   - Salary entries deleted: ${totalDeletedSalaryEntries}`);
      console.log(`   - Images preserved: ${imagePreservationMap.size}`);
      console.log(`   - Remaining products updated: ${remainingProducts.length}`);
    });

    res.json({ 
      success: true, 
      message: `✅ Products permanently deleted. Only deleted products affected.`
    });

  } catch (err) {
    console.error('❌ Permanent delete error:', err);
    res.status(500).json({ 
      success: false, 
      error: `Transaction failed: ${err.message}`
    });
  } finally {
    await session.endSession();
  }
};

// GET /history/page-of-article?article=8815&limit=50
exports.getPageOfArticle = async (req, res) => {
  try {
    const { article, limit = 50 } = req.query;
    if (!article) {
      return res.status(400).json({ success: false, error: 'article required' });
    }

    const limitNum = Math.max(parseInt(limit, 10) || 50, 1);

    // 1) Same base filter as list (without search)
    const baseFilter = {}; // agar action/from/to/userId lagana ho to yahin add kar

    // 2) Target record (latest history for this article)
    const target = await History.findOne({
      ...baseFilter,
      articleText: new RegExp(`^${article}$`, 'i'),  // ya exact match field
    })
      .sort({ timestamp: -1 })   // same sort as main listing
      .lean();

    if (!target) {
      return res.json({ success: false, message: 'No history for this article' });
    }

    // 3) Count records BEFORE this one in same sort
    const countBefore = await History.countDocuments({
      ...baseFilter,
      timestamp: { $gt: target.timestamp },
    });

    const page = Math.floor(countBefore / limitNum) + 1;
    const indexInPage = countBefore % limitNum;

    res.json({
      success: true,
      page,
      indexInPage,
      historyId: target._id,
    });
  } catch (err) {
    console.error('getPageOfArticle error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
