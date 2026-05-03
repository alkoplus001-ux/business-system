// node scripts/fixHistoryArticleText.js
const mongoose = require('mongoose');
const History = require('../models/History');
const Product = require('../models/Product');

const MONGODB_URI = 'mongodb://localhost:27017/your_db_name'; // apna URI

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('Connected. Updating history.articleText...');

    const cursor = History.find({
      $or: [
        { articleText: { $exists: false } },
        { articleText: null },
        { articleText: '' },
      ],
    })
      .populate('product', 'article')
      .cursor();

    let count = 0;

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      if (doc.product && doc.product.article) {
        doc.articleText = doc.product.article;
        await doc.save();
        count++;
        if (count % 100 === 0) {
          console.log(`Updated ${count} history docs`);
        }
      }
    }

    console.log(`Done. Updated total ${count} documents.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
