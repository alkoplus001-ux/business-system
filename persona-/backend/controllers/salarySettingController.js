const Product = require('../models/Product');

const getProductionReport = async (req, res) => {
  try {
    const { from, to, createdBy } = req.query;
    
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

    if (createdBy && createdBy !== 'all') {
      query.createdBy = createdBy.toUpperCase();
    }

    // Fetch individual production records without aggregation
    const records = await Product.find(query)
      .select('createdBy article cartons pairPerCarton totalPairs createdAt')
      .sort({ createdAt: 1 });

    // Create report with individual entries
    const report = records.map(r => ({
      createdBy: r.createdBy.toUpperCase(),
      article: r.article,
      cartons: r.cartons,
      pairPerCarton: r.pairPerCarton,
      totalPairs: r.totalPairs,
      date: r.createdAt.toISOString().split('T')[0],
      entryId: r._id.toString() // Add unique ID for each entry
    }));

    // Get distinct worker names for dropdown
    const workers = [...new Set(records.map(r => r.createdBy.toUpperCase()))];

    res.json({ report, workers });
  } catch (err) {
    console.error('Error generating salary report:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { getProductionReport };
