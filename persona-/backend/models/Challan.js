
const mongoose = require('mongoose');

const ChallanItemSchema = new mongoose.Schema({
  article: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  size: { 
    type: String, 
    required: true,
    trim: true
  },
  color: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  pairPerCarton: {
    type: Number,
    required: true,
    min: 1
  },
  cartons: {
    type: Number,
    required: true,
    min: 1
  },
  totalPair: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
}, { _id: false });

const ChallanSchema = new mongoose.Schema({
  partyName: { 
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  date: { 
    type: Date, 
    required: true,
    default: Date.now
  },
  invoiceNo: { 
    type: String, 
    required: true,
    
  },
  station: {
    type: String, 
    required: true,
    trim: true,
    uppercase: true
  },
  marka: { 
    type: String,
    trim: true,
    uppercase: true
  },
  transport: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  // ✅ Remove cartons requirement from main schema
  items: [ChallanItemSchema],

  // GST fields
  isInterState:  { type: Boolean, default: false },
  gstPercent:    { type: Number, default: 0 },
  cgst:          { type: Number, default: 0 },
  sgst:          { type: Number, default: 0 },
  igst:          { type: Number, default: 0 },
  totalAmountWithGST: { type: Number, default: 0 },

  // Payment tracking
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  paidAmount:    { type: Number, default: 0 },
  dueDate:       { type: Date },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdByName: { type: String },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// ✅ Virtual field for total cartons
ChallanSchema.virtual('totalCartons').get(function() {
  return this.items.reduce((total, item) => total + item.cartons, 0);
});

// ✅ Virtual field for total amount  
ChallanSchema.virtual('totalAmount').get(function() {
  return this.items.reduce((total, item) => total + item.amount, 0);
});

// ✅ Pre-save hook
ChallanSchema.pre('save', function(next) {
  this.items.forEach(item => {
    item.totalPair = item.cartons * item.pairPerCarton;
    item.amount = item.totalPair * item.rate;
  });
  next();
});

module.exports = mongoose.model('Challan', ChallanSchema);
