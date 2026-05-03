const Challan = require('../models/Challan');
const Product = require('../models/Product');
const History = require('../models/History');
const Company = require('../models/Company');
const mongoose = require('mongoose');
const axios = require('axios');

const TALLY_URL = process.env.TALLY_URL || 'http://localhost:9000';

// TallyPrime XML response se company naam parse karo
const parseTallyCompanyName = (text) => {
  const strategies = [
    // Attribute-based: <COMPANY NAME="...">
    () => text.match(/<COMPANY\s[^>]*NAME\s*=\s*"([^"]+)"/i)?.[1],
    () => text.match(/<COMPANY\s[^>]*NAME\s*=\s*'([^']+)'/i)?.[1],
    // Tag-based (various Tally versions)
    () => text.match(/<COMPANYNAME[^>]*>([\s\S]*?)<\/COMPANYNAME>/i)?.[1],
    () => text.match(/<BASICCOMPANYFORMALNAME[^>]*>([\s\S]*?)<\/BASICCOMPANYFORMALNAME>/i)?.[1],
    // TallyPrime EDU uses SVCOMPANY
    () => text.match(/<SVCOMPANY[^>]*>([\s\S]*?)<\/SVCOMPANY>/i)?.[1],
    () => text.match(/<CURRENTCOMPANY[^>]*>([\s\S]*?)<\/CURRENTCOMPANY>/i)?.[1],
    () => text.match(/<ACTIVECMPNAME[^>]*>([\s\S]*?)<\/ACTIVECMPNAME>/i)?.[1],
    // Inside COMPANY block
    () => {
      const block = text.match(/<COMPANY[^>]*>([\s\S]*?)<\/COMPANY>/i)?.[1];
      return block ? block.match(/<NAME[^>]*>([\s\S]*?)<\/NAME>/i)?.[1] : null;
    },
  ];
  for (const fn of strategies) {
    try { const v = fn(); if (v?.trim()) return v.trim(); } catch {}
  }
  return null;
};

// Tally se currently open company ka naam fetch karo
// Throws if Tally is unreachable. Returns null if connected but name not parsed.
const getActiveTallyCompany = async () => {
  const requests = [
    // Variant 1: List of Companies with export format
    `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`,
    // Variant 2: List of Companies simple
    `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`,
    // Variant 3: TallyPrime EDU compatible
    `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT><SVCURRENTCOMPANY>Yes</SVCURRENTCOMPANY></STATICVARIABLES></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`,
    // Variant 4: Gateway request
    `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER><BODY><EXPORTDATA><REQUESTDESC><STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES><REQUESTOBJ><OBJDEFS><OBJDEF><OBJTYPE>Company</OBJTYPE><ONLYCMP>Yes</ONLYCMP></OBJDEF></OBJDEFS></REQUESTOBJ></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`,
  ];

  let anyConnected = false;

  for (const xml of requests) {
    try {
      const res = await axios.post(TALLY_URL, xml, { headers: { 'Content-Type': 'text/xml' }, timeout: 5000 });
      anyConnected = true;
      const text = String(res.data || '');
      console.log('[TallyCompany] raw (first 800):', text.substring(0, 800));
      const name = parseTallyCompanyName(text);
      if (name) return name;
    } catch {
      // This specific request failed (connection refused / timeout), try next variant
    }
  }

  // If none connected → Tally is truly offline → throw so callers can detect it
  if (!anyConnected) {
    throw new Error('Tally offline — port 9000 available nahi hai');
  }

  // Connected but no company name parsed from any response
  return null;
};

// Tally response se actual error nikalo
const parseTallyResponse = (resText) => {
  const errMatch  = resText.match(/<ERRORS>(\d+)<\/ERRORS>/i);
  const errCount  = errMatch ? parseInt(errMatch[1]) : 0;
  const lineErrors = [...resText.matchAll(/<LINEERROR>(.*?)<\/LINEERROR>/gi)].map(m => m[1].trim());
  const created   = (resText.match(/<CREATED>(\d+)<\/CREATED>/i) || [])[1] || '0';
  return { errCount, lineErrors, created: parseInt(created) };
};

