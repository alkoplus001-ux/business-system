const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', CounterSchema);

async function getNextInvoiceNumber() {
  const year = new Date().getFullYear();

  const counter = await Counter.findOneAndUpdate(
    { name: `invoice_${year}` },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  if (!counter || typeof counter.value !== 'number') {
    throw new Error('Failed to generate invoice number');
  }

  const padded = String(counter.value).padStart(3, '0'); // 🔁 3 digits for safety
  return `${padded}/${year}`; // e.g., 001/2025
}

module.exports = getNextInvoiceNumber;
