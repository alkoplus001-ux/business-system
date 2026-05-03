const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePDF = async (challan, productsMap, companyName = 'YOUR COMPANY') => {
  return new Promise((resolve, reject) => {
    try {
      const uploadsDir = path.join(__dirname, '../uploads/challans');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const fileName = `challan_${challan.invoiceNo}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Header
      doc.fontSize(18).text(companyName.toUpperCase(), { align: 'center' }).moveDown(0.2);
      doc.fontSize(14).text('ESTIMATE', { align: 'center' }).moveDown(1);

      // Info
      doc.fontSize(10);
      doc.text(`Party Name: ${challan.party}`, 40, 90);
      doc.text(`Date: ${new Date(challan.date).toLocaleDateString('en-IN')}`, 400, 90);
      doc.text(`Invoice No: ${challan.invoiceNo}`, 400, 105);
      doc.text(`Station: ${challan.station || ''}`, 400, 120);
      doc.text(`Transport: ${challan.transport || ''}`, 400, 135);
      doc.text(`Cartons: ${challan.cartons || ''}`, 400, 150);

      // Table header
      doc.moveDown(2);
      const tableTop = 170;
      doc.font('Helvetica-Bold');
      doc.text('S.No', 40, tableTop);
      doc.text('Article', 80, tableTop);
      doc.text('No. of CRTN', 200, tableTop);
      doc.text('Pair/CRTN', 280, tableTop);
      doc.text('Total Pair', 360, tableTop);
      doc.text('Rate', 440, tableTop);
      doc.text('Amount', 500, tableTop);
      doc.font('Helvetica');

      // Table rows
      let y = tableTop + 20;
      let totalPairs = 0;
      let totalAmount = 0;
      challan.items.forEach((item, i) => {
        const product = productsMap[item.product.toString()];
        const amount = item.quantity * item.rate;
        totalPairs += item.quantity;
        totalAmount += amount;
        doc.text(i + 1, 40, y);
        doc.text(product.article, 80, y);
        doc.text(item.cartons, 200, y);
        doc.text(item.pairPerCarton, 280, y);
        doc.text(item.quantity, 360, y);
        doc.text(item.rate, 440, y);
        doc.text(amount.toFixed(2), 500, y);
        y += 20;
      });

      doc.font('Helvetica-Bold');
      doc.text('Total', 360, y);
      doc.text(totalPairs, 400, y);
      doc.text(totalAmount.toFixed(2), 500, y);
      doc.font('Helvetica');

      doc.end();

      writeStream.on('finish', () => {
        resolve(`/uploads/challans/${fileName}`);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generatePDF };
