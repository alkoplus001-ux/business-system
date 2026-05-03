const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, { timestamps: true });

// Email unique per company (same email can exist in different companies)
UserSchema.index({ email: 1, companyId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', UserSchema);
