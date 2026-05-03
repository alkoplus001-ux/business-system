const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  gst: { type: String, default: '' },
  logo: { type: String, default: '' },
  tallyCompanyName: { type: String, default: '' }   // Tally mein exact company name
}, { timestamps: true });

module.exports = mongoose.model('Company', CompanySchema);
