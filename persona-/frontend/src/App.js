// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { AuthProvider } from './context/AuthContext';
// import PrivateRoute from './components/PrivateRoute';
// import Layout from './components/Layout';

// import Login from './pages/Login';
// import Dashboard from './components/Dashboard';

// import Products from './pages/Products';
// import ProductAdd from './pages/ProductAdd';
// import ProductEdit from './pages/ProductEdit';
// import StockHistory from './pages/StockHistory';
// import ProductImport from './pages/ProductImport';
// import SalaryReport from './pages/SalaryReport';
// import PDFGenerator from './pages/PDFGenerator';
// import DeletedProducts from './pages/DeletedProducts';

// import PuGents from './pages/PuGents';
// import PuLadies from './pages/PuLadies';
// import PuKidsMale from './pages/PuKidsMale';
// import PuKidsFemale from './pages/PuKidsFemale';

// import EvaGents from './pages/EvaGents';
// import EvaLadies from './pages/EvaLadies';
// import EvaKidsMale from './pages/EvaKidsMale';
// import EvaKidsFemale from './pages/EvaKidsFemale';

// import NewGents from './pages/NewGents';
// import NewLadies from './pages/NewLadies';
// import NewKidsMale from './pages/NewKidsMale';
// import NewKidsFemale from './pages/NewKidsFemale';

// import ChallanForm from './pages/ChallanForm'; // ✅ Newly added import
// import ChallanList from './pages/ChallanList'; // ✅ New import for listing challans
// //import HistoryPage from './pages/HistoryPage';
// import HistoryTable from './components/HistoryTable';
// import SalaryEntryEdit from './pages/SalaryEntryEdit'; 
// // Remove or ignore: import HistoryPage from './pages/HistoryPage';

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <ToastContainer position="bottom-right" autoClose={3000} />
        
//         <Routes>
          
//           Public Route
//           <Route path="/login" element={<Login />} />
         

//           {/* Protected Routes */}
//           <Route
//             element={
//               <PrivateRoute>
//                 <Layout />
//               </PrivateRoute>
//             }
//           >
//             {/* Dashboard home */}
//             <Route path="/" element={<Dashboard />} />

//             {/* Product management */}
//             <Route path="/products" element={<Products />} />
//             <Route path="/products/add" element={<ProductAdd />} />
//             <Route path="/products/:id/edit" element={<ProductEdit />} />
//             <Route path="/products/history" element={<StockHistory />} />
//             <Route path="/products/import" element={<ProductImport />} />
//             <Route path="/products/salary-report" element={<SalaryReport />} />
//             <Route path="/products/pdf-generator" element={<PDFGenerator />} />
//             <Route path="/products/deleted" element={<DeletedProducts />} />

//             {/* PU Category */}
//             <Route path="/products/pu/gents" element={<PuGents />} />
//             <Route path="/products/pu/ladies" element={<PuLadies />} />
//             <Route path="/products/pu/kids-male" element={<PuKidsMale />} />
//             <Route path="/products/pu/kids-female" element={<PuKidsFemale />} />

//             {/* EVA Category */}
//             <Route path="/products/eva/gents" element={<EvaGents />} />
//             <Route path="/products/eva/ladies" element={<EvaLadies />} />
//             <Route path="/products/eva/kids-male" element={<EvaKidsMale />} />
//             <Route path="/products/eva/kids-female" element={<EvaKidsFemale />} />

//             {/* New Category */}
//             <Route path="/products/new/gents" element={<NewGents />} />
//             <Route path="/products/new/ladies" element={<NewLadies />} />
//             <Route path="/products/new/kids-male" element={<NewKidsMale />} />
//             <Route path="/products/new/kids-female" element={<NewKidsFemale />} />

//             {/* Challan Routes */}
//             <Route path="/challans/add" element={<ChallanForm />} /> {/* ✅ Add Challan */}
//             <Route path="/challans" element={<ChallanList />} /> {/* ✅ List Challans */}
           
//          <Route path="/history" element={<HistoryTable />} />
//          <Route path="/salary-entry/edit/:id" element={<SalaryEntryEdit />} />
           

//           </Route>
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }

// export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PartySummary from './pages/PartySummary';

// Context and Private Routing
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Core Pages
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import Dashboard from './components/Dashboard'; // Dashboard bhi pages mein ho sakta hai, par abhi theek hai

// Page Components
import Products from './pages/Products';
import ProductAdd from './pages/ProductAdd';

import StockHistory from './pages/StockHistory';
import ProductImport from './pages/ProductImport';
import SalaryReport from './pages/SalaryReport';
import PDFGenerator from './pages/PDFGenerator';
import ChallanForm from './pages/ChallanForm';
import ChallanList from './pages/ChallanList';
import EditChallan from './pages/EditChallan';
import SalaryEntryEdit from './pages/SalaryEntryEdit';
import Tally from './pages/Tally';

// ✅ CORRECTED: HistoryTable ab 'pages' folder se import hoga
import HistoryTable from './pages/HistoryTable'; 

// Category Pages


function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="bottom-right" autoClose={3000} />
        
        <Routes>
          
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterCompany />} />
          
          {/* Protected Routes */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Dashboard home */}
            <Route path="/" element={<Dashboard />} />

            {/* Product management */}
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<ProductAdd />} />
            
            <Route path="/products/history" element={<StockHistory />} />
            <Route path="/products/import" element={<ProductImport />} />
            <Route path="/products/salary-report" element={<SalaryReport />} />
            <Route path="/products/pdf-generator" element={<PDFGenerator />} />
            
            {/* Category Routes */}
           

            {/* Challan Routes */}
            <Route path="/challans/add" element={<ChallanForm />} />
            <Route path="/challans" element={<ChallanList />} />
            
            {/* History and Salary Edit Routes (Corrected) */}
            <Route path="/history" element={<HistoryTable />} />
            <Route path="/salary-entry/edit/:id" element={<SalaryEntryEdit />} />
            <Route path="/party-summary" element={<PartySummary />} />
            <Route path="/challan-out/edit/:id" element={<EditChallan />} />
            <Route path="/tally" element={<Tally />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
