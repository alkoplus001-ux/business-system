const Product = require('../models/Product');

const getProductionReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({ message: 'Both from and to dates are required' });
    }

    const query = {
      isDeleted: false,
      createdAt: {
        $gte: new Date(from),
        $lte: new Date(to + 'T23:59:59.999Z')
      }
    };

    // Fetch all production records
    const records = await Product.find(query)
      .select('article cartons pairPerCarton totalPairs createdAt createdBy')
      .sort({ createdAt: 1 });

    // Create worker production map
    const workerProduction = new Map();
    
    records.forEach(record => {
      const worker = record.createdBy.toUpperCase();
      const article = record.article;
      const key = `${worker}_${article}`;
      
      if (!workerProduction.has(key)) {
        workerProduction.set(key, {
          worker,
          article,
          totalPairs: 0,
          entries: []
        });
      }
      
      const production = workerProduction.get(key);
      production.totalPairs += record.totalPairs;
      production.entries.push({
        date: record.createdAt.toISOString().split('T')[0],
        cartons: record.cartons,
        pairs: record.totalPairs
      });
    });

    // Convert to array format
    const report = Array.from(workerProduction.values());
    const workers = [...new Set(report.map(r => r.worker))];

    res.json({ report, workers });
  } catch (err) {
    console.error('Error generating production report:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getProductionReport };
