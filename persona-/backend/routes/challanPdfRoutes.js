



const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const Challan = require('../models/Challan');
const Product = require('../models/Product');
const Company = require('../models/Company');
const mongoose = require('mongoose');
const axios = require('axios');

// Helper functions
// const nowIND = () => new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Kolkata'}));
// const fmtDate = d => d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'});
const fmtDateT = d => d.toLocaleString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric',
                                               hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});

function getVirtualGroup(stockType, gender) {
  const st = (stockType || '').toLowerCase();
  const gen = (gender || '').toLowerCase();
  if (st === 'pu') {
    if (gen === 'ladies') return { group: 'PU LADIES', order: 7 };
    if (gen === 'kids_ladies') return { group: 'PU KID LADIES', order: 8 };
    if (gen === 'gents') return { group: 'PU GENTS', order: 9 };
    if (gen === 'kids_gents') return { group: 'PU KIDS GENTS', order: 10 };
    return { group: 'PU OTHER', order: 11 };
  }
  if (st === 'eva') {
    if (gen === 'ladies') return { group: 'EVA LADIES', order: 2 };
    if (gen === 'kids_ladies') return { group: 'EVA KID LADIES', order: 3 };
    if (gen === 'gents') return { group: 'EVA GENTS', order: 4 };
    if (gen === 'kids_gents') return { group: 'EVA KIDS GENTS', order: 5 };
    return { group: 'EVA OTHER', order: 6 };
  }
  return { group: 'OTHER', order: 99 };
}

function extractSeriesPref(series) {
  const match = (series || '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

const vGroup = (t='',g='')=>{
  t=t.toLowerCase(); g=g.toLowerCase();
  if(t==='eva') return {order:2+['ladies','kids_ladies','gents','kids_gents'].indexOf(g)};
  if(t==='pu' ) return {order:7+['ladies','kids_ladies','gents','kids_gents'].indexOf(g)};
  return {order:99};
};
/* ---------------- THEME ---------------- */
const BG_COLOR = '#E3F2FD';
const HEADER_COLOR = '#0B1F3B';
const TABLE_HEAD = '#0B1F3B';
// const ROW_DARK = '#F8FBFF';
// const ROW_LIGHT =  '#EAF4FF';
const ROW_DARK = '#F1F1E8';
const ROW_LIGHT = '#FAFAF4';
const ACCENT = '#0B1F3B';

/* ---------------- HELPERS ---------------- */

const nowIND = () =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));

const fmtDate = d =>
  d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
