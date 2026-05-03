


// // const express = require('express');
// // const router  = express.Router();
// // const PDFKit  = require('pdfkit');
// // const Product = require('../models/Product');
// // const axios   = require('axios');

// // /* ---------- helpers ---------- */
// // const nowIND = () =>
// //   new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

// // const fmtDate = d =>
// //   d.toLocaleDateString('en-IN', {
// //     day: '2-digit',
// //     month: '2-digit',
// //     year: 'numeric'
// //   });

// // const fmtDateT = d =>
// //   d.toLocaleString('en-IN', {
// //     day: '2-digit',
// //     month: '2-digit',
// //     year: 'numeric',
// //     hour: '2-digit',
// //     minute: '2-digit',
// //     second: '2-digit',
// //     hour12: true
// //   });

// // const vGroup = (t = '', g = '') => {
// //   t = t.toLowerCase();
// //   g = g.toLowerCase();
// //   if (t === 'eva')
// //     return { order: 2 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
// //   if (t === 'pu')
// //     return { order: 7 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
// //   return { order: 99 };
// // };

// // /* ---------- route ---------- */
// // router.post('/generate-pdf', async (req, res) => {
// //   try {
// //     const { includeImages, filters = {}, showRate, showMRP, productIds = [] } =
// //       req.body;

// //     /* query -------------------------------------------------------- */
// //     const q = productIds.length
// //       ? { _id: { $in: productIds }, isDeleted: { $ne: true } }
// //       : {
// //           isDeleted: { $ne: true },
// //           ...Object.fromEntries(
// //             Object.entries(filters)
// //               .filter(([k, v]) => v)
// //               .map(([k, v]) => [k, new RegExp(v, 'i')])
// //           )
// //         };

// //     const prods = await Product.find(q).lean();

// //     /* pdf ---------------------------------------------------------- */
// //     const doc = new PDFKit({
// //       size: [595, 688],
// //       margins: { top: 20, bottom: 20, left: 20, right: 20 }
// //     });
// //     res.setHeader('Content-Type', 'application/pdf');
// //     res.setHeader(
// //       'Content-Disposition',
// //       'attachment; filename=stock-report.pdf'
// //     );
// //     doc.pipe(res);

// //     /* group -------------------------------------------------------- */
// //     const grouped = prods.reduce((m, p) => {
// //       const key = `${p.article}-${p.gender}`.toUpperCase();

// //       if (!m[key]) {
// //         m[key] = { ...p, variants: [] };
// //         m[key].image = p.image || null;
// //       }
// //       m[key].variants.push(p);

// //       if (!m[key].image && p.image) {
// //         m[key].image = p.image;
// //       }
// //       return m;
// //     }, {});

// //     const filteredGroups = Object.entries(grouped).filter(([key, g]) => {
// //       const totalStock = g.variants.reduce(
// //         (sum, v) => sum + (v.cartons || 0),
// //         0
// //       );
// //       return totalStock > 0;
// //     });

// //     const groups = filteredGroups.sort((a, b) => {
// //       const A = a[1],
// //         B = b[1];
// //       const oA = vGroup(A.stockType, A.gender).order,
// //         oB = vGroup(B.stockType, B.gender).order;
// //       return (
// //         oA - oB ||
// //         (A.series || '').localeCompare(B.series || '') ||
// //         A.article.localeCompare(B.article)
// //       );
// //     });

// //     /* loop --------------------------------------------------------- */
// //     for (let i = 0; i < groups.length; i++) {
// //       if (i) doc.addPage();
// //       const g = groups[i][1];

// //       /* background + borders */
// //       doc
// //         .rect(0, 0, doc.page.width, doc.page.height)
// //         .fillColor('white')
// //         .fill();
// //       doc
// //         .rect(10, 10, doc.page.width - 20, doc.page.height - 20)
// //         .strokeColor('#2c5530')
// //         .lineWidth(3)
// //         .stroke();
// //       doc
// //         .rect(15, 15, doc.page.width - 30, doc.page.height - 30)
// //         .strokeColor('#7ba086')
// //         .lineWidth(1)
// //         .stroke();
// //       doc
// //         .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
// //         .fillColor('#455A64')
// //         .fill();

// //       const now = nowIND();

