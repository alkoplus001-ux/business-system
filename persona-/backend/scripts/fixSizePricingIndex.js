require('dotenv').config();
const mongoose = require('mongoose');

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  try {
    const indexes = await db.collection('sizepricings').indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        await db.collection('sizepricings').dropIndex(idx.name);
        console.log(`Dropped: ${idx.name}`);
      }
    }

    await db.collection('sizepricings').createIndex(
      { size: 1, stockType: 1, companyId: 1 },
      { unique: true, sparse: true }
    );
    console.log('Created compound index: size+stockType+companyId');
  } catch (err) {
    console.log('Error:', err.message);
  }

  await mongoose.disconnect();
  console.log('Done.');
}

fix().catch(console.error);
