const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historySchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  action: {
    type: String,
    enum: [
      'ADD', 'UPDATE', 'DELETE', 'CHALLAN_OUT', 'CHALLAN_IN',
      'BULK_DELETE', 'BULK_RESTORE', 'IMPORT'
    ],
    required: true
  },
   salaryEntryId: { type: Schema.Types.ObjectId, ref: 'SalaryEntry' },
  quantityChanged: { type: Number, default: 0 }, // kitne pairs me change hua (+/-)
   partyName: { type: String, trim: true, uppercase: true }, // optional, backward-safe
  invoiceNo: { type: String, trim: true }, 
  challanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challan' },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }, // user ka ObjectId
  updatedByName: { type: String }, // username (e.g. createdBy)
  articleText: { type: String, index: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true }
});

 module.exports = mongoose.model('History', historySchema);
