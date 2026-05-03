
// const mongoose = require('mongoose');

// const ProductSchema = new mongoose.Schema({
//   article: { type: String, required: true },
//   image: { type: String }, 
//   stockType: { type: String },
//   gender: { type: String },
//   mrp: { type: Number },
//   rate: { type: Number },
//   series: { type: String }, 
//   size: { type: String },
//   color: { type: String },

//   cartons: { type: Number, default: 0 },            
//   pairPerCarton: { type: Number, default: 0 },      
//   totalPairs: { type: Number, default: 0 },         

//   createdBy: { type: String },
//   noOfCrtn: { type: Number },
//   isDeleted: { type: Boolean, default: false }
// },
//  {
//   timestamps: true 
// });


// ProductSchema.pre('save', function (next) {
//   this.totalPairs = this.cartons * this.pairPerCarton;
//   next();
// });

// module.exports = mongoose.model('Product', ProductSchema);
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  article: { type: String, required: true },
  image: { type: String }, 
  stockType: { type: String },
  gender: { type: String },
  mrp: { type: Number },
  rate: { type: Number },
  series: { type: String }, 
  size: { type: String },
  color: { type: String },

  cartons: { type: Number, default: 0 },            
  pairPerCarton: { type: Number, default: 0 },      
  totalPairs: { type: Number, default: 0 },         
// Add this field to track total cartons already challaned out
  cartonsChallanedOut: { type: Number, default: 0 },
  
  createdBy: { type: String },
  noOfCrtn: { type: Number },
  isDeleted: { type: Boolean, default: false },

  // ✅ Correct location for history field
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },

  history: [
    {
      action: String,
      updatedBy: String,
      updatedByName: String,
      changes: Object,
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

ProductSchema.pre('save', function (next) {
  this.totalPairs = this.cartons * this.pairPerCarton;
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
