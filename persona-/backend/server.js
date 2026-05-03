

// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');

// // Custom utilities & middleware
// const connectDB = require('./config/db');
// const { notFound, errorHandler } = require('./middlewares/error');

// // Route imports
// const authRoutes = require('./routes/auth');
// const productRoutes = require('./routes/products');
// const categoryRoutes = require('./routes/categoryRoutes');

// const salaryRoutes = require('./routes/salaryRoutes');
// const pdfRoutes = require('./routes/pdfRoutes');

// // ✅ Challan routes
// const challanRoutes = require('./routes/challanRoutes');
// const challanPdfRoutes = require('./routes/challanPdfRoutes');

// // ✅ Upload route import
// const uploadRoutes = require('./routes/uploadRoutes');

// // Initialize express app
// const app = express();

// // Connect to MongoDB
// connectDB();

// // ✅ CORS Configuration (FIXED)
// app.use(cors({
//   origin: [
//     'https://dazzling-pika-056e2c.netlify.app',  // ← Your actual Netlify domain
//     'https://persona-pfqu.vercel.app',           // ← Vercel domain (if needed)
//      'https://persona-3.onrender.com',
//     'http://localhost:3000'                      // ← Local development
//   ],
// //  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], 
//   allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
//   credentials: true
// }));
   
// app.use(express.json());

// // ✅ Static files serve करने के लिए
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/salary', salaryRoutes);
// app.use('/api/pdf', pdfRoutes);

// // ✅ Challan related routes
// app.use('/api/challans', challanRoutes);
// app.use('/api/challan-pdf', challanPdfRoutes);

// // ✅ Upload Routes
// app.use('/api/upload', uploadRoutes);
// const historyRoutes = require('./routes/history.routes');

// app.use('/api/history', historyRoutes);

// // Error Handling
// app.use(notFound);
// app.use(errorHandler);

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');

// Initialize express app
const app = express();

// Custom utilities & middleware
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/error');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categoryRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const challanRoutes = require('./routes/challanRoutes');
const challanPdfRoutes = require('./routes/challanPdfRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const historyRoutes = require('./routes/history.routes');
const tallyRoutes       = require('./routes/tallyRoutes');
const accountingRoutes  = require('./routes/accountingRoutes');

// Connect to MongoDB
connectDB();

// 🔥 IMPORTANT: middleware order
app.use(cors({
 origin: [
    'https://business-system-psi.vercel.app', // ✅ ADD THIS
    'http://localhost:3000'
  ],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

app.use(express.json());

// ✅ COOKIE PARSER (yaha hona chahiye)
app.use(cookieParser());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/challan-pdf', challanPdfRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/tally', tallyRoutes);
app.use('/api/accounting', accountingRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Tally push ke liye timeout 10 min karo
server.timeout = 600000;