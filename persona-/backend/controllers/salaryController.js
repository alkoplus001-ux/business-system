

// exports.getSalaryReport = async (req, res) => {
//   try {
//     const { from, to, worker } = req.query;

//     const matchQuery = {
//       createdAt: {
//         $gte: new Date(from),
//         $lte: new Date(to + 'T23:59:59.999Z')
//       }
//     };
//     if (worker && worker !== 'all') {
//       matchQuery.createdBy = worker.toUpperCase();
//     }

//     // ✅ Date-wise separate entries ke liye aggregation modify karo
//     const salaryData = await SalaryEntry.aggregate([
//       { $match: matchQuery },
//       {
//         $group: {
//           _id: {
//             createdBy: "$createdBy",
//             article: "$article",
//             gender: "$gender",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
//           },
//           totalCartons: { $sum: "$cartons" },
//           totalPairs: { $sum: "$totalPairs" },
//           pairPerCarton: { $first: "$pairPerCarton" }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           createdBy: "$_id.createdBy",
//           article: "$_id.article",
//           gender: "$_id.gender",
//           date: "$_id.date",
//           cartons: "$totalCartons",
//           pairs: "$totalPairs",
//           pairPerCarton: "$pairPerCarton"
//         }
//       },
//       { $sort: { createdBy: 1, date: 1, article: 1 } }
//     ]);

//     const workerContributions = {};
//     salaryData.forEach(record => {
//       const w = record.createdBy;
//       if (!workerContributions[w]) {
//         workerContributions[w] = { worker: w, articles: [] };
//       }
//       workerContributions[w].articles.push({
//         date: record.date,
//         article: record.article,
//         gender: record.gender,
//         cartons: record.cartons,
//         pairPerCarton: record.pairPerCarton,
//         pairs: record.pairs
//       });
//     });

//     const report = Object.values(workerContributions);
//     res.json({ success: true, data: report });

//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };



// exports.getSalaryReport = async (req, res) => {
//   try {
//     const { from, to, worker } = req.query;

//     const matchQuery = {
//       createdAt: {
//         $gte: new Date(from),
//         $lte: new Date(to + 'T23:59:59.999Z')
//       }
//     };
//     if (worker && worker !== 'all') {
//       matchQuery.createdBy = worker.toUpperCase();
//     }

//     // ✅ CRITICAL: Only get entries where product still exists
//     const salaryData = await SalaryEntry.aggregate([
//       { $match: matchQuery },
//       {
//         $lookup: {
//           from: 'products',
//           localField: 'product',
//           foreignField: '_id',
//           as: 'productInfo'
//         }
//       },
//       {
//         $match: {
//           'productInfo.isDeleted': { $ne: true }, // ✅ Only non-deleted products
//           'productInfo': { $ne: [] }, // ✅ Product must exist
//           'cartons': { $gt: 0 } // ✅ Only entries with cartons > 0
//         }
//       },
//       {
//         $group: {
//           _id: {
//             createdBy: "$createdBy",
//             article: "$article",
//             gender: "$gender",
//             date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
//           },
//           totalCartons: { $sum: "$cartons" },
//           totalPairs: { $sum: "$totalPairs" },
//           pairPerCarton: { $first: "$pairPerCarton" }
//         }
//       },
//       {
//         $match: {
//           totalCartons: { $gt: 0 } // ✅ Only show entries with actual cartons
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           createdBy: { $trim: { input: "$_id.createdBy" } }, // ✅ Trim whitespace
//           article: "$_id.article",
//           gender: "$_id.gender",
//           date: "$_id.date",
//           cartons: "$totalCartons",
//           pairs: "$totalPairs",
//           pairPerCarton: "$pairPerCarton"
//         }
//       },
//       { $sort: { createdBy: 1, date: 1, article: 1 } }
//     ]);

//     // ✅ CLEAN worker list - remove duplicates properly
//     const workerContributions = {};
//     salaryData.forEach(record => {
//       const w = record.createdBy?.toUpperCase().trim(); // ✅ Normalize worker name
//       if (!w) return; // Skip empty names
      
//       if (!workerContributions[w]) {
//         workerContributions[w] = { worker: w, articles: [] };
//       }
//       workerContributions[w].articles.push({
//         date: record.date,
//         article: record.article,
//         gender: record.gender,
//         cartons: record.cartons,
//         pairPerCarton: record.pairPerCarton,
//         pairs: record.pairs
//       });
//     });

//     const report = Object.values(workerContributions);
//     res.json({ success: true, data: report });

//   } catch (err) {
//     console.error('Salary report error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
// exports.getSalaryReport = async (req, res) => {
//   try {
//     const { from, to, worker } = req.query;

