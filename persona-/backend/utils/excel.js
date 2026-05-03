const ExcelJS = require('exceljs');

// Function to read Excel file (agar read karna hai)
async function readExcel(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);  // Pehla sheet
  const data = [];
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    data.push(row.values);  // Row data array mein push kar
  });
  return data;
}

// Function to write Excel file (agar write karna hai, jaise export)
async function writeExcel(filePath, data) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Sheet1');
  
  // Headers add kar (apne columns ke hisaab se)
  sheet.addRow(['Id', 'Name', 'Price', 'Quantity']);  // Example columns
  
  // Data rows add kar
  data.forEach(row => {
    sheet.addRow(row);
  });
  
  await workbook.xlsx.writeFile(filePath);
  console.log('Excel file written successfully.');
}

module.exports = { readExcel, writeExcel };  // Export functions jo productController mein use hote hain
