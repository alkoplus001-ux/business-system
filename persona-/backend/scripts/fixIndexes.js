require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;

  // Drop ALL existing indexes on users (except _id)
  try {
    const userIndexes = await db.collection('users').indexes();
    console.log('Current user indexes:', userIndexes.map(i => i.name));

    for (const idx of userIndexes) {
      if (idx.name !== '_id_') {
        await db.collection('users').dropIndex(idx.name);
        console.log(`✅ Dropped index: ${idx.name}`);
      }
    }
  } catch (err) {
    console.log('Index drop error:', err.message);
  }

  // Delete users with null email (old schema garbage data)
  try {
    const result = await db.collection('users').deleteMany({
      $or: [{ email: null }, { email: { $exists: false } }]
    });
    console.log(`✅ Deleted ${result.deletedCount} old users with null email`);
  } catch (err) {
    console.log('Delete error:', err.message);
  }

  // Create correct compound unique index
  try {
    await db.collection('users').createIndex(
      { email: 1, companyId: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Created compound unique index (email + companyId) on users');
  } catch (err) {
    console.log('Index create error:', err.message);
  }

  const finalIndexes = await db.collection('users').indexes();
  console.log('Final user indexes:', finalIndexes.map(i => i.name));

  await mongoose.disconnect();
  console.log('Done.');
}

fixIndexes().catch(console.error);