// //       /* info bar: Stock Type + Series | Report */
// //       doc
// //         .rect(20, 40, 555, 48)
// //         .fillColor('#f8fbff')
// //         .fill()
// //         .strokeColor('#c5d9f1')
// //         .lineWidth(1)
// //         .stroke();

// //       doc
// //         .font('Helvetica-Bold')
// //         .fontSize(10)
// //         .fillColor('#2e7d32')
// //         .text(`Stock Type: ${g.stockType || '-'}`, 25, 48);

// //       const rightInfo = `Series: ${g.series || '-'}   |   Report: ${fmtDate(now)}`;
// //       doc
// //         .font('Helvetica-Bold')
// //         .fontSize(10)
// //         .fillColor('#2e7d32')
// //         .text(rightInfo, 0, 48, {
// //           width: doc.page.width - 40,
// //           align: 'right'
// //         });

// //       /* article line */
// //       doc
// //         .fontSize(13)
// //         .fillColor('#1a237e')
// //         .text(`ARTICLE: ${g.article} - ${g.gender}`, 25, 63);

// //       /* rate / mrp / pairs info */
// //       let info = '';
// //       if (showRate && g.rate) info += `Rate: ${g.rate}`;
// //       if (showMRP && g.mrp) info += (info ? ' | ' : '') + `MRP: ${g.mrp}`;
// //       info += (info ? ' | ' : '') + `Pairs/Carton: ${g.pairPerCarton || '-'}`;

// //       doc
// //         .font('Helvetica')
// //         .fontSize(9)
// //         .fillColor('#424242')
// //         .text(info, 25, 77);

// //       /* big image */
// //       const imgTop = 105;
// //       const maxW = 535;
// //       const maxH = 360;
// //       const imgX = (doc.page.width - maxW) / 2;

// //       if (includeImages && g.image) {
// //         try {
// //           const img = await axios.get(g.image, { responseType: 'arraybuffer' });
// //           const buf = Buffer.from(img.data, 'binary');

// //           doc.image(buf, imgX, imgTop, {
// //             fit: [maxW, maxH],
// //             align: 'center',
// //             valign: 'top'
// //           });
// //         } catch (e) {
// //           console.error('image error', e.message);
// //         }
// //       }

// //       /* table: max 7 color rows */
// //       const containerW = 545;
// //       const tTop = imgTop + maxH + 10;
// //       let y = tTop,
// //         row = 24,
// //         colW = 120;

// //       const vars = g.variants.filter(v => (v.cartons || 0) > 0);

// //       const sizes = [...new Set(
// //         vars.map(v => v.size?.trim().toUpperCase())
// //       )]
// //         .filter(Boolean)
// //         .sort((a, b) => a - b);

// //       let colors = [...new Set(vars.map(v => v.color?.trim() || '-'))];
// //       colors = colors.slice(0, 7); // max 7

// //       if (vars.length && colors.length) {
// //         const sizeW = Math.floor((containerW - 50 - colW) / sizes.length);
// //         const x0 = 40,
// //           tW = colW + sizes.length * sizeW;

// //         // header row
// //         doc
// //           .rect(x0, y, tW, row)
// //           .fillColor('#1976d2')
// //           .fill()
// //           .fillColor('white');
// //         doc
// //           .font('Helvetica-Bold')
// //           .fontSize(10)
// //           .text('COLOR', x0 + 8, y + 7, { width: colW - 16 });

// //         let hx = x0 + colW;
// //         sizes.forEach(s => {
// //           doc.text(s, hx, y + 7, { width: sizeW, align: 'center' });
// //           hx += sizeW;
// //         });

// //         doc
// //           .moveTo(x0, y)
// //           .lineTo(x0 + tW, y)
// //           .strokeColor('#1565c0')
// //           .lineWidth(2)
// //           .stroke();

// //         let vx = x0;
// //         for (let j = 0; j <= sizes.length; j++) {
// //           doc
// //             .moveTo(vx, y)
// //             .lineTo(vx, y + row)
// //             .strokeColor('#1565c0')
// //             .stroke();
// //           vx += j === 0 ? colW : sizeW;
// //         }

// //         // data rows
// //         y += row;
// //         doc.font('Helvetica').fontSize(9);

