const mongoose = require('mongoose');
const Product = require('./models/Product');  // ← controllers/models se import
require('dotenv').config();

async function fixFL366() {
  try {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGODB_URI .env me nahi mila!');
    }

    console.log('🔗 MongoDB Atlas connecting...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('✅ Connected! FL-366 checking...');

    const totalFL = await Product.countDocuments({ 
      article: 'FL-366', 
      isDeleted: false 
    });
    console.log(`📊 Total FL-366: ${totalFL}`);

    const nonEvaCount = await Product.countDocuments({ 
      article: 'FL-366', 
      stockType: { $ne: 'eva' }, 
      isDeleted: false 
    });
    console.log(`⚠️ Non-EVA: ${nonEvaCount}`);

    if (nonEvaCount === 0) {
      console.log('✅ Already perfect!');
      process.exit(0);
    }

    console.log('🔄 Fixing to EVA...');
    const result = await Product.updateMany(
      { article: 'FL-366', isDeleted: false, stockType: { $ne: 'eva' } },
      { $set: { stockType: 'eva', updatedAt: new Date() } }
    );

    console.log('✅ FIXED!');
    console.log(`✅ Changed: ${result.modifiedCount}`);

    const finalCheck = await Product.find({ 
      article: 'FL-366', isDeleted: false 
    }).select('stockType').lean();
    
    console.log(`🎉 All EVA? ${finalCheck.every(p => p.stockType === 'eva') ? '✅ YES' : '❌ NO'}`);

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

fixFL366();
