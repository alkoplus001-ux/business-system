

const Challan = require('../models/Challan');
const Product = require('../models/Product');
const History = require('../models/History');
const SalaryEntry = require('../models/SalaryEntry'); // ✅ ADD THIS IMPORT
const mongoose = require('mongoose');

// Get article variants (case-insensitive + backward compatible)
exports.getArticleVariants = async (req, res) => {
  try {
    const { article } = req.params;

    const products = await Product.find({
      companyId: req.user.companyId,
      $expr: { $eq: [{ $toUpper: '$article' }, article.toUpperCase()] },
      isDeleted: false
    }).select('size color rate pairPerCarton quantity cartons cartonsChallanedOut');

    if (!products.length) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    const variants = products.map(p => ({
      size: p.size,
      color: p.color,
      rate: p.rate,
      pairPerCarton: p.pairPerCarton,
      quantity: p.quantity || p.cartons * p.pairPerCarton,  // Backward compatible
      cartons: p.cartons,
      cartonsChallanedOut: p.cartonsChallanedOut || 0,
    }));

    res.json({ success: true, data: variants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.createChallan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('No items provided');
    }

    // 1. Generate Unique Invoice Number (company-wise)
    const year = new Date().getFullYear();
    let latestChallan = await Challan.findOne({ companyId: req.user.companyId }).sort({ createdAt: -1 }).session(session);
    let nextNumber = 1;
    if (latestChallan && latestChallan.invoiceNo) {
      const parts = latestChallan.invoiceNo.split('/');
      if (parts[1] == year.toString()) {
        nextNumber = (parseInt(parts[0], 10) || 0) + 1;
      }
    }

    let invoiceNo;
    let attempts = 0;
    while (attempts < 10) {
      invoiceNo = `${nextNumber}/${year}`;
      const existing = await Challan.findOne({ invoiceNo, companyId: req.user.companyId }).session(session);
      if (!existing) break;
      nextNumber++;
      attempts++;
    }
    if (attempts === 10) {
      throw new Error('Failed to generate unique invoice number.');
    }

    // 2. SAVE CHALLAN FIRST (SAME AS BEFORE)
    const challanData = {
      ...req.body,
      invoiceNo,
      companyId: req.user.companyId,
      createdBy: req.user.id,
      items: items.map(i => ({
        ...i,
        article: i.article.toUpperCase(),
        color: i.color.toUpperCase()
      })),
    };

    const challan = new Challan(challanData);
    const savedChallan = await challan.save({ session });

    // ✅ OPTIMIZED: BULK PROCESSING (YEHI MAGIC HAI)
    const articles = items.map(i => ({
      article: i.article.toUpperCase(),
      size: i.size,
      color: i.color.toUpperCase()
    }));

    // Find all products at once
    const products = await Product.find({
      companyId: req.user.companyId,
      $or: articles.map(a => ({
        article: a.article,
        size: a.size,
        color: { $regex: new RegExp(`^${a.color}$`, 'i') },
        isDeleted: false
      }))
    }).session(session);

    const productMap = new Map();
    products.forEach(p => {
      const key = `${p.article.toUpperCase()}-${p.size}-${p.color.toUpperCase()}`;
      productMap.set(key, p);
    });

    // Validate products exist
    for (const item of items) {
      const key = `${item.article.toUpperCase()}-${item.size}-${item.color.toUpperCase()}`;
      if (!productMap.has(key)) {
        throw new Error(`Product not found: ${item.article}-${item.size}-${item.color}`);
      }
    }

    // Single aggregate for ALL SalaryEntry totals
    const productIds = Array.from(productMap.values()).map(p => p._id);
    const salaryTotals = await SalaryEntry.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { _id: "$product", totalSalary: { $sum: "$cartons" } } }
    ]).session(session);

    const salaryMap = new Map();
    salaryTotals.forEach(s => salaryMap.set(s._id.toString(), s.totalSalary));

    // Single aggregate for ALL existing challan totals
    const challanTotals = await History.aggregate([
      {
        $match: {
          product: { $in: productIds },
          action: 'CHALLAN_OUT'
        }
      },
      {
        $group: {
          _id: "$product",
          totalOut: { $sum: { $abs: "$quantityChanged" } }
        }
      }
    ]).session(session);

    const challanMap = new Map();
    challanTotals.forEach(c => challanMap.set(c._id.toString(), c.totalOut || 0));

    // Validate stock + prepare bulk history
    const historyEntries = [];
    const productUpdates = [];

    for (const item of items) {
      const key = `${item.article.toUpperCase()}-${item.size}-${item.color.toUpperCase()}`;
      const product = productMap.get(key);
      
      const totalSalary = salaryMap.get(product._id.toString()) || 0;
      const existingOut = challanMap.get(product._id.toString()) || 0;
     // const availableCartons = Math.max(0, totalSalary - existingOut);
     const availableCartons = totalSalary - existingOut;


      // if (availableCartons < item.cartons) {
      //   throw new Error(`Stock insufficient for ${item.article}. Available: ${availableCartons}, Requested: ${item.cartons}`);
      // }

      // History entry (SAME LOGIC)
      historyEntries.push({
        product: product._id,
        action: 'CHALLAN_OUT',
        quantityChanged: -item.cartons,
        updatedBy: req.user?._id,
        updatedByName: (req.user?.username || 'SYSTEM').toUpperCase(),
        partyName: (req.body.partyName || '').toUpperCase(),
        invoiceNo: invoiceNo,
        challanId: savedChallan._id,
        companyId: req.user.companyId,
        note: `Challan OUT to ${(req.body.partyName||'').toUpperCase()} (inv ${invoiceNo})`,
        timestamp: new Date(),
      });

      // // Track product updates (SAME LOGIC)
      // productUpdates.push({
      //   productId: product._id,
      //   newCartons: Math.max(0, totalSalary - (existingOut + item.cartons)),
      //   newChallanedOut: existingOut + item.cartons
      // });
      productUpdates.push({
  productId: product._id,
  newCartons: totalSalary - (existingOut + item.cartons),
  newChallanedOut: existingOut + item.cartons
});

    }

    // Bulk create history (SAME DATA)
    if (historyEntries.length) {
      await History.insertMany(historyEntries, { session });
    }

    // Bulk update products (SAME CALCULATION)
    for (const update of productUpdates) {
      await Product.findByIdAndUpdate(
        update.productId,
        {
          cartons: update.newCartons,
          cartonsChallanedOut: update.newChallanedOut
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();
    res.status(201).json({ success: true, data: savedChallan });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Challan creation failed:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete challan with stock revert and history tracking
exports.deleteChallan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const challan = await Challan.findById(id).session(session);
    if (!challan) {
      return res.status(404).json({ success: false, error: 'Challan not found' });
    }

    // Revert stock for each item and update cartonsChallanedOut
    for (const item of challan.items) {
      const product = await Product.findOne({
        $expr: { $eq: [{ $toUpper: '$article' }, item.article.toUpperCase()] },
        size: item.size,
        color: { $regex: new RegExp(`^${item.color}$`, 'i') },
        isDeleted: false
      }).session(session);

      if (!product) {
        throw new Error(`Product not found for revert: ${item.article}-${item.size}-${item.color}`);
      }

      const revertCartons = item.cartons;

      // Add back stock
      product.cartons = (product.cartons || 0) + revertCartons;

      // Decrease cartonsChallanedOut but not below zero
      const newChallanedOut = Math.max(0, (product.cartonsChallanedOut || 0) - revertCartons);

      if (newChallanedOut === 0) {
        product.cartonsChallanedOut = undefined; // Unset if zero (cleans up the field)
      } else {
        product.cartonsChallanedOut = newChallanedOut;
      }

      await product.save({ session });

      // History entry for CHALLAN_IN (stock in cartons)
      await History.create([{
        product: product._id,
        action: 'CHALLAN_IN',
        quantityChanged: revertCartons,
        updatedBy: req.user?.id,
        updatedByName: (req.user?.username || '').toUpperCase() || 'SYSTEM',
        partyName: challan.partyName,
        invoiceNo: challan.invoiceNo,
        companyId: req.user.companyId,
        note: `Challan delete ⇒ IN for ${challan.partyName} (inv ${challan.invoiceNo})`,
        timestamp: new Date()
      }], { session });
    }

    // Delete challan doc
    await Challan.deleteOne({ _id: id }).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Challan deleted and stock reverted' });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
};


// Get all challans
exports.getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find({ companyId: req.user.companyId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: challans });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get a specific challan by ID
exports.getChallan = async (req, res) => {
  try {
    const challan = await Challan.findById(req.params.id);
    if (!challan) {
      return res.status(404).json({ success: false, error: 'Challan not found' });
    }
    res.status(200).json({ success: true, data: challan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get latest invoice number for challans (company-wise)
exports.getLatestInvoice = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const latestChallan = await Challan.findOne({ companyId }).sort({ createdAt: -1 });
    let latestInvoice = 0;
    if (latestChallan && latestChallan.invoiceNo) {
      const parts = latestChallan.invoiceNo.split('/');
      latestInvoice = parseInt(parts[0]) || 0;
    }
    res.status(200).json({ success: true, invoice: latestInvoice });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Stock check logic for cartons for list of items (can use for create challan validation)
exports.checkStock = async (req, res) => {
  const errors = [];

  await Promise.all(req.body.map(async (item, index) => {
    const product = await Product.findOne({
      article: item.article,
      size: item.size,
      color: item.color,
      isDeleted: false
    });

    if (!product) {
      errors.push({
        itemIndex: index,
        message: `${item.article}-${item.size}-${item.color} stock nahi hai`
      });
      return;
    }

    if (product.cartons < item.requiredCartons) {
      errors.push({
        itemIndex: index,
        message: `${item.article} ka stock kam hai! Uplabdh: ${product.cartons}, Maang: ${item.requiredCartons}`
      });
    }
  }));

  res.json({
    success: errors.length === 0,
    errors,
    hasErrors: errors.length > 0
  });
};

// ✅ FIXED: Calculate available stock from SalaryEntry - Challan
// exports.getStockAvailable = async (req, res) => {
//   const article = (req.query.article || '').trim().toUpperCase();
//   const size = (req.query.size || '').trim();
//   const color = (req.query.color || '').trim().toUpperCase();

//   if (!article || !size || !color) {
//     return res.status(400).json({ error: "Missing parameters" });
//   }
  
//   try {
//     const product = await Product.findOne({
//       $expr: { $eq: [{ $toUpper: "$article" }, article] },
//       size: { $regex: `^${size}$`, $options: 'i' },
//       color: { $regex: `^${color}$`, $options: 'i' },
//       isDeleted: false
//     });

//     if (!product) {
//       return res.json({ availableCartons: 0 });
//     }

//     // ✅ Calculate from SalaryEntry (source of truth)
//     const totalSalaryAgg = await SalaryEntry.aggregate([
//       { $match: { product: product._id } },
//       { $group: { _id: null, total: { $sum: "$cartons" } } }
//     ]);
//     const totalSalary = totalSalaryAgg[0]?.total || 0;

//     // ✅ Get existing challan out
//     const challanAgg = await History.aggregate([
//       {
//         $match: {
//           product: product._id,
//           action: 'CHALLAN_OUT'
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalOut: { $sum: { $abs: '$quantityChanged' } }
//         }
//       }
//     ]);
//     const totalChallanOut = challanAgg[0]?.totalOut || 0;

//     // ✅ Available = SalaryEntry - Challan
//  //   const availableCartons = Math.max(0, totalSalary - totalChallanOut);
//  const availableCartons = totalSalary - totalChallanOut;



//     res.json({ 
//       availableCartons,
//       totalStock: totalSalary,
//       challanedOut: totalChallanOut
//     });
//   } catch (err) {
//     console.error('Stock availability error:', err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// ✅ FIXED: Calculate available stock from SalaryEntry - Challan (with warning only)
exports.getStockAvailable = async (req, res) => {
  const article = (req.query.article || '').trim().toUpperCase();
  const size = (req.query.size || '').trim();
  const color = (req.query.color || '').trim().toUpperCase();

  if (!article || !size || !color) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    const product = await Product.findOne({
      $expr: { $eq: [{ $toUpper: "$article" }, article] },
      size: { $regex: `^${size}$`, $options: 'i' },
      color: { $regex: `^${color}$`, $options: 'i' },
      isDeleted: false
    });

    if (!product) {
      return res.json({
        availableCartons: 0,
        warning: false,
        warningMessage: null
      });
    }

    // ✅ SalaryEntry = source of truth
    const totalSalaryAgg = await SalaryEntry.aggregate([
      { $match: { product: product._id } },
      { $group: { _id: null, total: { $sum: "$cartons" } } }
    ]);
    const totalSalary = totalSalaryAgg[0]?.total || 0;

    // ✅ Total challan out
    const challanAgg = await History.aggregate([
      {
        $match: {
          product: product._id,
          action: 'CHALLAN_OUT'
        }
      },
      {
        $group: {
          _id: null,
          totalOut: { $sum: { $abs: '$quantityChanged' } }
        }
      }
    ]);
    const totalChallanOut = challanAgg[0]?.totalOut || 0;

    // ✅ Negative allowed
    const availableCartons = totalSalary - totalChallanOut;

    return res.json({
      availableCartons,
      totalStock: totalSalary,
      challanedOut: totalChallanOut,
      warning: availableCartons < 0,
      warningMessage:
        availableCartons < 0
          ? `⚠️ Stock negative ho jayega (${availableCartons})`
          : null
    });

  } catch (err) {
    console.error('Stock availability error:', err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
};

// controllers/challanController.js
exports.getPartyNames = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    const companyId = new mongoose.Types.ObjectId(req.user.companyId);

    const matchQuery = { companyId };
    if (search) matchQuery.partyName = { $regex: `^${search}`, $options: 'i' };

    const names = await Challan.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$partyName" } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: names.map(n => n._id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getArticleSuggestions = async (req, res) => {
  try {
    const search = (req.query.search || '').trim();
    if (!search) {
      return res.json({ success: true, data: [] });
    }

    // STARTS WITH regex
    const regex = new RegExp(`^${search}`, 'i');

    const articles = await Product.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(req.user.companyId), article: { $regex: regex }, isDeleted: false } },
      { $group: { _id: "$article" } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data: articles.map(a => a._id) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getPartySummaryV2 = async (req, res) => {
  try {
    const party = (req.query.party || '').trim().toUpperCase();
    const fromQ = req.query.from;
    const toQ = req.query.to;

    const match = {};
    if (party) match.partyName = party;

    if (fromQ || toQ) {
      match.createdAt = {};
      if (fromQ) {
        const start = new Date(fromQ);
        start.setHours(0,0,0,0);
        match.createdAt.$gte = start;
      }
      if (toQ) {
        const end = new Date(toQ);
        end.setHours(0,0,0,0);
        end.setDate(end.getDate() + 1); // next day 00:00 exclusive
        match.createdAt.$lt = end;
      }
    }

    const tz = 'Asia/Kolkata';

    const result = await Challan.aggregate([
      { $match: match },
      { $unwind: '$items' },
      { $project: {
          partyName: 1,
          createdAt: 1,
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: tz } },
          article: '$items.article',
          color: '$items.color',
          size: '$items.size',
          rate: '$items.rate',
          cartons: '$items.cartons',
          amount: '$items.amount'
      }},
      {
        $facet: {
          perParty: [
            { $group: { _id: '$partyName', cartons: { $sum: '$cartons' }, amount: { $sum: '$amount' } } },
            { $project: { _id: 0, partyName: '$_id', cartons: 1, amount: 1 } },
            { $sort: { partyName: 1 } }
          ],
          perArticle: [
            { $group: {
                _id: { party: '$partyName', article: '$article', color: '$color', size: '$size', rate: '$rate',date: '$date' },
                cartons: { $sum: '$cartons' },
                amount: { $sum: '$amount' }
            }},
            { $project: {
                _id: 0,
                partyName: '$_id.party',
                date: '$_id.date', 
                article: '$_id.article',
                color: '$_id.color',
                size: '$_id.size',
                rate: '$_id.rate',
                cartons: 1,
                amount: 1
            }},
            { $sort: { partyName: 1, article: 1, color: 1, size: 1, rate: 1 } }
          ],
          perDay: [
            { $group: { _id: { party: '$partyName', date: '$date' }, cartons: { $sum: '$cartons' }, amount: { $sum: '$amount' } } },
            { $project: { _id: 0, partyName: '$_id.party', date: '$_id.date', cartons: 1, amount: 1 } },
            { $sort: { date: 1 } }
          ]
        }
      }
    ]);

    res.json({ success: true, data: result[0] || { perParty: [], perArticle: [], perDay: [] } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// (getPartyNames is defined above, this duplicate removed)


// ✅ UPDATE CHALLAN (with stock revert + apply new stock)
exports.updateChallan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { items: newItems, ...otherFields } = req.body;

    // 1. Fetch existing challan
    const existingChallan = await Challan.findById(id).session(session);
    if (!existingChallan) {
      throw new Error('Challan not found');
    }

    const oldItems = existingChallan.items;
    const oldInvoiceNo = existingChallan.invoiceNo;

    // 2. REVERT OLD STOCK (add back old quantities)
    for (const oldItem of oldItems) {
      const product = await Product.findOne({
        $expr: { $eq: [{ $toUpper: '$article' }, oldItem.article.toUpperCase()] },
        size: oldItem.size,
        color: new RegExp(`^${oldItem.color}$`, 'i'),
        isDeleted: false
      }).session(session);

      if (!product) {
        throw new Error(`Product not found for revert: ${oldItem.article}-${oldItem.size}-${oldItem.color}`);
      }

      // Delete old history entry
      await History.deleteMany({
        product: product._id,
        action: 'CHALLAN_OUT',
        invoiceNo: oldInvoiceNo,
        'quantityChanged': -oldItem.cartons
      }).session(session);

      // Recalculate from SalaryEntry - remaining Challan
      const totalSalaryAgg = await SalaryEntry.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, total: { $sum: "$cartons" } } }
      ]).session(session);
      const totalSalary = totalSalaryAgg[0]?.total || 0;

      const challanAgg = await History.aggregate([
        {
          $match: {
            product: product._id,
            action: 'CHALLAN_OUT'
          }
        },
        {
          $group: {
            _id: null,
            totalOut: { $sum: { $abs: '$quantityChanged' } }
          }
        }
      ]).session(session);
      const totalChallanOut = challanAgg[0]?.totalOut || 0;

     // product.cartons = Math.max(0, totalSalary - totalChallanOut);
     product.cartons = totalSalary - totalChallanOut;

      product.cartonsChallanedOut = totalChallanOut;
      await product.save({ session });

      console.log(`✅ Stock reverted: ${oldItem.article} | New available: ${product.cartons}`);
    }

    // 3. APPLY NEW STOCK (deduct new quantities)
    for (const newItem of newItems) {
      const product = await Product.findOne({
        $expr: { $eq: [{ $toUpper: '$article' }, newItem.article.toUpperCase()] },
        size: newItem.size,
        color: new RegExp(`^${newItem.color}$`, 'i'),
        isDeleted: false
      }).session(session);

      if (!product) {
        throw new Error(`Product not found: ${newItem.article}-${newItem.size}-${newItem.color}`);
      }

      // Check available stock
      const totalSalaryAgg = await SalaryEntry.aggregate([
        { $match: { product: product._id } },
        { $group: { _id: null, total: { $sum: "$cartons" } } }
      ]).session(session);
      const totalSalary = totalSalaryAgg[0]?.total || 0;

      const challanAgg = await History.aggregate([
        {
          $match: {
            product: product._id,
            action: 'CHALLAN_OUT'
          }
        },
        {
          $group: {
            _id: null,
            totalOut: { $sum: { $abs: '$quantityChanged' } }
          }
        }
      ]).session(session);
      const existingChallanOut = challanAgg[0]?.totalOut || 0;
    //  const availableCartons = Math.max(0, totalSalary - existingChallanOut);
   const availableCartons = totalSalary - existingChallanOut;



      // if (availableCartons < newItem.cartons) {
      //   throw new Error(`Stock insufficient for ${newItem.article}. Available: ${availableCartons}, Requested: ${newItem.cartons}`);
      // }

      // ✅ Create new history entry WITH challanId
      await History.create([{
        product: product._id,
        action: 'CHALLAN_OUT',
        quantityChanged: -newItem.cartons,
        updatedBy: req.user?._id,
        updatedByName: (req.user?.username || 'SYSTEM').toUpperCase(),
        partyName: (req.body.partyName || '').toUpperCase(),
        invoiceNo: existingChallan.invoiceNo,
        challanId: existingChallan._id, // ✅ CRITICAL: Add this line
        note: `Challan UPDATED for ${(req.body.partyName||'').toUpperCase()} (inv ${existingChallan.invoiceNo})`,
        timestamp: new Date(),
      }], { session });

      // Recalculate product stock
      const newChallanAgg = await History.aggregate([
        {
          $match: {
            product: product._id,
            action: 'CHALLAN_OUT'
          }
        },
        {
          $group: {
            _id: null,
            totalOut: { $sum: { $abs: '$quantityChanged' } }
          }
        }
      ]).session(session);
      const newTotalChallanOut = newChallanAgg[0]?.totalOut || 0;

    //  product.cartons = Math.max(0, totalSalary - newTotalChallanOut);
    product.cartons = totalSalary - newTotalChallanOut;


      product.cartonsChallanedOut = newTotalChallanOut;
      await product.save({ session });

      console.log(`✅ New stock applied: ${newItem.article} | Available: ${product.cartons}`);
    }

    // 4. Update challan document
    existingChallan.items = newItems.map(i => ({
      ...i,
      article: i.article.toUpperCase(),
      color: i.color.toUpperCase()
    }));
    existingChallan.partyName = (otherFields.partyName || existingChallan.partyName).toUpperCase();
    existingChallan.station = otherFields.station || existingChallan.station;
    existingChallan.transport = otherFields.transport || existingChallan.transport;
    existingChallan.marka = otherFields.marka || existingChallan.marka;
    existingChallan.date = otherFields.date || existingChallan.date;

    await existingChallan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ 
      success: true, 
      message: 'Challan updated successfully',
      data: existingChallan 
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Challan update failed:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ MIGRATION: Fix missing challanIds in History
exports.migrateChallanIds = async (req, res) => {
  try {
    console.log('🔍 Starting challanId migration...');
    
    const histories = await History.find({ 
      action: 'CHALLAN_OUT', 
      challanId: { $exists: false } 
    });
    
    console.log(`📊 Found ${histories.length} entries without challanId`);
    
    let fixed = 0;
    let notFound = 0;
    
    for (const history of histories) {
      const challan = await Challan.findOne({ invoiceNo: history.invoiceNo });
      if (challan) {
        history.challanId = challan._id;
        await history.save();
        fixed++;
        console.log(`✅ Fixed: ${history.invoiceNo} → ${challan._id}`);
      } else {
        notFound++;
        console.log(`⚠️  No challan for invoice: ${history.invoiceNo}`);
      }
    }
    
    console.log(`\n✅ Migration Complete!`);
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Not Found: ${notFound}`);
    
    res.json({ 
      success: true, 
      message: 'Migration completed successfully',
      stats: {
        total: histories.length,
        fixed: fixed,
        notFound: notFound
      }
    });
    
  } catch (err) {
    console.error('❌ Migration failed:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};