// //         colors.forEach((clr, i2) => {
// //           doc
// //             .rect(x0, y, tW, row)
// //             .fillColor(i2 % 2 ? '#ffffff' : '#f8fbff')
// //             .fill();
// //           doc
// //             .fillColor('#1565c0')
// //             .text(clr, x0 + 8, y + 7, { width: colW - 16 });

// //           let cx = x0 + colW;
// //           sizes.forEach(sz => {
// //             const v = vars.find(
// //               v2 =>
// //                 v2.color?.trim() === clr &&
// //                 v2.size?.trim().toUpperCase() === sz
// //             );
// //             const val = v?.cartons || '-';

// //             doc
// //               .fillColor(val !== '-' ? '#0d47a1' : '#90a4ae')
// //               .font(val !== '-' ? 'Helvetica-Bold' : 'Helvetica')
// //               .text(val.toString(), cx, y + 7, {
// //                 width: sizeW,
// //                 align: 'center'
// //               });
// //             cx += sizeW;
// //           });

// //           doc
// //             .moveTo(x0, y)
// //             .lineTo(x0 + tW, y)
// //             .strokeColor('#90a4ae')
// //             .lineWidth(1)
// //             .stroke();

// //           let vx2 = x0;
// //           for (let j = 0; j <= sizes.length; j++) {
// //             doc
// //               .moveTo(vx2, y)
// //               .lineTo(vx2, y + row)
// //               .strokeColor('#90a4ae')
// //               .stroke();
// //             vx2 += j === 0 ? colW : sizeW;
// //           }

// //           y += row;
// //         });

// //         doc
// //           .moveTo(x0, y)
// //           .lineTo(x0 + tW, y)
// //           .strokeColor('#90a4ae')
// //           .stroke();
// //       }

// //       /* footer ------------------------------------------------------ */
// //       doc
// //         .fontSize(8)
// //         .fillColor('#1976d2')
// //         .text(`Page ${i + 1} of ${groups.length}`, 0, doc.page.height - 30, {
// //           align: 'center'
// //         });
// //     }

// //     doc.end();
// //   } catch (e) {
// //     console.error(e);
// //     res.status(500).send('PDF generation failed');
// //   }
// // });

// // module.exports = router;

// const express = require('express');
// const router = express.Router();
// const PDFKit = require('pdfkit');
// const Product = require('../models/Product');
// const SalaryEntry = require('../models/SalaryEntry');
// const History = require('../models/History');
// const axios = require('axios');

// /* ---------------- HELPERS ---------------- */

// const nowIND = () =>
//   new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

// const fmtDate = d =>
//   d.toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   });

// const vGroup = (t = '', g = '') => {
//   t = (t || '').toLowerCase();
//   g = (g || '').toLowerCase();
//   if (t === 'eva')
//     return { order: 2 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
//   if (t === 'pu')
//     return { order: 7 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
//   return { order: 99 };
// };

// /* ---------------- ROUTE ---------------- */

// router.post('/generate-pdf', async (req, res) => {
//   try {
//     const { includeImages, filters = {}, showRate, showMRP, productIds = [] } =
//       req.body;

//     /* ---------------- QUERY ---------------- */
//     const q = productIds.length
//       ? { _id: { $in: productIds }, isDeleted: { $ne: true } }
//       : {
//           isDeleted: { $ne: true },
//           ...Object.fromEntries(
//             Object.entries(filters)
//               .filter(([_, v]) => v)
//               .map(([k, v]) => [k, new RegExp(v, 'i')])
//           )
//         };

//     const prods = await Product.find(q).lean();
//     const prodIds = prods.map(p => p._id);

//     /* -------- LIVE CARTON CALCULATION -------- */

//     const salaryTotals = await SalaryEntry.aggregate([
//       { $match: { product: { $in: prodIds } } },
//       { $group: { _id: '$product', total: { $sum: '$cartons' } } }
//     ]);

//     const challanTotals = await History.aggregate([
//       { $match: { product: { $in: prodIds }, action: 'CHALLAN_OUT' } },
//       {
//         $group: {
//           _id: '$product',
//           totalOut: { $sum: { $abs: '$quantityChanged' } }
//         }
//       }
//     ]);

//     const salaryMap = new Map();
//     salaryTotals.forEach(s =>
//       salaryMap.set(s._id.toString(), s.total)
//     );