// ─────────────────────────────────────────────
// 1. SALES REGISTER — Sari challan/invoices
// ─────────────────────────────────────────────
exports.getSalesRegister = async (req, res) => {
  try {
    const { from, to, party } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const challans = await Challan.find(filter).sort({ date: -1 });

    const data = challans.map(c => ({
      invoiceNo: c.invoiceNo,
      date: c.date,
      partyName: c.partyName,
      station: c.station,
      transport: c.transport,
      totalCartons: c.items.reduce((s, i) => s + i.cartons, 0),
      totalPairs: c.items.reduce((s, i) => s + i.totalPair, 0),
      totalAmount: c.items.reduce((s, i) => s + i.amount, 0),
      items: c.items,
      createdByName: c.createdByName,
      _id: c._id
    }));

    const totalAmount = data.reduce((s, r) => s + r.totalAmount, 0);
    const totalCartons = data.reduce((s, r) => s + r.totalCartons, 0);

    res.json({ success: true, data, totalAmount, totalCartons, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 2. PURCHASE REGISTER — Stock kab kab aaya
// ─────────────────────────────────────────────
exports.getPurchaseRegister = async (req, res) => {
  try {
    const { from, to, worker } = req.query;
    const companyId = req.user.companyId;

    const match = {
      companyId: new mongoose.Types.ObjectId(companyId),
      action: { $in: ['ADD', 'UPDATE'] },
      quantityChanged: { $gt: 0 }
    };
    if (worker) match.updatedByName = { $regex: worker, $options: 'i' };
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const entries = await History.find(match)
      .populate('product', 'article gender size color rate mrp pairPerCarton stockType')
      .sort({ timestamp: -1 });

    const data = entries.map(e => ({
      _id: e._id,
      date: e.timestamp,
      worker: e.updatedByName,
      article: e.product?.article || e.articleText || '-',
      gender: e.product?.gender || '-',
      size: e.product?.size || '-',
      color: e.product?.color || '-',
      cartons: e.quantityChanged,
      pairPerCarton: e.product?.pairPerCarton || 0,
      pairs: e.quantityChanged * (e.product?.pairPerCarton || 0),
      rate: e.product?.rate || 0,
      mrp: e.product?.mrp || 0,
      amount: e.quantityChanged * (e.product?.pairPerCarton || 0) * (e.product?.rate || 0),
      action: e.action,
      note: e.note
    }));

    const totalCartons = data.reduce((s, r) => s + r.cartons, 0);
    const totalPairs = data.reduce((s, r) => s + r.pairs, 0);
    const totalAmount = data.reduce((s, r) => s + r.amount, 0);

    res.json({ success: true, data, totalCartons, totalPairs, totalAmount, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 3. STOCK SUMMARY — Pura stock + valuation
// ─────────────────────────────────────────────
exports.getStockSummary = async (req, res) => {
  try {
    const { stockType, gender } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId, isDeleted: false };
    if (stockType) filter.stockType = stockType;
    if (gender) filter.gender = gender;

    const products = await Product.find(filter)
      .select('article gender stockType size color cartons pairPerCarton mrp rate series')
      .sort({ article: 1 });

    const data = products.map(p => ({
      article: p.article,
      gender: p.gender,
      stockType: p.stockType,
      size: p.size,
      color: p.color,
      cartons: p.cartons,
      pairPerCarton: p.pairPerCarton,
      pairs: p.cartons * p.pairPerCarton,
      mrp: p.mrp,
      rate: p.rate,
      mrpValue: p.cartons * p.pairPerCarton * p.mrp,
      rateValue: p.cartons * p.pairPerCarton * p.rate,
      series: p.series
    }));

    // Article-level summary
    const articleMap = {};
    data.forEach(p => {
      if (!articleMap[p.article]) {
        articleMap[p.article] = { article: p.article, gender: p.gender, stockType: p.stockType, totalCartons: 0, totalPairs: 0, mrpValue: 0, rateValue: 0 };
      }
      articleMap[p.article].totalCartons += p.cartons;
      articleMap[p.article].totalPairs += p.pairs;
      articleMap[p.article].mrpValue += p.mrpValue;
      articleMap[p.article].rateValue += p.rateValue;
    });

    const totalCartons = data.reduce((s, r) => s + r.cartons, 0);
    const totalPairs = data.reduce((s, r) => s + r.pairs, 0);
    const totalMrpValue = data.reduce((s, r) => s + r.mrpValue, 0);
    const totalRateValue = data.reduce((s, r) => s + r.rateValue, 0);

    res.json({
      success: true,
      data,
      articleSummary: Object.values(articleMap),
      totalCartons,
      totalPairs,
      totalMrpValue,
      totalRateValue,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 4. PARTY LEDGER — Party-wise account
// ─────────────────────────────────────────────
exports.getPartyLedger = async (req, res) => {
  try {
    const { party, from, to } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const challans = await Challan.find(filter).sort({ date: 1 });

    // Group by party
    const partyMap = {};
    challans.forEach(c => {
      const name = c.partyName;
      if (!partyMap[name]) {
        partyMap[name] = { partyName: name, totalCartons: 0, totalPairs: 0, totalAmount: 0, transactions: [] };
      }
      const cartons = c.items.reduce((s, i) => s + i.cartons, 0);
      const pairs = c.items.reduce((s, i) => s + i.totalPair, 0);
      const amount = c.items.reduce((s, i) => s + i.amount, 0);

      partyMap[name].totalCartons += cartons;
      partyMap[name].totalPairs += pairs;
      partyMap[name].totalAmount += amount;
      partyMap[name].transactions.push({
        invoiceNo: c.invoiceNo,
        date: c.date,
        station: c.station,
        cartons,
        pairs,
        amount,
        _id: c._id
      });
    });

    const partyList = Object.values(partyMap).sort((a, b) => b.totalAmount - a.totalAmount);

    // Overall totals
    const grandTotal = partyList.reduce((s, p) => s + p.totalAmount, 0);
    const grandCartons = partyList.reduce((s, p) => s + p.totalCartons, 0);

    res.json({ success: true, data: partyList, grandTotal, grandCartons, partyCount: partyList.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 5. DAY BOOK — Kisi din ki sab transactions
// ─────────────────────────────────────────────
exports.getDayBook = async (req, res) => {
  try {
    const { from, to, action } = req.query;
    const companyId = req.user.companyId;

    const match = { companyId: new mongoose.Types.ObjectId(companyId) };

    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }
    if (action) match.action = action;

    const entries = await History.find(match)
      .populate('product', 'article gender size color rate mrp pairPerCarton')
      .sort({ timestamp: -1 })
      .limit(500);

    const data = entries.map(e => ({
      _id: e._id,
      date: e.timestamp,
      action: e.action,
      article: e.product?.article || e.articleText || '-',
      gender: e.product?.gender || '-',
      size: e.product?.size || '-',
      color: e.product?.color || '-',
      cartons: Math.abs(e.quantityChanged),
      pairPerCarton: e.product?.pairPerCarton || 0,
      pairs: Math.abs(e.quantityChanged) * (e.product?.pairPerCarton || 0),
      partyName: e.partyName || '-',
      invoiceNo: e.invoiceNo || '-',
      worker: e.updatedByName || '-',
      note: e.note || '-',
      isOut: e.action === 'CHALLAN_OUT' || e.action === 'DELETE' || e.action === 'BULK_DELETE'
    }));

    // Group by date
    const byDate = {};
    data.forEach(e => {
      const d = new Date(e.date).toLocaleDateString('en-IN');
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(e);
    });

    res.json({ success: true, data, byDate, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 6. EXPORT SALES XML — Tally import ke liye
// ─────────────────────────────────────────────
exports.exportSalesXML = async (req, res) => {
  try {
    const { from, to, party } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const challans = await Challan.find(filter).sort({ date: 1 });

    const fmtDate = d => {
      const dt = new Date(d);
      return `${dt.getFullYear()}${String(dt.getMonth()+1).padStart(2,'0')}${String(dt.getDate()).padStart(2,'0')}`;
    };

    const escXML = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

    const vouchers = challans.map(c => {
      const taxable    = c.items.reduce((s, i) => s + i.amount, 0);
      const totalGST   = (c.cgst || 0) + (c.sgst || 0) + (c.igst || 0);
      const grandTotal = taxable + totalGST;

      const invEntries = c.items.map(item => `
        <ALLINVENTORYENTRIES.LIST>
          <STOCKITEMNAME>${escXML(item.article)} ${escXML(item.size)} ${escXML(item.color)}</STOCKITEMNAME>
          <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
          <RATE>${item.rate}/Nos</RATE>
          <AMOUNT>${item.amount}</AMOUNT>
          <ACTUALQTY>${item.totalPair} Nos</ACTUALQTY>
          <BILLEDQTY>${item.totalPair} Nos</BILLEDQTY>
        </ALLINVENTORYENTRIES.LIST>`).join('');

      let gstEntries = '';
      if ((c.cgst || 0) > 0) gstEntries += `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>CGST</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${c.cgst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>SGST</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${c.sgst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`;
      if ((c.igst || 0) > 0) gstEntries += `
        <ALLLEDGERENTRIES.LIST>
          <LEDGERNAME>IGST</LEDGERNAME>
          <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
          <AMOUNT>-${c.igst}</AMOUNT>
        </ALLLEDGERENTRIES.LIST>`;

      return `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Invoice Voucher View">
          <DATE>${fmtDate(c.date)}</DATE>
          <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${escXML(c.invoiceNo)}</VOUCHERNUMBER>
          <PARTYLEDGERNAME>${escXML(c.partyName)}</PARTYLEDGERNAME>
          <NARRATION>Invoice: ${escXML(c.invoiceNo)} | Station: ${escXML(c.station)} | Transport: ${escXML(c.transport)}</NARRATION>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>${escXML(c.partyName)}</LEDGERNAME>
            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
            <AMOUNT>-${grandTotal}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>
          <ALLLEDGERENTRIES.LIST>
            <LEDGERNAME>Sales Account</LEDGERNAME>
            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
            <AMOUNT>${taxable}</AMOUNT>
          </ALLLEDGERENTRIES.LIST>${gstEntries}${invEntries}
        </VOUCHER>
      </TALLYMESSAGE>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>${vouchers}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    const filename = `sales-tally-${from || 'all'}-to-${to || 'all'}.xml`;
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(xml);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 7. EXPORT STOCK XML — Stock items for Tally
// ─────────────────────────────────────────────
exports.exportStockXML = async (req, res) => {
  try {
    const { stockType, gender } = req.query;
    const companyId = req.user.companyId;

    const filter = { companyId, isDeleted: false };
    if (stockType) filter.stockType = stockType;
    if (gender) filter.gender = gender;

    const products = await Product.find(filter)
      .select('article gender stockType size color cartons pairPerCarton mrp rate series')
      .sort({ article: 1 });

    const escXML = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const items = products.map(p => {
      const qty   = p.cartons * p.pairPerCarton;
      const value = qty * p.rate;
      return `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <STOCKITEM NAME="${escXML(p.article)} ${escXML(p.size)} ${escXML(p.color)}" ACTION="Create">
          <NAME>${escXML(p.article)} ${escXML(p.size)} ${escXML(p.color)}</NAME>
          <PARENT>${escXML(p.stockType?.toUpperCase() || 'FOOTWEAR')}</PARENT>
          <CATEGORY>${escXML(p.gender)}</CATEGORY>
          <BASEUNITS>Nos</BASEUNITS>
          <OPENINGBALANCE>${qty} Nos</OPENINGBALANCE>
          <OPENINGRATE>${p.rate}/Nos</OPENINGRATE>
          <OPENINGVALUE>${value}</OPENINGVALUE>
        </STOCKITEM>
      </TALLYMESSAGE>`;
    }).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Stock Items</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>${items}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Content-Disposition', 'attachment; filename="stock-tally.xml"');
    res.send(xml);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 8a. VERIFY TALLY COMPANY — Check naam match
// ─────────────────────────────────────────────
exports.verifyTallyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    const tallyCompanyName = company?.tallyCompanyName?.trim() || '';
    // If not explicitly set, fall back to software company name for comparison
    const configured = tallyCompanyName || (company?.name?.trim()) || '';
    const isExplicit = !!tallyCompanyName;

    let activeName = null;
    let tallyOnline = false;
    try {
      activeName = await getActiveTallyCompany();
      tallyOnline = true;
    } catch {
      // Tally offline or not responding
    }

    const matched = configured && activeName
      ? configured.toLowerCase() === activeName.toLowerCase()
      : null;

    res.json({ success: true, tallyCompanyName, configured, isExplicit, activeName, tallyOnline, matched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 8b. SET TALLY COMPANY NAME — Save in settings
// ─────────────────────────────────────────────
exports.setTallyCompanyName = async (req, res) => {
  try {
    const { tallyCompanyName } = req.body;
    await Company.findByIdAndUpdate(req.user.companyId, { tallyCompanyName: (tallyCompanyName || '').trim() });
    res.json({ success: true, message: 'Tally company name save ho gaya' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 8. PUSH SALES TO TALLY — Direct HTTP push
// ─── Shared helpers ───────────────────────────
const escXML  = s => String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const amt     = n => Math.round((n || 0) * 100) / 100;  // 2 decimal, no floating noise
const tallyPost = xml => axios.post(TALLY_URL, xml, { headers: { 'Content-Type': 'text/xml' }, timeout: 300000 });
const wrapMasters  = body => `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>All Masters</REPORTNAME></REQUESTDESC><REQUESTDATA>${body}</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;
const wrapVouchers = body => `<?xml version="1.0" encoding="UTF-8"?><ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA>${body}</REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;

const fmtTallyDate = d => {
  let base;
  if (!d) {
    base = new Date();
  } else if (d instanceof Date) {
    base = isNaN(d.getTime()) ? new Date() : d;
  } else {
    const parsed = new Date(d);
    base = isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  // Use local (IST on server) date parts
  const y  = base.getFullYear();
  const m  = String(base.getMonth() + 1).padStart(2, '0');
  const dy = String(base.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${dy}`;
  console.log(`[fmtTallyDate] input=${d} → output=${dateStr}`);
  return dateStr;
};

const ledgerXML = (name, parent) => `<TALLYMESSAGE xmlns:UDF="TallyUDF"><LEDGER NAME="${escXML(name)}" ACTION="Create"><NAME>${escXML(name)}</NAME><PARENT>${escXML(parent)}</PARENT></LEDGER></TALLYMESSAGE>`;

// ─────────────────────────────────────────────
exports.pushSalesToTally = async (req, res) => {
  try {
    const { from, to, party } = req.query;
    const companyId = req.user.companyId;

    // Company name match check — STRICT: push tabhi hoga jab company verify ho
    const company = await Company.findById(companyId);
    if (!company) return res.status(400).json({ success: false, error: 'Company not found' });

    const configured = (company.tallyCompanyName?.trim()) || (company.name?.trim()) || '';
    if (!configured) return res.status(400).json({ success: false, error: 'Company ka naam set nahi hai — settings mein naam daalo' });

    let activeName = null;
    try {
      activeName = await getActiveTallyCompany();
    } catch {
      return res.status(503).json({ success: false, error: 'Tally se connection nahi hua — push rok diya gaya', hint: 'TallyPrime open karo aur port 9000 enable karo' });
    }
    if (!activeName) {
      return res.status(503).json({
        success: false,
        error: 'Tally mein company ka naam nahi mila — push rok diya gaya. TallyPrime mein company open hai?',
        hint: 'TallyPrime open karo, company open karo (port 9000 enable karo), aur dobara try karo'
      });
    }
    if (configured.toLowerCase() !== activeName.toLowerCase()) {
      return res.status(409).json({
        success: false,
        error: `Company mismatch: Tally mein "${activeName}" open hai, lekin "${configured}" hona chahiye. Pehle sahi company Tally mein open karo.`,
        mismatch: true, configured, activeName
      });
    }

    const filter = { companyId };
    if (party) filter.partyName = { $regex: party, $options: 'i' };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to)   filter.date.$lte = new Date(new Date(to).setHours(23, 59, 59, 999));
    }

    const challans = await Challan.find(filter).sort({ date: 1 });
    if (!challans.length) return res.status(400).json({ success: false, error: 'Is period mein koi invoice nahi mili' });

    // ── Step 1: Zaruri ledgers auto-create (already exist ho toh ignore) ──
    const parties  = [...new Set(challans.map(c => c.partyName))];
    const hasGST   = challans.some(c => (c.cgst||0) > 0 || (c.sgst||0) > 0);
    const hasIGST  = challans.some(c => (c.igst||0) > 0);

    const masterBody = [
      ledgerXML('Sales Account',  'Sales Accounts'),
      ...(hasGST  ? [ledgerXML('CGST', 'Duties & Taxes'), ledgerXML('SGST', 'Duties & Taxes')] : []),
      ...(hasIGST ? [ledgerXML('IGST', 'Duties & Taxes')] : []),
      ...parties.map(p => ledgerXML(p, 'Sundry Debtors')),
    ].join('');

    await tallyPost(wrapMasters(masterBody)).catch(() => {});

    // ── Step 2: Sales vouchers push ──
    const voucherBody = challans.map(c => {
      const taxable    = amt(c.items.reduce((s, i) => s + i.amount, 0));
      const cgst       = amt(c.cgst);
      const sgst       = amt(c.sgst);
      const igst       = amt(c.igst);
      const grandTotal = amt(taxable + cgst + sgst + igst);

      // Inline date formatting — foolproof, no timezone drift
      const rawDate = c.date ? new Date(c.date) : new Date();
      const dateStr = `${rawDate.getFullYear()}${String(rawDate.getMonth()+1).padStart(2,'0')}${String(rawDate.getDate()).padStart(2,'0')}`;
      console.log(`[Tally] voucher ${c.invoiceNo} → date=${dateStr}`);

      const narration = escXML(
        c.items.map(i => `${i.article} ${i.size} ${i.color} x${i.cartons}ctn ${i.totalPair}prs @${i.rate}`).join('; ')
        + ` | ${c.station} | ${c.transport}`
      );

      // Compact XML — no whitespace between tags (Tally parser is strict)
      const gstLines =
        (cgst > 0 ? `<ALLLEDGERENTRIES.LIST><LEDGERNAME>CGST</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${cgst}</AMOUNT></ALLLEDGERENTRIES.LIST><ALLLEDGERENTRIES.LIST><LEDGERNAME>SGST</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${sgst}</AMOUNT></ALLLEDGERENTRIES.LIST>` : '') +
        (igst > 0 ? `<ALLLEDGERENTRIES.LIST><LEDGERNAME>IGST</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${igst}</AMOUNT></ALLLEDGERENTRIES.LIST>` : '');

      return `<TALLYMESSAGE xmlns:UDF="TallyUDF"><VOUCHER VCHTYPE="Sales" ACTION="Create"><DATE>${dateStr}</DATE><EFFECTIVEDATE>${dateStr}</EFFECTIVEDATE><VOUCHERTYPENAME>Sales</VOUCHERTYPENAME><VOUCHERNUMBER>${escXML(c.invoiceNo)}</VOUCHERNUMBER><PARTYLEDGERNAME>${escXML(c.partyName)}</PARTYLEDGERNAME><NARRATION>${narration}</NARRATION><ALLLEDGERENTRIES.LIST><LEDGERNAME>${escXML(c.partyName)}</LEDGERNAME><ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>-${grandTotal}</AMOUNT></ALLLEDGERENTRIES.LIST><ALLLEDGERENTRIES.LIST><LEDGERNAME>Sales Account</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${taxable}</AMOUNT></ALLLEDGERENTRIES.LIST>${gstLines}</VOUCHER></TALLYMESSAGE>`;
    }).join('');

    const tallyRes = await tallyPost(wrapVouchers(voucherBody));
    const resText  = String(tallyRes.data || '');
    const { errCount, lineErrors, created } = parseTallyResponse(resText);

    if (errCount > 0 || lineErrors.length > 0) {
      return res.status(400).json({ success: false, error: 'Tally ne error diya', details: lineErrors.join(' | ') || `${errCount} errors` });
    }
    res.json({ success: true, message: `${created || challans.length} invoices Tally mein push ho gayi!`, count: challans.length });

  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET')
      return res.status(503).json({ success: false, error: 'Tally se connection nahi hua', hint: 'TallyPrime open karo → F12 → Advanced Config → Enable Tally.Server → Yes, Port 9000' });
    if (err.code === 'ECONNABORTED')
      return res.status(504).json({ success: false, error: 'Tally response timeout — thoda wait karo aur retry karo' });
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 9. PUSH STOCK TO TALLY — Direct HTTP push
// ─────────────────────────────────────────────
exports.pushStockToTally = async (req, res) => {
  try {
    const { stockType, gender } = req.query;
    const companyId = req.user.companyId;

    // Company name match check — STRICT: push tabhi hoga jab company verify ho
    const company = await Company.findById(companyId);
    if (!company) return res.status(400).json({ success: false, error: 'Company not found' });

    const configured = (company.tallyCompanyName?.trim()) || (company.name?.trim()) || '';
    if (!configured) return res.status(400).json({ success: false, error: 'Company ka naam set nahi hai — settings mein naam daalo' });

    let activeName = null;
    try {
      activeName = await getActiveTallyCompany();
    } catch {
      return res.status(503).json({ success: false, error: 'Tally se connection nahi hua — push rok diya gaya', hint: 'TallyPrime open karo aur port 9000 enable karo' });
    }
    if (!activeName) {
      return res.status(503).json({
        success: false,
        error: 'Tally mein company ka naam nahi mila — push rok diya gaya. TallyPrime mein company open hai?',
        hint: 'TallyPrime open karo, company open karo (port 9000 enable karo), aur dobara try karo'
      });
    }
    if (configured.toLowerCase() !== activeName.toLowerCase()) {
      return res.status(409).json({
        success: false,
        error: `Company mismatch: Tally mein "${activeName}" open hai, lekin "${configured}" hona chahiye. Pehle sahi company Tally mein open karo.`,
        mismatch: true, configured, activeName
      });
    }

    const filter = { companyId, isDeleted: false };
    if (stockType) filter.stockType = stockType;
    if (gender)    filter.gender    = gender;

    const products = await Product.find(filter)
      .select('article gender stockType size color cartons pairPerCarton rate')
      .sort({ article: 1 });

    if (!products.length) return res.status(400).json({ success: false, error: 'Koi product nahi mila' });

    const GROUP_NAME = 'Footwear';
    const BATCH = 20;
    let totalCreated = 0;

    for (let i = 0; i < products.length; i += BATCH) {
      const batch = products.slice(i, i + BATCH);

      // Group + items ek hi XML mein — group pehle aata hai toh pehle ban jaata hai
      const groupMsg = i === 0 ? `
<TALLYMESSAGE xmlns:UDF="TallyUDF">
  <STOCKGROUP NAME="${GROUP_NAME}" ACTION="Create Or Alter">
    <NAME>${GROUP_NAME}</NAME>
  </STOCKGROUP>
</TALLYMESSAGE>` : '';

      const itemBody = groupMsg + batch.map(p => `
<TALLYMESSAGE xmlns:UDF="TallyUDF">
  <STOCKITEM NAME="${escXML(p.article)} ${escXML(p.size)} ${escXML(p.color)}" ACTION="Create Or Alter">
    <NAME>${escXML(p.article)} ${escXML(p.size)} ${escXML(p.color)}</NAME>
    <PARENT>${GROUP_NAME}</PARENT>
    <BASEUNITS>Nos</BASEUNITS>
  </STOCKITEM>
</TALLYMESSAGE>`).join('');

      const res2     = await tallyPost(wrapMasters(itemBody));
      const resText  = String(res2.data || '');
      const { errCount, lineErrors, created } = parseTallyResponse(resText);

      if (errCount > 0 || lineErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Batch ${Math.floor(i/BATCH)+1} mein Tally ne error diya`,
          details: lineErrors.join(' | ') || `${errCount} errors`
        });
      }
      totalCreated += created;
    }

    res.json({ success: true, message: `${totalCreated || products.length} stock items Tally mein push ho gaye!`, count: products.length });

  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET')
      return res.status(503).json({ success: false, error: 'Tally se connection nahi hua', hint: 'TallyPrime open karo → F12 → Advanced Config → Enable Tally.Server → Yes, Port 9000' });
    if (err.code === 'ECONNABORTED')
      return res.status(504).json({ success: false, error: 'Tally response timeout — thoda wait karo aur retry karo' });
    res.status(500).json({ success: false, error: err.message });
  }
};

// ─────────────────────────────────────────────
// 10. TALLY SUMMARY — Dashboard numbers
// ─────────────────────────────────────────────
exports.getTallySummary = async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const cId = new mongoose.Types.ObjectId(companyId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalProducts,
      todaySales,
      monthSales,
      totalStock,
      totalSalesPairs
    ] = await Promise.all([
      Product.countDocuments({ companyId, isDeleted: false }),

      Challan.aggregate([
        { $match: { companyId: cId, date: { $gte: today } } },
        { $unwind: '$items' },
        { $group: { _id: null, amount: { $sum: '$items.amount' }, cartons: { $sum: '$items.cartons' } } }
      ]),

      Challan.aggregate([
        { $match: { companyId: cId, date: { $gte: monthStart } } },
        { $unwind: '$items' },
        { $group: { _id: null, amount: { $sum: '$items.amount' }, cartons: { $sum: '$items.cartons' } } }
      ]),

      Product.aggregate([
        { $match: { companyId: cId, isDeleted: false } },
        { $group: { _id: null, cartons: { $sum: '$cartons' }, mrpValue: { $sum: { $multiply: ['$cartons', '$pairPerCarton', '$mrp'] } }, rateValue: { $sum: { $multiply: ['$cartons', '$pairPerCarton', '$rate'] } } } }
      ]),

      Challan.aggregate([
        { $match: { companyId: cId } },
        { $unwind: '$items' },
        { $group: { _id: null, totalAmount: { $sum: '$items.amount' }, totalPairs: { $sum: '$items.totalPair' } } }
      ])
    ]);

    res.json({
      success: true,
      totalProducts,
      todaySales: todaySales[0] || { amount: 0, cartons: 0 },
      monthSales: monthSales[0] || { amount: 0, cartons: 0 },
      stockValue: totalStock[0] || { cartons: 0, mrpValue: 0, rateValue: 0 },
      allTimeSales: totalSalesPairs[0] || { totalAmount: 0, totalPairs: 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