// Route 1: Original Challan PDF (unchanged)
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid Challan ID format"
      });
    }

    const challan = await Challan.findById(req.params.id);

    if (!challan) {
      return res.status(404).json({
        success: false,
        error: 'Challan not found'
      });
    }

    const company = await Company.findById(challan.companyId);
    const companyName = company ? company.name.toUpperCase() : 'YOUR COMPANY';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="challan-${challan.invoiceNo.replace('/', '-')}.pdf"`);

    const doc = new PDFDocument({
      margin: 40,
      size: 'A4'
    });

    doc.pipe(res);

    doc.fontSize(20).font('Helvetica-Bold').text(companyName, { align: 'center' });
    doc.fontSize(14).font('Helvetica').text('ESTIMATE', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Original Copy', 450, 80);
    doc.moveDown(1.5);

    const leftCol = 50;
    const rightCol = 320;
    let leftY = doc.y;
    let rightY = leftY;

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Party Name', leftCol, leftY, { continued: true });
    doc.font('Helvetica').text(` : ${challan.partyName}`, { 
      width: rightCol - leftCol - 20,
      continued: false 
    });
    leftY = doc.y + 8;
    
    doc.font('Helvetica-Bold').text('L.R. No.', leftCol, leftY, { continued: true });
    doc.font('Helvetica').text(' : ____________________', { continued: false });

    const totalCartons = challan.items.reduce((sum, item) => sum + item.cartons, 0);
    const formattedDate = new Date(challan.date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const rightFields = [
      { label: 'Date', value: formattedDate },
      { label: 'Invoice No.', value: challan.invoiceNo },
      { label: 'Station', value: challan.station },
      { label: 'Marka', value: challan.marka || 'N/A' },
      { label: 'Transport', value: challan.transport },
      { label: 'Cartons', value: totalCartons.toString() }
    ];

    rightFields.forEach((field, index) => {
      const y = rightY + (index * 16);
      doc.font('Helvetica-Bold').text(field.label, rightCol, y, { continued: true });
      doc.font('Helvetica').text(` : ${field.value}`, { continued: false });
    });

    doc.moveDown(2);

    const tableTop = doc.y + 10;
    const tableLeft = 40;
    
    const columns = [
      { label: 'Article Name', x: tableLeft, width: 100 },
      { label: 'Color', x: tableLeft + 100, width: 70 },
      { label: 'Size', x: tableLeft + 170, width: 45 },
      { label: 'No. of\nCRTN', x: tableLeft + 215, width: 50 },
      { label: 'Pair/\nCRTN', x: tableLeft + 265, width: 50 },
      { label: 'Total\nPair', x: tableLeft + 315, width: 50 },
      { label: 'Rate/\nPair', x: tableLeft + 365, width: 65 },
      { label: 'Amount', x: tableLeft + 430, width: 80 }
    ];

    let headerY = tableTop;
    doc.fontSize(9).font('Helvetica-Bold');

    columns.forEach(col => {
      doc.text(col.label, col.x, headerY, { 
        width: col.width, 
        align: 'center' 
      });
    });

    const tableWidth = columns[columns.length - 1].x + columns[columns.length - 1].width - tableLeft;
    doc.rect(tableLeft, headerY - 5, tableWidth, 25).stroke();
    
    let currentX = tableLeft;
    columns.forEach(col => {
      currentX += col.width;
      if (currentX < tableLeft + tableWidth) {
        doc.moveTo(currentX, headerY - 5).lineTo(currentX, headerY + 20).stroke();
      }
    });

    let rowY = headerY + 25;
    let totalAmount = 0;
    let serialNo = 1;

    doc.font('Helvetica').fontSize(8);

    challan.items.forEach(item => {
      doc.rect(tableLeft, rowY, tableWidth, 15).stroke();
      
      currentX = tableLeft;
      columns.forEach(col => {
        currentX += col.width;
        if (currentX < tableLeft + tableWidth) {
          doc.moveTo(currentX, rowY).lineTo(currentX, rowY + 15).stroke();
        }
      });

      const rowData = [
        `${serialNo}. ${item.article}`,
        item.color,
        item.size,
        item.cartons.toString(),
        item.pairPerCarton.toString(),
        item.totalPair.toString(),
        `Rs. ${item.rate.toFixed(2)}`,
        `Rs. ${item.amount.toFixed(2)}`
      ];

      columns.forEach((col, index) => {
        doc.text(rowData[index], col.x + 2, rowY + 3, { 
          width: col.width - 4, 
          align: index === 0 ? 'left' : 'center' 
        });
      });

      totalAmount += item.amount;
      rowY += 15;
      serialNo++;
    });

    rowY += 10;
    const totalPairs = challan.items.reduce((sum, item) => sum + item.totalPair, 0);
    
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Totals c/o`, tableLeft, rowY);
    doc.text(`${totalCartons} Cart`, tableLeft + 2, rowY, { align: 'center' });
    doc.text(`${totalPairs}`, tableLeft + 90, rowY, { align: 'center' });
    
    rowY += 20;
    doc.fontSize(12).font('Helvetica-Bold');
    doc.text(`Grand Total: Rs. ${totalAmount.toFixed(2)}`, tableLeft + 350, rowY);

    if (challan.gstPercent && challan.gstPercent > 0) {
      const halfGst = (challan.gstPercent / 2).toFixed(1);

      if (challan.isInterState) {
        rowY += 22;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`IGST (${challan.gstPercent}%): Rs. ${(challan.igst || 0).toFixed(2)}`, tableLeft + 330, rowY);
      } else {
        rowY += 22;
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(`CGST (${halfGst}%): Rs. ${(challan.cgst || 0).toFixed(2)}`, tableLeft + 330, rowY);
        rowY += 18;
        doc.text(`SGST (${halfGst}%): Rs. ${(challan.sgst || 0).toFixed(2)}`, tableLeft + 330, rowY);
      }

      rowY += 22;
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text(`Total with GST: Rs. ${(challan.totalAmountWithGST || totalAmount).toFixed(2)}`, tableLeft + 330, rowY);
    }

    doc.end();

  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate PDF' 
    });
  }
});