//     const challanMap = new Map();
//     challanTotals.forEach(c =>
//       challanMap.set(c._id.toString(), c.totalOut)
//     );

//     // Inject LIVE cartons
//     prods.forEach(p => {
//       const s = salaryMap.get(p._id.toString()) || 0;
//       const c = challanMap.get(p._id.toString()) || 0;
//       p.cartons = Math.max(0, s - c);
//     });

//     /* ---------------- PDF SETUP ---------------- */

//     const PAGE_W = 595;
//     const PAGE_H = 720;

//     const LEFT_W = 380;
//     const RIGHT_W = PAGE_W - LEFT_W;

//     const doc = new PDFKit({
//       size: [PAGE_W, PAGE_H],
//       margins: { top: 0, bottom: 0, left: 0, right: 0 }
//     });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       'attachment; filename=GPFAX-stock-report.pdf'
//     );

//     doc.pipe(res);

//     /* ---------------- GROUP ---------------- */

//     const grouped = prods.reduce((m, p) => {
//       const key = `${p.article}-${p.gender}`.toUpperCase();
//       if (!m[key]) {
//         m[key] = { ...p, variants: [], image: p.image || null };
//       }
//       m[key].variants.push(p);
//       if (!m[key].image && p.image) m[key].image = p.image;
//       return m;
//     }, {});

//     const groups = Object.entries(grouped)
//       .filter(([_, g]) =>
//         g.variants.reduce((sum, v) => sum + (v.cartons || 0), 0) > 0
//       )
//       .sort((a, b) => {
//         const A = a[1], B = b[1];
//         return (
//           vGroup(A.stockType, A.gender).order -
//           vGroup(B.stockType, B.gender).order ||
//           (A.series || '').localeCompare(B.series || '') ||
//           A.article.localeCompare(B.article)
//         );
//       });

//     /* ---------------- TABLE DRAWER ---------------- */

//     const drawTable = (doc, x0, y0, sizes, colors, variants) => {
//       const rowH = 18;
//       const colW = 42;
//       const labelW = 65;
//       const totalW = labelW + sizes.length * colW;

//       // HEADER
//       doc.rect(x0, y0, totalW, rowH).fillColor('#b71c1c').fill();
//       doc
//         .fillColor('white')
//         .font('Helvetica-Bold')
//         .fontSize(8)
//         .text('COLOR', x0 + 4, y0 + 5, { width: labelW - 6 });

//       let hx = x0 + labelW;
//       sizes.forEach(s => {
//         doc.text(s, hx, y0 + 5, { width: colW, align: 'center' });
//         hx += colW;
//       });

//       let y = y0 + rowH;

//       colors.forEach((clr, i) => {
//         doc
//           .rect(x0, y, totalW, rowH)
//           .fillColor(i % 2 ? '#111111' : '#1b1b1b')
//           .fill();

//         doc
//           .fillColor('#ff5252')
//           .font('Helvetica-Bold')
//           .fontSize(8)
//           .text(clr, x0 + 4, y + 5, { width: labelW - 6 });

//         let cx = x0 + labelW;

//         sizes.forEach(sz => {
//           const v = variants.find(
//             vv =>
//               vv.color?.trim() === clr &&
//               vv.size?.trim().toUpperCase() === sz
//           );

//           const val = v?.cartons || '-';

//           doc
//             .fillColor(val !== '-' ? 'white' : '#777')
//             .font(val !== '-' ? 'Helvetica-Bold' : 'Helvetica')
//             .fontSize(8)
//             .text(val.toString(), cx, y + 5, {
//               width: colW,
//               align: 'center'
//             });

//           cx += colW;
//         });

//         y += rowH;
//       });

//       return y;
//     };

//     /* ---------------- LOOP ---------------- */

//     for (let i = 0; i < groups.length; i++) {
//       if (i) doc.addPage();
//       const g = groups[i][1];
//       const now = nowIND();

//       /* BACKGROUND */
//     //  doc.rect(0, 0, PAGE_W, PAGE_H).fillColor('#000000').fill();
//     doc.rect(0, 0, PAGE_W, PAGE_H).fillColor('#ECEFF1').fill();


