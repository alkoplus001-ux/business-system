const mongoose = require('mongoose');

const SalaryEntrySchema = new mongoose.Schema({
  createdBy: { type: String, required: true },
  article: { type: String, required: true },
    gender: { type: String, required: true },
  cartons: { type: Number, required: true },
  pairPerCarton: { type: Number, required: true },
  totalPairs: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

module.exports = mongoose.model('SalaryEntry', SalaryEntrySchema);
