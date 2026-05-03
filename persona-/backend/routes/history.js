const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Challan = require('../models/Challan');
const SalaryEntry = require('../models/SalaryEntry');

// 1. Product History Logs
router.get('/product-logs', async (req, res) => {
  try {
    const history = await Product.aggregate([
      { $match: { history: { $exists: true, $ne: [] } } },
      { $unwind: "$history" },
      {
        $project: {
          article: "$article",
          gender: "$gender",
          size: "$size",
          color: "$color",
          action: "$history.action",
          updatedBy: "$history.updatedByName",
          timestamp: "$history.timestamp",
          changes: "$history.changes"
        }
      },
      { $sort: { timestamp: -1 } }
    ]);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Challan Summary
router.get('/challan-summary', async (req, res) => {
  try {
    const { party, article, startDate, endDate } = req.query;
    const query = {};

    if (party) query.partyName = { $regex: new RegExp(party, 'i') };
    if (article) query['items.article'] = { $regex: new RegExp(article, 'i') };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const challans = await Challan.find(query)
      .sort({ date: -1 })
      .lean();

    const summary = challans.map(c => {
      const totalCartons = c.items?.reduce((sum, item) => sum + (item.cartons || 0), 0) || 0;
      const totalAmount = c.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const articles = [...new Set(c.items.map(item => item.article))];

      return {
        party: c.partyName,
        date: c.date,
        invoiceNo: c.invoiceNo,
        articles: articles.join(', '),
        totalCartons,
        totalAmount,
        createdBy: c.createdByName
      };
    });

    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// 3. Salary Report
router.get('/salary-summary', async (req, res) => {
  try {
    const { worker, startDate, endDate } = req.query;
    const query = {};

    // 👷 Match either createdByName or createdBy if worker filter is provided
    if (worker) {
      query.$or = [
        { createdByName: { $regex: new RegExp(worker, 'i') } },
        { createdBy: { $regex: new RegExp(worker, 'i') } }
      ];
    }

    // 📅 Date filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // 📄 Fetch entries
    const entries = await SalaryEntry.find(query)
      .sort({ createdAt: -1 })
      .select("createdBy createdByName article cartons totalPairs createdAt");

    // 🧠 Group by worker
    const grouped = {};
    for (const entry of entries) {
      const name = (entry.createdByName || entry.createdBy || 'Unknown').trim();
      if (!grouped[name]) {
        grouped[name] = {
          createdBy: entry.createdBy,
          createdByName: entry.createdByName || entry.createdBy || 'Unknown',
          totalPairs: 0,
          totalCartons: 0,
          records: []
        };
      }

      grouped[name].totalPairs += entry.totalPairs;
      grouped[name].totalCartons += entry.cartons;
      grouped[name].records.push({
        article: entry.article,
        cartons: entry.cartons,
        pairs: entry.totalPairs,
        date: entry.createdAt
      });
    }

    // 🧾 Send result
    res.json({ success: true, data: Object.values(grouped) });

  } catch (err) {
    console.error("Salary Summary Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});



module.exports = router;
