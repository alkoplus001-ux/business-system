const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  partyName:    { type: String, required: true, trim: true, uppercase: true },
  challanId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Challan' },
  invoiceNo:    { type: String },
  amount:       { type: Number, required: true },
  paymentDate:  { type: Date, required: true, default: Date.now },
  paymentMode:  { type: String, enum: ['cash', 'cheque', 'upi', 'bank_transfer', 'other'], default: 'cash' },
  referenceNo:  { type: String, default: '' },
  note:         { type: String, default: '' },
  companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
