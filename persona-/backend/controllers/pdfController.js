const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const axios = require('axios');

pdfMake.vfs = pdfFonts.pdfMake.vfs;

exports.generateProductPDF = async (req, res) => {
  try {
    const { includeImages, selectedProperties } = req.body;
    
    // Fetch products from DB (adjust query as per your needs)
    const products = await Product.find({}).lean();

    // PDF Definition
    const docDefinition = {
      content: [],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 12, fillColor: '#f0f0f0' }
      }
    };

    // Add content for each product
    for (const product of products) {
      const content = [];
      
      // Add image if enabled and available
      // if (includeImages && product.imageUrl) {
      //   const imageData = await axios.get(product.imageUrl, { responseType: 'arraybuffer' });
      //   content.push({ 
      //     image: `data:image/jpeg;base64,${Buffer.from(imageData.data).toString('base64')}`,
      //     width: 150,
      //     margin: [0, 0, 0, 10]
      //   });
      // }

      // if (includeImages && product.imageUrl) {
if (includeImages && product.image) {
  const imageData = await axios.get(product.image, { responseType: 'arraybuffer' });
  content.push({
    image: `data:image/jpeg;base64,${Buffer.from(imageData.data).toString('base64')}`,
    width: 150,
    margin: [0, 0, 0, 10]
  });
}


      // Add selected properties
      const propRows = selectedProperties.map(prop => ({
        text: `${prop}: ${product[prop] || '-'}`,
        margin: [0, 0, 0, 5]
      }));
      
      content.push(...propRows, { text: '', pageBreak: 'after' });
      docDefinition.content.push(...content);
    }

    // Generate PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);
    pdfDoc.getBuffer(buffer => {
      res.setHeader('Content-Type', 'application/pdf');
      res.send(buffer);
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
