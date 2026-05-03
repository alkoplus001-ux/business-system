require('dotenv').config();
const mongoose = require('mongoose');
const History = require('../models/History');
const Challan = require('../models/Challan');

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});

async function fixChallanIds() {
  console.log('🔍 Finding history entries without challanId...');
  
  const histories = await History.find({ 
    action: 'CHALLAN_OUT', 
    challanId: { $exists: false } 
  });
  
  console.log(`📊 Found ${histories.length} entries to fix`);

  let fixed = 0;
  for (const history of histories) {
    const challan = await Challan.findOne({ invoiceNo: history.invoiceNo });
    if (challan) {
      history.challanId = challan._id;
      await history.save();
      fixed++;
      console.log(`✅ Fixed: ${history.invoiceNo}`);
    } else {
      console.log(`⚠️  No challan found for invoice: ${history.invoiceNo}`);
    }
  }
  
  console.log(`\n✅ Done! Fixed ${fixed} entries`);
  process.exit();
}

fixChallanIds().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