//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     toDate.setHours(23, 59, 59, 999);

//     const matchQuery = {};
//     if (worker && worker !== 'all') {
//       matchQuery.createdBy = worker.toUpperCase();
//     }

//     // ✅ Get ALL SalaryEntries (for product validation)
//     const allSalaryEntries = await SalaryEntry.find({
//       ...(Object.keys(matchQuery).length > 0 ? matchQuery : {})
//     }).populate('product').lean();

//     // ✅ Get History entries in date range
//     const historyEntries = await History.find({
//       action: { $in: ['UPDATE', 'ADD'] },
//       timestamp: { $gte: fromDate, $lte: toDate },
//       ...(worker && worker !== 'all' ? { updatedByName: worker.toUpperCase() } : {})
//     }).populate('product').lean();

//     console.log(`🔍 History entries in range: ${historyEntries.length}`);

//     // ✅ Build date-wise salary map
//     const salaryMap = new Map();

//     for (let historyEntry of historyEntries) {
//       if (!historyEntry.product || historyEntry.product.isDeleted) continue;

//       const product = historyEntry.product;
//       const user = historyEntry.updatedByName?.toUpperCase().trim();
//       const dateStr = historyEntry.timestamp.toISOString().split('T')[0];
      
//       const key = `${user}_${product.article}_${product.gender}_${dateStr}`;
      
//       if (!salaryMap.has(key)) {
//         salaryMap.set(key, {
//           createdBy: user,
//           article: product.article,
//           gender: product.gender,
//           date: dateStr,
//           cartons: 0,
//           pairs: 0,
//           pairPerCarton: product.pairPerCarton
//         });
//       }
      
//       const entry = salaryMap.get(key);
//       entry.cartons += historyEntry.quantityChanged;
//       entry.pairs += historyEntry.quantityChanged * product.pairPerCarton;
      
//       console.log(`   ✅ ${dateStr} | ${user} | ${product.article} ${product.gender} | +${historyEntry.quantityChanged} cartons (${historyEntry.action})`);
//     }

//     // ✅ Convert to array and filter positive cartons
//     const results = Array.from(salaryMap.values()).filter(entry => entry.cartons > 0);

//     console.log(`📊 Final entries: ${results.length}`);

//     // ✅ Group by worker
//     const workerContributions = {};
//     results.forEach(record => {
//       const w = record.createdBy?.toUpperCase().trim();
//       if (!w) return;
      
//       if (!workerContributions[w]) {
//         workerContributions[w] = { worker: w, articles: [] };
//       }
      
//       workerContributions[w].articles.push({
//         date: record.date,
//         article: record.article,
//         gender: record.gender,
//         cartons: record.cartons,
//         pairPerCarton: record.pairPerCarton,
//         pairs: record.pairs
//       });
//     });

//     const report = Object.values(workerContributions);
    
//     // ✅ Sort articles by date
//     report.forEach(w => {
//       w.articles.sort((a, b) => new Date(a.date) - new Date(b.date));
//       const total = w.articles.reduce((sum, a) => sum + a.cartons, 0);
//       console.log(`   👤 ${w.worker}: ${w.articles.length} entries, ${total} total cartons`);
//       w.articles.forEach(a => {
//         console.log(`      📅 ${a.date} | ${a.article} ${a.gender} | ${a.cartons} cartons`);
//       });
//     });

//     res.json({ success: true, data: report });