router.get('/:id/products', async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid Challan ID" });
    }

    const challan = await Challan.findById(req.params.id);
    if (!challan) {
      return res.status(404).json({ error: "Challan not found" });
    }

    /* ---------------- FETCH PRODUCTS (ONLY CHALLAN QTY) ---------------- */

    let products = [];

    for (const item of challan.items) {
      const prod = await Product.findOne({
        article: item.article,
        color: item.color,
        size: item.size,
        isDeleted: { $ne: true }
      }).lean();

      if (prod) {
        prod.cartons = item.cartons;   // ✅ only challan cartons
        products.push(prod);
      }
    }

    products = products.filter(p => (p.cartons || 0) > 0);

    if (!products.length) {
      return res.status(404).json({ error: "No products in challan" });
    }

    /* ---------------- GROUP BY ARTICLE + GENDER ---------------- */

    // const grouped = products.reduce((m, p) => {
    //   const key = `${p.article}-${p.gender}`.toUpperCase();
    //   if (!m[key]) m[key] = { ...p, variants: [] };
    //   m[key].variants.push(p);
    //   return m;
    // }, {});
    const grouped = products.reduce((m, p) => {
  const key = `${p.article}-${p.gender}`.toUpperCase();

  if (!m[key]) {
    m[key] = {
      article: p.article,
      gender: p.gender,
      image: p.image || null,
      variants: []
    };
  }

  // If group has no image but current product has one → assign it
  if (!m[key].image && p.image) {
    m[key].image = p.image;
  }

  m[key].variants.push(p);

  return m;
}, {});

    const groups = Object.entries(grouped);

    /* ---------------- PDF SETUP ---------------- */

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="challan-products-${challan.invoiceNo || 'invoice'}.pdf"`
    );

    const doc = new PDFDocument({
      size: [595, 720],
      margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    doc.pipe(res);

    const PAGE_W = 595;
    const PAGE_H = 720;
    const LEFT_W = 360;

    /* ---------------- LOOP ---------------- */

    for (let i = 0; i < groups.length; i++) {

      if (i) doc.addPage();

      const g = groups[i][1];
      const now = nowIND();

      /* Background */
      doc.rect(0, 0, PAGE_W, PAGE_H).fillColor(BG_COLOR).fill();

      /* Header */
      doc.rect(0, 0, PAGE_W, 110).fillColor(HEADER_COLOR).fill();

      doc.fillColor('white')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text(`ARTICLE: ${g.article}`, 20, 20);

      doc.fontSize(11)
        .text(`Gender: ${g.gender}`, 20, 48)
        .text(`Challan No: ${challan.invoiceNo}`, 20, 68)
        .text(`Date: ${fmtDate(now)}`, 20, 88);

      /* LEFT IMAGE */

      const leftY = 130;
      const leftH = PAGE_H - 160;

      if (g.image) {
        try {
          const img = await axios.get(g.image, { responseType: 'arraybuffer' });
          const buf = Buffer.from(img.data);

          const imgObj = doc.openImage(buf);
          const scale = Math.min(
            (LEFT_W - 20) / imgObj.width,
            (leftH - 20) / imgObj.height
          );

          const sw = imgObj.width * scale;
          const sh = imgObj.height * scale;

          const dx = 10 + (LEFT_W - sw) / 2;
          const dy = leftY + (leftH - sh) / 2;

          doc.image(buf, dx, dy, { width: sw, height: sh });

        } catch (err) {
          console.log("Image load failed");
        }
      }

      /* ---------------- TABLE ---------------- */

      const vars = g.variants;

      const sizes = [...new Set(vars.map(v => v.size?.toUpperCase()))];
      const colors = [...new Set(vars.map(v => v.color))];

      let tableY = 150;
      const rightX = LEFT_W + 10;

      const rowH = 24;
      const colW = 42;
      const labelW = 80;
      const totalW = labelW + sizes.length * colW;

      /* Header row */
      doc.rect(rightX, tableY, totalW, rowH)
        .fillColor(TABLE_HEAD).fill();

      doc.fillColor('white')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('COLOR', rightX + 6, tableY + 6, { width: labelW - 10 });

      let hx = rightX + labelW;

      sizes.forEach(s => {
        doc.text(s, hx, tableY + 6, { width: colW, align: 'center' });
        hx += colW;
      });

      tableY += rowH;

      /* Data rows */

      colors.forEach((clr, iRow) => {

        doc.rect(rightX, tableY, totalW, rowH)
          .fillColor(iRow % 2 ? ROW_DARK : ROW_LIGHT)
          .fill();

        doc.fillColor('#333')
          .font('Helvetica-Bold')
          .text(clr, rightX + 6, tableY + 6, { width: labelW - 10 });

        let cx = rightX + labelW;

        sizes.forEach(sz => {

          const v = vars.find(
            vv => vv.color === clr && vv.size?.toUpperCase() === sz
          );

          const val = v?.cartons || '-';

          doc.fillColor(val !== '-' ? '#000' : '#aaa')
            .font(val !== '-' ? 'Helvetica-Bold' : 'Helvetica')
            .text(val.toString(), cx, tableY + 6, {
              width: colW,
              align: 'center'
            });

          cx += colW;
        });

        tableY += rowH;
      });

      /* Footer */

      doc.fillColor(ACCENT)
        .fontSize(9)
        .text(
          `Page ${i + 1} of ${groups.length}`,
          0,
          PAGE_H - 20,
          { width: PAGE_W, align: 'center' }
        );
    }

    doc.end();

  } catch (err) {
    console.error("Challan PDF Error:", err);
    res.status(500).json({ error: "PDF generation failed" });
  }
});

module.exports = router;