//       /* LEFT IMAGE PANEL (CONTAIN MODE — NO CROP) */
//       const leftX = 0;
//       const leftY = 0;
//       const leftW = LEFT_W;
//       const leftH = PAGE_H;

//       if (includeImages && g.image) {
//         try {
//           const img = await axios.get(g.image, { responseType: 'arraybuffer' });
//           const buf = Buffer.from(img.data, 'binary');

//           const imgObj = doc.openImage(buf);
//           const iw = imgObj.width;
//           const ih = imgObj.height;

//           const pad = 10;
//           const cx = leftX + pad;
//           const cy = leftY + pad;
//           const cw = leftW - pad * 2;
//           const ch = leftH - pad * 2;

//           // CONTAIN (NO CROP)
//           const scale = Math.min(cw / iw, ch / ih);
//           const sw = iw * scale;
//           const sh = ih * scale;

//           const dx = cx + (cw - sw) / 2;
//           const dy = cy + (ch - sh) / 2;

//           doc.image(buf, dx, dy, {
//             width: sw,
//             height: sh
//           });
//         } catch (e) {
//           console.error('Image load error:', e.message);
//         }
//       }

//       /* RIGHT HEADER (4 LINES) */
//       const rightX = LEFT_W + 5;

//       doc.rect(rightX, 20, RIGHT_W - 15, 90).fillColor('#b71c1c').fill();

//       doc
//         .fillColor('white')
//         .font('Helvetica-Bold')
//         .fontSize(12)
//         .text(`ARTICLE: ${g.article}`, rightX + 8, 28);

//       doc
//         .fontSize(10)
//         .text(`Gender: ${g.gender}`, rightX + 8, 45);

//       doc
//         .fontSize(9)
//         .text(
//           `Stock: ${g.stockType || '-'} | Series: ${g.series || '-'}`,
//           rightX + 8,
//           62
//         );

//       doc
//         .fontSize(9)
//         .text(
//           `Report: ${fmtDate(now)} | Pairs/Carton: ${g.pairPerCarton || '-'}`,
//           rightX + 8,
//           78
//         );

//       /* TABLE AREA */
//       const vars = g.variants.filter(v => (v.cartons || 0) > 0);

//       let sizes = [
//         ...new Set(vars.map(v => v.size?.trim().toUpperCase()))
//       ].filter(Boolean);

//       let colors = [
//         ...new Set(vars.map(v => v.color?.trim() || '-'))
//       ].slice(0, 7);

//       let tableY = 120;

//       // 4 columns per table
//       const chunk = 4;
//       for (let s = 0; s < sizes.length; s += chunk) {
//         const sizeBlock = sizes.slice(s, s + chunk);
//         tableY = drawTable(doc, rightX + 8, tableY, sizeBlock, colors, vars);
//         tableY += 16;
//       }

//       /* FOOTER */
//       doc
//         .fillColor('#ff5252')
//         .fontSize(8)
//         .text(
//           `Page ${i + 1} of ${groups.length}  |  Stock Verified From Live Ledger`,
//           rightX,
//           PAGE_H - 20,
//           { width: RIGHT_W - 15, align: 'center' }
//         );
//     }

//     doc.end();
//   } catch (e) {
//     console.error(e);
//     res.status(500).send('PDF generation failed');
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const PDFKit = require('pdfkit');
const Product = require('../models/Product');
const SalaryEntry = require('../models/SalaryEntry');
const History = require('../models/History');
const axios = require('axios');
const auth = require('../middlewares/auth');
const Company = require('../models/Company');

/* ---------------- THEME ---------------- */
const BG_COLOR = '#ECEFF1';     // very light grey
const HEADER_COLOR = '#6B5B2E'; // dark khaki / luxury brown
const TABLE_HEAD = '#5A4A1F';
const ROW_DARK = '#F1F1E8';
const ROW_LIGHT = '#FAFAF4';
const ACCENT = '#B71C1C';

/* ---------------- HELPERS ---------------- */

const nowIND = () =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

const fmtDate = d =>
  d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

