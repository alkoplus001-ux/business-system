const Challan  = require('../models/Challan');
const Payment  = require('../models/Payment');
const Product  = require('../models/Product');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────
// 1. RECORD PAYMENT — Party ne payment di
// ─────────────────────────────────────────────
exports.recordPayment = async (req, res) => {
  try {
    const { partyName, challanId, invoiceNo, amount, paymentDate, paymentMode, referenceNo, note } = req.body;
    const companyId = req.user.companyId;

    if (!partyName || !amount) return res.status(400).json({ error: 'Party name aur amount required hai' });

    const payment = await Payment.create({
      partyName: partyName.toUpperCase(),
      challanId: challanId || null,
      invoiceNo: invoiceNo || '',
      amount: Number(amount),
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      paymentMode: paymentMode || 'cash',
      referenceNo: referenceNo || '',
      note: note || '',
      companyId
    });

    // Agar specific challan ke liye payment hai toh uska status update karo
    if (challanId) {
      const challan = await Challan.findOne({ _id: challanId, companyId });
      if (challan) {
        const totalAmount = challan.totalAmountWithGST || challan.items.reduce((s, i) => s + i.amount, 0);
        const allPayments = await Payment.aggregate([
          { $match: { challanId: new mongoose.Types.ObjectId(challanId), companyId: new mongoose.Types.ObjectId(companyId) } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPaid = allPayments[0]?.total || 0;
        challan.paidAmount = totalPaid;
        challan.paymentStatus = totalPaid >= totalAmount ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
        await challan.save();
      }
    }

    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 2. GET PAYMENTS — Sari payments
// ─────────────────────────────────────────────
exports.getPayments = async (req, res) => {
  try {
    const { from, to, party, mode } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (mode) filter.paymentMode = mode;
    if (from || to) {
      filter.paymentDate = {};
      if (from) filter.paymentDate.$gte = new Date(from);
      if (to) filter.paymentDate.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const payments = await Payment.find(filter).sort({ paymentDate: -1 });
    const total = payments.reduce((s, p) => s + p.amount, 0);
    res.json({ success: true, data: payments, total, count: payments.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 3. OUTSTANDING RECEIVABLES
// ─────────────────────────────────────────────
exports.getOutstanding = async (req, res) => {
  try {
    const { party, status } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId, paymentStatus: { $in: ['pending', 'partial'] } };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (status) filter.paymentStatus = status;

    const challans = await Challan.find(filter).sort({ date: 1 });

    const data = challans.map(c => {
      const invoiceTotal = c.totalAmountWithGST || c.items.reduce((s, i) => s + i.amount, 0);
      const outstanding  = invoiceTotal - (c.paidAmount || 0);
      return {
        _id:          c._id,
        invoiceNo:    c.invoiceNo,
        date:         c.date,
        partyName:    c.partyName,
        station:      c.station,
        invoiceTotal,
        paidAmount:   c.paidAmount || 0,
        outstanding,
        paymentStatus: c.paymentStatus,
        dueDate:      c.dueDate,
        overdue:      c.dueDate ? new Date() > new Date(c.dueDate) : false
      };
    });

    // Party-wise summary
    const partyMap = {};
    data.forEach(r => {
      if (!partyMap[r.partyName]) partyMap[r.partyName] = { partyName: r.partyName, invoices: 0, totalOutstanding: 0 };
      partyMap[r.partyName].invoices++;
      partyMap[r.partyName].totalOutstanding += r.outstanding;
    });

    const totalOutstanding = data.reduce((s, r) => s + r.outstanding, 0);

    res.json({
      success: true,
      data,
      partySummary: Object.values(partyMap).sort((a, b) => b.totalOutstanding - a.totalOutstanding),
      totalOutstanding,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 4. P&L STATEMENT
// ─────────────────────────────────────────────
exports.getPLStatement = async (req, res) => {
  try {
    const { from, to } = req.query;
    const companyId = req.user.companyId;

    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to)   dateFilter.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));

    const challanFilter = { companyId };
    if (from || to) challanFilter.date = dateFilter;

    // INCOME — challan se sales
    const challans = await Challan.find(challanFilter);
    let totalSales = 0, totalGST = 0, totalCartonsSold = 0, totalPairsSold = 0;
    const salesByMonth = {};

    challans.forEach(c => {
      const baseAmount = c.items.reduce((s, i) => s + i.amount, 0);
      const gstAmount  = (c.cgst || 0) + (c.sgst || 0) + (c.igst || 0);
      totalSales  += baseAmount;
      totalGST    += gstAmount;
      c.items.forEach(i => { totalCartonsSold += i.cartons; totalPairsSold += i.totalPair; });

      const monthKey = new Date(c.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      if (!salesByMonth[monthKey]) salesByMonth[monthKey] = { sales: 0, gst: 0, cartons: 0 };
      salesByMonth[monthKey].sales   += baseAmount;
      salesByMonth[monthKey].gst     += gstAmount;
      salesByMonth[monthKey].cartons += c.items.reduce((s, i) => s + i.cartons, 0);
    });

    // COGS — jo maal becha uski rate-value (cost)
    // challan items mein rate hai (jo rate pe becha), cost = rate pe hi le rahe hain
    // agar purchase cost alag ho tab alag model chahiye — abhi rate = cost assume
    const cogsAgg = await Challan.aggregate([
      { $match: challanFilter.date ? { companyId: new mongoose.Types.ObjectId(companyId), date: dateFilter } : { companyId: new mongoose.Types.ObjectId(companyId) } },
      { $unwind: '$items' },
      { $group: { _id: null, totalRevenue: { $sum: '$items.amount' }, totalPairs: { $sum: '$items.totalPair' } } }
    ]);

    // Current stock value (closing stock)
    const stockAgg = await Product.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), isDeleted: false } },
      { $group: { _id: null, rateValue: { $sum: { $multiply: ['$cartons', '$pairPerCarton', '$rate'] } }, mrpValue: { $sum: { $multiply: ['$cartons', '$pairPerCarton', '$mrp'] } }, totalCartons: { $sum: '$cartons' } } }
    ]);
    const closingStock = stockAgg[0] || { rateValue: 0, mrpValue: 0, totalCartons: 0 };

    // Gross Profit = Sales - GST collected
    const grossProfit = totalSales - totalGST;

    res.json({
      success: true,
      income: {
        totalSales,
        totalGST,
        netSales: totalSales,
        totalCartonsSold,
        totalPairsSold,
        invoiceCount: challans.length
      },
      salesByMonth: Object.entries(salesByMonth).map(([month, v]) => ({ month, ...v })),
      closingStock,
      grossProfit,
      period: { from: from || 'All time', to: to || 'Today' }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. GST REPORT
// ─────────────────────────────────────────────
exports.getGSTReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const challans = await Challan.find(filter).sort({ date: -1 });

    let totalTaxable = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0, totalGST = 0;
    const byRate = {};

    const data = challans.map(c => {
      const taxable = c.items.reduce((s, i) => s + i.amount, 0);
      const cgst  = c.cgst  || 0;
      const sgst  = c.sgst  || 0;
      const igst  = c.igst  || 0;
      const gst   = cgst + sgst + igst;
      const total = taxable + gst;

      totalTaxable += taxable;
      totalCGST    += cgst;
      totalSGST    += sgst;
      totalIGST    += igst;
      totalGST     += gst;

      const rate = c.gstPercent || 0;
      if (!byRate[rate]) byRate[rate] = { gstPercent: rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0, count: 0 };
      byRate[rate].taxable += taxable;
      byRate[rate].cgst    += cgst;
      byRate[rate].sgst    += sgst;
      byRate[rate].igst    += igst;
      byRate[rate].total   += total;
      byRate[rate].count++;

      return {
        invoiceNo: c.invoiceNo,
        date:      c.date,
        partyName: c.partyName,
        station:   c.station,
        isInterState: c.isInterState,
        gstPercent: rate,
        taxableAmount: taxable,
        cgst, sgst, igst,
        totalGST: gst,
        totalAmount: total
      };
    });

    res.json({
      success: true,
      data,
      summary: { totalTaxable, totalCGST, totalSGST, totalIGST, totalGST, grandTotal: totalTaxable + totalGST },
      byRate: Object.values(byRate).sort((a, b) => a.gstPercent - b.gstPercent),
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// 6. DELETE PAYMENT
// ─────────────────────────────────────────────
exports.deletePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const payment = await Payment.findOneAndDelete({ _id: id, companyId });
    if (!payment) return res.status(404).json({ error: 'Payment nahi mili' });

    // Recalculate challan status
    if (payment.challanId) {
      const challan = await Challan.findOne({ _id: payment.challanId, companyId });
      if (challan) {
        const allPayments = await Payment.aggregate([
          { $match: { challanId: payment.challanId, companyId: new mongoose.Types.ObjectId(companyId) } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalPaid = allPayments[0]?.total || 0;
        const invoiceTotal = challan.items.reduce((s, i) => s + i.amount, 0);
        challan.paidAmount = totalPaid;
        challan.paymentStatus = totalPaid >= invoiceTotal ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
        await challan.save();
      }
    }
    res.json({ success: true, message: 'Payment delete ho gayi' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