//   } catch (err) {
//     console.error('❌ Salary report error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };
const mongoose = require('mongoose');
const SalaryEntry = require('../models/SalaryEntry');
const Product = require('../models/Product');
const History = require('../models/History');
exports.getSalaryReport = async (req, res) => {
  try {
    const { from, to, worker } = req.query;

    const fromDate = new Date(from);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    // ✅ OPTIMIZATION: Single aggregation with proper indexing
    const pipeline = [
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.user.companyId),
          action: { $in: ['UPDATE', 'ADD'] },
          timestamp: { $gte: fromDate, $lte: toDate },
          ...(worker && worker !== 'all' ? { updatedByName: worker.toUpperCase() } : {})
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $match: {
          'productInfo.isDeleted': { $ne: true },
          'productInfo': { $ne: [] }
        }
      },
      {
        $group: {
          _id: {
            user: { $toUpper: { $trim: { input: '$updatedByName' } } },
            article: { $arrayElemAt: ['$productInfo.article', 0] },
            gender: { $arrayElemAt: ['$productInfo.gender', 0] },
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
          },
          cartons: { $sum: '$quantityChanged' },
          pairPerCarton: { $first: { $arrayElemAt: ['$productInfo.pairPerCarton', 0] } }
        }
      },
      {
        $match: {
          cartons: { $gt: 0 }
        }
      },
      {
        $project: {
          _id: 0,
          createdBy: '$_id.user',
          article: '$_id.article',
          gender: '$_id.gender',
          date: '$_id.date',
          cartons: 1,
          pairPerCarton: 1,
          pairs: { $multiply: ['$cartons', '$pairPerCarton'] }
        }
      },
      {
        $sort: { createdBy: 1, date: 1, article: 1 }
      }
    ];

    const results = await History.aggregate(pipeline);

    // ✅ Group by worker (fast in-memory operation)
    const workerContributions = {};
    results.forEach(record => {
      const w = record.createdBy?.toUpperCase().trim();
      if (!w) return;
      
      if (!workerContributions[w]) {
        workerContributions[w] = { worker: w, articles: [] };
      }
      
      workerContributions[w].articles.push({
        date: record.date,
        article: record.article,
        gender: record.gender,
        cartons: record.cartons,
        pairPerCarton: record.pairPerCarton,
        pairs: record.pairs
      });
    });

    const report = Object.values(workerContributions);
    res.json({ success: true, data: report });

  } catch (err) {
    console.error('❌ Salary report error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};


// Get Salary Report
exports.updateSalaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { cartons, pairPerCarton, gender } = req.body;

    const totalPairs = cartons * pairPerCarton;

    const updateData = {
      cartons,
      pairPerCarton,
      totalPairs
    };

    // ✅ Agar gender aaya to update karo
    if (gender) {
      updateData.gender = gender.toLowerCase();
    }

    const updatedEntry = await SalaryEntry.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ success: false, message: "Entry not found" });
    }

    res.json({ success: true, data: updatedEntry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Yahan add kar - existing exports ke saath
exports.debugSalaryEntries = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    const entries = await SalaryEntry.find({
      companyId: req.user.companyId,
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to + 'T23:59:59.999Z')
      }
    }).populate('product');
    
    console.log('🔍 Raw Salary Entries:', entries.length);
    entries.forEach(e => {
      console.log(`   📝 ${e.createdBy} | ${e.article} | ${e.cartons} cartons | Product: ${e.product ? '✅' : '❌'}`);
    });
    
    res.json({ success: true, entries });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.softDeleteSalaryEntry = async (req, res) => {
  try {
    const { productId, createdBy } = req.body;
    const worker = createdBy.toUpperCase();

    const entry = await SalaryEntry.findOneAndUpdate(
      { product: productId, createdBy: worker },
      { cartons: 0, totalPairs: 0 }
    );

    const sumCartonsAgg = await SalaryEntry.aggregate([
      { $match: { product: entry.product } },
      { $group: { _id: null, total: { $sum: "$cartons" } } }
    ]);
    await Product.findByIdAndUpdate(
      entry.product,
      { cartons: sumCartonsAgg?.total || 0 }
    );

    res.json({ success: true, message: "Entry soft-deleted, stock updated" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.patchSalaryEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { cartons } = req.body;

    // 1. SalaryEntry लो
    const entry = await SalaryEntry.findById(id);
    if (!entry) return res.status(404).json({ success: false, error: "SalaryEntry not found." });

    // 2. Update करो
    const oldCartons = entry.cartons;
    entry.cartons = Number(cartons);
    entry.totalPairs = entry.cartons * entry.pairPerCarton;
    await entry.save();

    // 3. Cartons aggregate करो और Product को update करो – यहां **new** ज़रूरी है!
    const prodId = new mongoose.Types.ObjectId(entry.product.toString());
    const [{ total = 0 } = {}] = await SalaryEntry.aggregate([
      { $match: { product: prodId } },
      { $group: { _id: null, total: { $sum: "$cartons" } } }
    ]);
    await Product.findByIdAndUpdate(prodId, { cartons: total });

    // 4. History log कर दो
    await History.create({
      product: entry.product,
      action: 'UPDATE',
      salaryEntryId: entry._id,
      oldValue: oldCartons,
      newValue: entry.cartons,
      quantityChanged: entry.cartons - oldCartons,
      updatedBy: req.user?.id,
      updatedByName: entry.createdBy,
      companyId: req.user?.companyId,
      note: `Edited cartons from ${oldCartons} to ${entry.cartons} for ${entry.createdBy}`,
      timestamp: new Date(),
    });

    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Yeh naya function add karein
// Is naye function ko file mein kahin bhi (doosre exports ke saath) add karo

exports.getSalaryEntryById = async (req, res) => {
  try {
    const entry = await SalaryEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Salary entry not found" });
    }
    res.json({ success: true, data: entry });
  } catch (err) {
    // Agar ID ka format galat hai to 400 error bhejo
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};