const vGroup = (t = '', g = '') => {
  t = (t || '').toLowerCase();
  g = (g || '').toLowerCase();
  if (t === 'eva')
    return { order: 2 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
  if (t === 'pu')
    return { order: 7 + ['ladies', 'kids_ladies', 'gents', 'kids_gents'].indexOf(g) };
  return { order: 99 };
};

/* ---------------- ROUTE ---------------- */

router.post('/generate-pdf', auth, async (req, res) => {
  try {
    const { includeImages, filters = {}, showRate, showMRP, productIds = [] } =
      req.body;

    const companyId = req.user.companyId;
    const company = await Company.findById(companyId);
    const companyName = company ? company.name : 'Stock Report';
    const safeFileName = companyName.replace(/[^a-zA-Z0-9 _-]/g, '').trim().replace(/\s+/g, '-');

    /* ---------------- QUERY ---------------- */
    const q = productIds.length
      ? { _id: { $in: productIds }, companyId, isDeleted: { $ne: true } }
      : {
          companyId,
          isDeleted: { $ne: true },
          ...Object.fromEntries(
            Object.entries(filters)
              .filter(([_, v]) => v)
              .map(([k, v]) => [k, new RegExp(v, 'i')])
          )
        };

    const prods = await Product.find(q).lean();
    const prodIds = prods.map(p => p._id);

    /* -------- LIVE CARTON CALCULATION -------- */

    const salaryTotals = await SalaryEntry.aggregate([
      { $match: { product: { $in: prodIds } } },
      { $group: { _id: '$product', total: { $sum: '$cartons' } } }
    ]);

    const challanTotals = await History.aggregate([
      { $match: { product: { $in: prodIds }, action: 'CHALLAN_OUT' } },
      {
        $group: {
          _id: '$product',
          totalOut: { $sum: { $abs: '$quantityChanged' } }
        }
      }
    ]);

    const salaryMap = new Map();
    salaryTotals.forEach(s =>
      salaryMap.set(s._id.toString(), s.total)
    );

    const challanMap = new Map();
    challanTotals.forEach(c =>
      challanMap.set(c._id.toString(), c.totalOut)
    );

    // Inject LIVE cartons
    prods.forEach(p => {
      const s = salaryMap.get(p._id.toString()) || 0;
      const c = challanMap.get(p._id.toString()) || 0;
      p.cartons = Math.max(0, s - c);
    });

    /* ---------------- PDF SETUP ---------------- */

    const PAGE_W = 595;
    const PAGE_H = 720;

    const LEFT_W = 380; // wide image panel
    const RIGHT_W = PAGE_W - LEFT_W;

    const doc = new PDFKit({
      size: [PAGE_W, PAGE_H],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${safeFileName}-stock-report.pdf`
    );

    doc.pipe(res);

    /* ---------------- GROUP ---------------- */

    const grouped = prods.reduce((m, p) => {
      const key = `${p.article}-${p.gender}`.toUpperCase();
      if (!m[key]) {
        m[key] = { ...p, variants: [], image: p.image || null };
      }
      m[key].variants.push(p);
      if (!m[key].image && p.image) m[key].image = p.image;
      return m;
    }, {});

    const groups = Object.entries(grouped)
      .filter(([_, g]) =>
        g.variants.reduce((sum, v) => sum + (v.cartons || 0), 0) > 0
      )
      .sort((a, b) => {
        const A = a[1], B = b[1];
        return (
          vGroup(A.stockType, A.gender).order -
          vGroup(B.stockType, B.gender).order ||
          (A.series || '').localeCompare(B.series || '') ||
          A.article.localeCompare(B.article)
        );
      });

    /* ---------------- TABLE DRAWER ---------------- */

    const drawTable = (doc, x0, y0, sizes, colors, variants) => {
      const rowH = 20;
      // const colW = 46;
      // const labelW = 75;
      const colW = 34;
const labelW = 60;

      const totalW = labelW + sizes.length * colW;

      // HEADER
     // doc.rect(x0, y0, totalW, rowH).fillColor('#4A1F1F').fill();
      doc.rect(x0, y0, totalW, rowH).fillColor('#0B1F3B').fill()
      doc
        .fillColor('white')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('COLOR', x0 + 6, y0 + 6, { width: labelW - 10 });

      let hx = x0 + labelW;
      sizes.forEach(s => {
        doc.text(s, hx, y0 + 6, { width: colW, align: 'center' });
        hx += colW;
      });

      let y = y0 + rowH;

      colors.forEach((clr, i) => {
        doc
          .rect(x0, y, totalW, rowH)
          .fillColor(i % 2 ? ROW_DARK : ROW_LIGHT)
          .fill();

        doc
          .fillColor('#3E3A20')
          .font('Helvetica-Bold')
          .fontSize(9)
          .text(clr, x0 + 6, y + 6, { width: labelW - 10 });

        let cx = x0 + labelW;

        sizes.forEach(sz => {
          const v = variants.find(
            vv =>
              vv.color?.trim() === clr &&
              vv.size?.trim().toUpperCase() === sz
          );

          const val = v?.cartons || '-';

          doc
            .fillColor(val !== '-' ? '#263238' : '#999')
            .font(val !== '-' ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(9)
            .text(val.toString(), cx, y + 6, {
              width: colW,
              align: 'center'
            });

          cx += colW;
        });

        y += rowH;
      });

      return y;
    };

    /* ---------------- LOOP ---------------- */

    for (let i = 0; i < groups.length; i++) {
      if (i) doc.addPage();
      const g = groups[i][1];
      const now = nowIND();

      /* BACKGROUND */
     // doc.rect(0, 0, PAGE_W, PAGE_H).fillColor('#E6E6E6').fill();
     doc.rect(0, 0, PAGE_W, PAGE_H).fillColor('#E3F2FD').fill();

      /* ---------------- FULL WIDTH HEADER ---------------- */
      //doc.rect(0, 0, PAGE_W, 110).fillColor('#4A1F1F').fill();
      doc.rect(0, 0, PAGE_W, 110).fillColor('#0B1F3B').fill();

      doc
        .fillColor('white')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(`ARTICLE: ${g.article}`, 20, 20);

      doc
        .fontSize(11)
        .text(`Gender: ${g.gender}`, 20, 48);

      doc
        .fontSize(11)
        .text(
          `Stock: ${g.stockType || '-'}   |   Series: ${g.series || '-'}`,
          20,
          68
        );

      doc
        .fontSize(11)
        .text(
          `Report: ${fmtDate(now)}   |   Pairs/Carton: ${g.pairPerCarton || '-'}`,
          20,
          88
        );

      /* LEFT IMAGE PANEL (CONTAIN MODE — NO CROP) */
      const leftX = 0;
      const leftY = 120;
      const leftW = LEFT_W;
      const leftH = PAGE_H - 140;

      if (includeImages && g.image) {
        try {
          const img = await axios.get(g.image, { responseType: 'arraybuffer' });
          const buf = Buffer.from(img.data, 'binary');

          const imgObj = doc.openImage(buf);
          const iw = imgObj.width;
          const ih = imgObj.height;

          const pad = 10;
          const cx = leftX + pad;
          const cy = leftY + pad;
          const cw = leftW - pad * 2;
          const ch = leftH - pad * 2;

          // CONTAIN (NO CROP)
          const scale = Math.min(cw / iw, ch / ih);
          const sw = iw * scale;
          const sh = ih * scale;

          const dx = cx + (cw - sw) / 2;
          const dy = cy + (ch - sh) / 2;

          doc.image(buf, dx, dy, {
            width: sw,
            height: sh
          });
        } catch (e) {
          console.error('Image load error:', e.message);
        }
      }

      /* TABLE AREA */
      const vars = g.variants.filter(v => (v.cartons || 0) > 0);

      let sizes = [
        ...new Set(vars.map(v => v.size?.trim().toUpperCase()))
      ].filter(Boolean);

      let colors = [
        ...new Set(vars.map(v => v.color?.trim() || '-'))
      ].slice(0, 7);

      let tableY = 130;
      const rightX = LEFT_W + 10;

      // 4 columns per table
      const chunk = 4;
      for (let s = 0; s < sizes.length; s += chunk) {
        const sizeBlock = sizes.slice(s, s + chunk);
        tableY = drawTable(doc, rightX, tableY, sizeBlock, colors, vars);
        tableY += 18;
      }

      /* FOOTER */
      doc
        .fillColor(ACCENT)
        .fontSize(9)
        .text(
          `Page ${i + 1} of ${groups.length}`,
          0,
          PAGE_H - 18,
          { width: PAGE_W, align: 'center' }
        );
    }

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).send('PDF generation failed');
  }
});

module.exports = router;
