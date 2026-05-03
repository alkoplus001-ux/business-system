
// // import React, { useState, useEffect, useCallback } from "react";
// // import Select from "react-select";

// // const SalaryReport = () => {
// //   const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate, setToDate] = useState("");
// //   const [report, setReport] = useState([]);
// //   const [workers, setWorkers] = useState([]);
// //   const [rates, setRates] = useState({});

// //   // Fetch Salary Report
// //   const fetchReport = useCallback(async () => {
// //     if (!fromDate || !toDate) return;
// //     try {
// //     const res = await fetch(
// //       `/api/salary/salary-report?from=${fromDate}&to=${toDate}&worker=${worker.value}`,
// //       {
// //         headers: {
// //           'Content-Type': 'application/json',
// //           'x-auth-token': localStorage.getItem('token') // ✅ Manual token add
// //         }
// //       }
// //     );
// //       const data = await res.json();
// //       const allData = data.data || [];

// //       const uniqueWorkers = [...new Set(allData.map((item) => item.worker))];
// //       const workerOptions = [
// //         { value: "all", label: "All Workers" },
// //         ...uniqueWorkers.map((w) => ({ value: w, label: w })),
// //       ];

// //       setWorkers(workerOptions);

// //       if (worker.value === "all") {
// //         setReport(allData);
// //       } else {
// //         setReport(allData.filter((item) => item.worker === worker.value));
// //       }
// //     } catch (error) {
// //       console.error("Fetch error:", error);
// //       setReport([]);
// //       setWorkers([]);
// //     }
// //   }, [fromDate, toDate, worker]);

// //   useEffect(() => {
// //     if (fromDate && toDate) {
// //       fetchReport();
// //     }
// //   }, [fetchReport, fromDate, toDate]);

// //   const handleFromDateChange = (e) => {
// //     const newFromDate = e.target.value;
// //     setFromDate(newFromDate);
// //     if (toDate && new Date(toDate) < new Date(newFromDate)) {
// //       setToDate("");
// //     }
// //   };

// //   const handleToDateChange = (e) => {
// //     const newToDate = e.target.value;
// //     if (new Date(newToDate) < new Date(fromDate)) {
// //       alert("⚠️ To Date cannot be earlier than From Date!");
// //       return;
// //     }
// //     setToDate(newToDate);
// //   };

// //   const handleRateChange = (article, gender, rate) => {
// //     let value = parseFloat(rate) || 0;
// //     if (value > 10000) value = 10000;
// //     value = Math.floor(value * 100) / 100;
// //     setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
// //   };

// //   const getSalaryForArticle = (article, gender, cartons, pairPerCarton) => {
// //     const rate = rates[`${article}_${gender}`] || 0;
// //     return (cartons * pairPerCarton * rate).toFixed(2);
// //   };

// //   const getTotalSalaryForWorker = (workerData) => {
// //     return workerData.articles
// //       .reduce(
// //         (acc, article) =>
// //           acc +
// //           parseFloat(
// //             getSalaryForArticle(
// //               article.article,
// //               article.gender,
// //               article.cartons,
// //               article.pairPerCarton
// //             )
// //           ),
// //         0
// //       )
// //       .toFixed(2);
// //   };

// //   const totalSalary = report
// //     .reduce((acc, worker) => acc + parseFloat(getTotalSalaryForWorker(worker)), 0)
// //     .toFixed(2);

// //   const handlePrint = () => window.print();

// //   const formatDateRange = () => {
// //     if (!fromDate || !toDate) return "";
// //     const fromFormatted = new Date(fromDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     const toFormatted = new Date(toDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     return `${fromFormatted} to ${toFormatted}`;
// //   };

// //   return (
// //     <div className="salary-report-container">
// //       <style jsx>{`
// //         .salary-report-container {
// //           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
// //           min-height: 100vh;
// //           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
// //           padding: 2rem 1rem;
// //         }

// //         .report-header {
// //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// //           color: white;
// //           padding: 1.5rem;
// //           border-radius: 20px 20px 0 0;
// //           text-align: center;
// //           position: relative;
// //           overflow: hidden;
// //         }

// //         .company-logo {
// //           width: 80px;
// //           height: 80px;
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           margin: 0 auto;
// //           border: 3px solid rgba(255, 255, 255, 0.3);
// //         }

// //         .company-logo img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .main-card {
// //           background: white;
// //           border-radius: 0 0 20px 20px;
// //           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
// //           overflow: hidden;
// //           max-width: 1400px;
// //           margin: 0 auto;
// //         }

// //         .filter-section {
// //           background: #f8faff;
// //           padding: 2rem;
// //           border-bottom: 2px solid #e2e8f0;
// //         }

// //         .filter-grid {
// //           display: grid;
// //           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
// //           gap: 1.5rem;
// //           align-items: end;
// //           margin-bottom: 1rem;
// //         }

// //         .filter-group {
// //           display: flex;
// //           flex-direction: column;
// //         }

// //         .filter-label {
// //           font-weight: 600;
// //           color: #2d3748;
// //           margin-bottom: 0.5rem;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //         }

// //         .modern-input {
// //           background: white;
// //           border: 2px solid #e2e8f0;
// //           border-radius: 12px;
// //           padding: 0.75rem 1rem;
// //           font-size: 1rem;
// //           transition: all 0.3s ease;
// //           font-weight: 500;
// //         }

// //         .modern-input:focus {
// //           outline: none;
// //           border-color: #667eea;
// //           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
// //           transform: translateY(-1px);
// //         }

// //         .action-buttons {
// //           display: flex;
// //           justify-content: flex-end;
// //           gap: 1rem;
// //           margin-top: 1rem;
// //         }

// //         .print-button {
// //           background: linear-gradient(45deg, #667eea, #764ba2);
// //           color: white;
// //           border: none;
// //           padding: 0.75rem 2rem;
// //           border-radius: 12px;
// //           font-size: 1rem;
// //           font-weight: 600;
// //           cursor: pointer;
// //           transition: all 0.3s ease;
// //           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
// //         }

// //         .print-button:hover {
// //           transform: translateY(-2px);
// //           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
// //         }

// //         .report-content {
// //           padding: 2rem;
// //         }

// //         .no-data-card {
// //           background: white;
// //           padding: 3rem;
// //           text-align: center;
// //           border-radius: 16px;
// //           border: 2px dashed #cbd5e0;
// //           color: #718096;
// //         }

// //         /* ============ SINGLE PAGE CHALLAN FORMAT ============ */
// //         .challan-format {
// //           background: white;
// //           width: 100%;
// //         }

// //         .challan-header {
// //           background: #fff;
// //           padding: 1rem;
// //           border-bottom: 3px solid #667eea;
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //         }

// //         .company-section {
// //           display: flex;
// //           align-items: center;
// //           gap: 1rem;
// //         }

// //         .company-logo-print {
// //           width: 60px;
// //           height: 60px;
// //           background: rgba(102, 126, 234, 0.1);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           border: 2px solid #667eea;
// //         }

// //         .company-logo-print img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .company-info h2 {
// //           margin: 0;
// //           font-size: 1.8rem;
// //           color: #2d3748;
// //           font-weight: 800;
// //         }

// //         .report-info {
// //           text-align: right;
// //         }

// //         .report-info h3 {
// //           margin: 0;
// //           color: #667eea;
// //           font-size: 1.4rem;
// //           font-weight: 700;
// //         }

// //         .report-info p {
// //           margin: 0;
// //           color: #718096;
// //           font-size: 1rem;
// //         }

// //         .main-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 1rem;
// //           font-size: 1rem;
// //         }

// //         .main-table th {
// //           background: linear-gradient(90deg, #667eea, #764ba2);
// //           color: white;
// //           padding: 0.8rem 0.6rem;
// //           text-align: center;
// //           font-weight: 700;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //           border: 1px solid #5a6fd8;
// //         }

// //         .main-table td {
// //           padding: 0.7rem 0.6rem;
// //           text-align: center;
// //           border: 1px solid #e2e8f0;
// //           vertical-align: middle;
// //           font-weight: 500;
// //         }

// //         .main-table tbody tr:nth-child(even) {
// //           background: #f8faff;
// //         }

// //         .worker-name {
// //           background: #edf2f7;
// //           font-weight: 700;
// //           color: #2d3748;
// //           text-align: left;
// //           padding: 0.8rem;
// //           font-size: 1rem;
// //         }

// //         .rate-input-mini {
// //           width: 70px;
// //           padding: 0.4rem;
// //           border: 1px solid #e2e8f0;
// //           border-radius: 4px;
// //           text-align: center;
// //           font-size: 0.9rem;
// //         }

// //         .salary-value {
// //           font-weight: 700;
// //           color: #22c55e;
// //         }

// //         .worker-total {
// //           background: #f0fff4 !important;
// //           font-weight: 700;
// //           color: #065f46;
// //         }

// //         .grand-total-row {
// //           background: linear-gradient(90deg, #22c55e, #16a34a) !important;
// //           color: white;
// //         }

// //         .grand-total-row td {
// //           font-weight: 800;
// //           font-size: 1rem;
// //           padding: 1rem 0.6rem;
// //         }

// //         /* ============ PRINT FIXES ============ */
// //         @media print {
// //           .no-print,
// //           nav, 
// //           .navbar, 
// //           header.site-header,
// //           .site-header,
// //           footer,
// //           .site-footer,
// //           .footer,
// //           .copyright,
// //           .all-rights-reserved {
// //             display: none !important;
// //             visibility: hidden !important;
// //           }
          
// //           body {
// //             margin: 0 !important;
// //             padding: 0 !important;
// //             font-size: 14px !important;
// //           }
          
// //           .salary-report-container {
// //             background: white !important;
// //             padding: 0 !important;
// //             margin: 0 !important;
// //           }
          
// //           .main-card {
// //             box-shadow: none !important;
// //             border-radius: 0 !important;
// //             margin: 0 !important;
// //             max-width: 100% !important;
// //           }
          
// //           .challan-format {
// //             page-break-inside: avoid;
// //             page-break-after: avoid;
// //             max-width: 100%;
// //             margin: 0;
// //             padding: 0;
// //           }
          
// //           @page {
// //             size: A4 landscape;
// //             margin: 10mm 8mm;
// //           }
          
// //           .challan-header {
// //             padding: 1rem !important;
// //             margin-bottom: 0.8rem;
// //           }
          
// //           .company-info h2 {
// //             font-size: 1.6rem !important;
// //           }
          
// //           .report-info h3 {
// //             font-size: 1.3rem !important;
// //           }
          
// //           .report-info p {
// //             font-size: 0.9rem !important;
// //           }
          
// //           .main-table {
// //             font-size: 12px !important;
// //             margin-top: 0.8rem !important;
// //           }
          
// //           .main-table th {
// //             padding: 6px 4px !important;
// //             font-size: 11px !important;
// //             background: #666 !important;
// //             color: white !important;
// //           }
          
// //           .main-table td {
// //             padding: 5px 4px !important;
// //             font-size: 11px !important;
// //           }
          
// //           .worker-name {
// //             padding: 6px 8px !important;
// //             font-size: 12px !important;
// //             font-weight: 800 !important;
// //           }
          
// //           .rate-input-mini {
// //             width: 50px !important;
// //             padding: 2px !important;
// //             font-size: 10px !important;
// //           }
          
// //           .grand-total-row {
// //             background: #333 !important;
// //             color: white !important;
// //           }
          
// //           .grand-total-row td {
// //             font-size: 13px !important;
// //             font-weight: 800 !important;
// //             padding: 7px 4px !important;
// //           }
          
// //           .main-table,
// //           .challan-format {
// //             transform: scale(0.98);
// //             transform-origin: top left;
// //           }
// //         }

// //         @media (max-width: 768px) {
// //           .salary-report-container {
// //             padding: 1rem 0.5rem;
// //           }
// //           .filter-grid {
// //             grid-template-columns: 1fr;
// //             gap: 1rem;
// //           }
// //           .action-buttons {
// //             justify-content: center;
// //           }
// //           .challan-header {
// //             flex-direction: column;
// //             gap: 1rem;
// //             text-align: center;
// //           }
// //         }
// //       `}</style>

// //       <div className="main-card">
// //         {/* Clean Header - Only Logo */}
// //         <div className="report-header">
// //           <div className="company-logo">
// //             <img src="/logo.png" alt="Company Logo" />
// //           </div>
// //         </div>

// //         {/* Filter Section */}
// //         <div className="filter-section no-print">
// //           <div className="filter-grid">
// //             <div className="filter-group">
// //               <label className="filter-label">From Date</label>
// //               <input
// //                 type="date"
// //                 value={fromDate}
// //                 onChange={handleFromDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">To Date</label>
// //               <input
// //                 type="date"
// //                 min={fromDate}
// //                 value={toDate}
// //                 onChange={handleToDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">Worker Selection</label>
// //               <Select
// //                 options={workers}
// //                 value={worker}
// //                 onChange={(selected) => setWorker(selected)}
// //                 isSearchable={true}
// //                 isClearable={false}
// //                 placeholder="Select worker..."
// //                 styles={{
// //                   control: (base) => ({
// //                     ...base,
// //                     background: 'white',
// //                     border: '2px solid #e2e8f0',
// //                     borderRadius: '12px',
// //                     padding: '0.25rem 0.5rem',
// //                     fontSize: '1rem',
// //                     fontWeight: '500',
// //                     boxShadow: 'none',
// //                     '&:hover': { borderColor: '#667eea' }
// //                   }),
// //                   option: (base, state) => ({
// //                     ...base,
// //                     backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8faff' : 'white',
// //                     color: state.isSelected ? 'white' : '#2d3748',
// //                     fontWeight: '500'
// //                   })
// //                 }}
// //               />
// //             </div>
// //           </div>

// //           <div className="action-buttons">
// //             <button onClick={handlePrint} className="print-button">
// //               🖨️ Print Salary Report
// //             </button>
// //           </div>
// //         </div>

// //         {/* Report Content */}
// //         <div className="report-content">
// //           {report.length > 0 ? (
// //             <div className="challan-format">
// //               {/* Challan Header */}
// //               <div className="challan-header">
// //                 <div className="company-section">
// //                   <div className="company-logo-print">
// //                     <img src="/logo.png" alt="Logo" />
// //                   </div>
// //                   <div className="company-info">
// //                     <h2>GPFAX FOOTWEAR</h2>
// //                   </div>
// //                 </div>
// //                 <div className="report-info">
// //                   <h3>SALARY REPORT</h3>
// //                   <p>Period: {formatDateRange()}</p>
// //                   <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
// //                   <p>Grand Total: ₹{totalSalary}</p>
// //                 </div>
// //               </div>

// //               {/* ✅ Clean Table - No Extra Worker Column */}
// //               <table className="main-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Date</th>
// //                     <th>Article</th>
// //                     <th>Gender</th>
// //                     <th>Cartons</th>
// //                     <th>Pair/Crtn</th>
// //                     <th>Rate (₹)</th>
// //                     <th>Earnings (₹)</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {report.map((workerData) => (
// //                     <React.Fragment key={workerData.worker}>
// //                       {/* Worker Header Row */}
// //                       <tr>
// //                         <td colSpan="7" className="worker-name">
// //                           👤 {workerData.worker}
// //                         </td>
// //                       </tr>
                      
// //                       {/* Worker Articles */}
// //                       {workerData.articles.map((article, idx) => (
// //                         <tr key={`${workerData.worker}_${idx}`}>
// //                           <td>{article.date}</td>
// //                           <td style={{ fontWeight: '600' }}>{article.article}</td>
// //                           <td>{article.gender || "-"}</td>
// //                           <td style={{ fontWeight: '600', color: '#3b82f6' }}>{article.cartons}</td>
// //                           <td>{article.pairPerCarton}</td>
// //                           <td>
// //                             <input
// //                               type="number"
// //                               step="0.01"
// //                               max="10000"
// //                               value={rates[`${article.article}_${article.gender}`] || ""}
// //                               onChange={(e) =>
// //                                 handleRateChange(article.article, article.gender, e.target.value)
// //                               }
// //                               min="0"
// //                               className="rate-input-mini"
// //                               placeholder="0"
// //                             />
// //                           </td>
// //                           <td className="salary-value">
// //                             ₹{getSalaryForArticle(
// //                               article.article,
// //                               article.gender,
// //                               article.cartons,
// //                               article.pairPerCarton
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
                      
// //                       {/* Worker Total Row */}
// //                       <tr className="worker-total">
// //                         <td colSpan="6" style={{ textAlign: 'right', fontWeight: '700' }}>
// //                           Total for {workerData.worker}:
// //                         </td>
// //                         <td style={{ fontWeight: '700' }}>
// //                           ₹{getTotalSalaryForWorker(workerData)}
// //                         </td>
// //                       </tr>
// //                     </React.Fragment>
// //                   ))}
                  
// //                   {/* Grand Total Row */}
// //                   <tr className="grand-total-row">
// //                     <td colSpan="6" style={{ textAlign: 'right' }}>
// //                       🏆 GRAND TOTAL - ALL WORKERS:
// //                     </td>
// //                     <td>
// //                       ₹{totalSalary}
// //                     </td>
// //                   </tr>
// //                 </tbody>
// //               </table>
// //             </div>
// //           ) : (
// //             <div className="no-data-card">
// //               <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📊</div>
// //               <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
// //                 {fromDate && toDate
// //                   ? "No production records found"
// //                   : "Select Date Range to Generate Report"}
// //               </div>
// //               <div style={{ opacity: '0.7' }}>
// //                 {fromDate && toDate
// //                   ? "Try adjusting your date range or worker selection"
// //                   : "Please select both from and to dates to view salary data"}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SalaryReport;
// // import React, { useState, useEffect, useCallback } from "react";
// // import Select from "react-select";
// // import api from "../utils/api";          // ✅ नया import

// // const SalaryReport = () => {
// //   const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate,   setToDate]   = useState("");
// //   const [report,   setReport]   = useState([]);
// //   const [workers,  setWorkers]  = useState([]);
// //   const [rates,    setRates]    = useState({});

// //   /* ---------------- FETCH ---------------- */
// //   const fetchReport = useCallback(async () => {
// //     if (!fromDate || !toDate) return;
// //     try {
// //       /* केवल यह लाइन बदली—axios instance यूज़ */
// //       const { data } = await api.get("/salary/salary-report", {
// //         params: { from: fromDate, to: toDate, worker: worker.value }
// //       });

// //       const allData = data.data || [];

// //       /* worker-dropdown */
// //       const uniq = [...new Set(allData.map(i => i.worker))];
// //       setWorkers([{ value:"all", label:"All Workers" },
// //                   ...uniq.map(w => ({ value:w, label:w }))]);

// //       setReport(worker.value === "all"
// //         ? allData
// //         : allData.filter(i => i.worker === worker.value)
// //       );
// //     } catch (err) {
// //       console.error("Fetch error:", err);
// //       setReport([]);
// //       setWorkers([]);
// //     }
// //   }, [fromDate, toDate, worker]);

// //   useEffect(() => {
// //     if (fromDate && toDate) {
// //       fetchReport();
// //     }
// //   }, [fetchReport, fromDate, toDate]);

// //   const handleFromDateChange = (e) => {
// //     const newFromDate = e.target.value;
// //     setFromDate(newFromDate);
// //     if (toDate && new Date(toDate) < new Date(newFromDate)) {
// //       setToDate("");
// //     }
// //   };

// //   const handleToDateChange = (e) => {
// //     const newToDate = e.target.value;
// //     if (new Date(newToDate) < new Date(fromDate)) {
// //       alert("⚠️ To Date cannot be earlier than From Date!");
// //       return;
// //     }
// //     setToDate(newToDate);
// //   };

// //   const handleRateChange = (article, gender, rate) => {
// //     let value = parseFloat(rate) || 0;
// //     if (value > 10000) value = 10000;
// //     value = Math.floor(value * 100) / 100;
// //     setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
// //   };

// //   const getSalaryForArticle = (article, gender, cartons, pairPerCarton) => {
// //     const rate = rates[`${article}_${gender}`] || 0;
// //     return (cartons * pairPerCarton * rate).toFixed(2);
// //   };

// //   const getTotalSalaryForWorker = (workerData) => {
// //     return workerData.articles
// //       .reduce(
// //         (acc, article) =>
// //           acc +
// //           parseFloat(
// //             getSalaryForArticle(
// //               article.article,
// //               article.gender,
// //               article.cartons,
// //               article.pairPerCarton
// //             )
// //           ),
// //         0
// //       )
// //       .toFixed(2);
// //   };

// //   const totalSalary = report
// //     .reduce((acc, worker) => acc + parseFloat(getTotalSalaryForWorker(worker)), 0)
// //     .toFixed(2);

// //   const handlePrint = () => window.print();

// //   const formatDateRange = () => {
// //     if (!fromDate || !toDate) return "";
// //     const fromFormatted = new Date(fromDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     const toFormatted = new Date(toDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     return `${fromFormatted} to ${toFormatted}`;
// //   };

// //   return (
// //     <div className="salary-report-container">
// //       <style jsx>{`
// //         .salary-report-container {
// //           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
// //           min-height: 100vh;
// //           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
// //           padding: 2rem 1rem;
// //         }

// //         .report-header {
// //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// //           color: white;
// //           padding: 1.5rem;
// //           border-radius: 20px 20px 0 0;
// //           text-align: center;
// //           position: relative;
// //           overflow: hidden;
// //         }

// //         .company-logo {
// //           width: 80px;
// //           height: 80px;
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           margin: 0 auto;
// //           border: 3px solid rgba(255, 255, 255, 0.3);
// //         }

// //         .company-logo img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .main-card {
// //           background: white;
// //           border-radius: 0 0 20px 20px;
// //           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
// //           overflow: hidden;
// //           max-width: 1400px;
// //           margin: 0 auto;
// //         }

// //         .filter-section {
// //           background: #f8faff;
// //           padding: 2rem;
// //           border-bottom: 2px solid #e2e8f0;
// //         }

// //         .filter-grid {
// //           display: grid;
// //           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
// //           gap: 1.5rem;
// //           align-items: end;
// //           margin-bottom: 1rem;
// //         }

// //         .filter-group {
// //           display: flex;
// //           flex-direction: column;
// //         }

// //         .filter-label {
// //           font-weight: 600;
// //           color: #2d3748;
// //           margin-bottom: 0.5rem;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //         }

// //         .modern-input {
// //           background: white;
// //           border: 2px solid #e2e8f0;
// //           border-radius: 12px;
// //           padding: 0.75rem 1rem;
// //           font-size: 1rem;
// //           transition: all 0.3s ease;
// //           font-weight: 500;
// //         }

// //         .modern-input:focus {
// //           outline: none;
// //           border-color: #667eea;
// //           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
// //           transform: translateY(-1px);
// //         }

// //         .action-buttons {
// //           display: flex;
// //           justify-content: flex-end;
// //           gap: 1rem;
// //           margin-top: 1rem;
// //         }

// //         .print-button {
// //           background: linear-gradient(45deg, #667eea, #764ba2);
// //           color: white;
// //           border: none;
// //           padding: 0.75rem 2rem;
// //           border-radius: 12px;
// //           font-size: 1rem;
// //           font-weight: 600;
// //           cursor: pointer;
// //           transition: all 0.3s ease;
// //           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
// //         }

// //         .print-button:hover {
// //           transform: translateY(-2px);
// //           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
// //         }

// //         .report-content {
// //           padding: 2rem;
// //         }

// //         .no-data-card {
// //           background: white;
// //           padding: 3rem;
// //           text-align: center;
// //           border-radius: 16px;
// //           border: 2px dashed #cbd5e0;
// //           color: #718096;
// //         }

// //         /* ============ SINGLE PAGE CHALLAN FORMAT ============ */
// //         .challan-format {
// //           background: white;
// //           width: 100%;
// //         }

// //         .challan-header {
// //           background: #fff;
// //           padding: 1rem;
// //           border-bottom: 3px solid #667eea;
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //         }

// //         .company-section {
// //           display: flex;
// //           align-items: center;
// //           gap: 1rem;
// //         }

// //         .company-logo-print {
// //           width: 60px;
// //           height: 60px;
// //           background: rgba(102, 126, 234, 0.1);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           border: 2px solid #667eea;
// //         }

// //         .company-logo-print img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .company-info h2 {
// //           margin: 0;
// //           font-size: 1.8rem;
// //           color: #2d3748;
// //           font-weight: 800;
// //         }

// //         .report-info {
// //           text-align: right;
// //         }

// //         .report-info h3 {
// //           margin: 0;
// //           color: #667eea;
// //           font-size: 1.4rem;
// //           font-weight: 700;
// //         }

// //         .report-info p {
// //           margin: 0;
// //           color: #718096;
// //           font-size: 1rem;
// //         }

// //         .main-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 1rem;
// //           font-size: 1rem;
// //         }

// //         .main-table th {
// //           background: linear-gradient(90deg, #667eea, #764ba2);
// //           color: white;
// //           padding: 0.8rem 0.6rem;
// //           text-align: center;
// //           font-weight: 700;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //           border: 1px solid #5a6fd8;
// //         }

// //         .main-table td {
// //           padding: 0.7rem 0.6rem;
// //           text-align: center;
// //           border: 1px solid #e2e8f0;
// //           vertical-align: middle;
// //           font-weight: 500;
// //         }

// //         .main-table tbody tr:nth-child(even) {
// //           background: #f8faff;
// //         }

// //         .worker-name {
// //           background: #edf2f7;
// //           font-weight: 700;
// //           color: #2d3748;
// //           text-align: left;
// //           padding: 0.8rem;
// //           font-size: 1rem;
// //         }

// //         .rate-input-mini {
// //           width: 70px;
// //           padding: 0.4rem;
// //           border: 1px solid #e2e8f0;
// //           border-radius: 4px;
// //           text-align: center;
// //           font-size: 0.9rem;
// //         }

// //         .salary-value {
// //           font-weight: 700;
// //           color: #22c55e;
// //         }

// //         .worker-total {
// //           background: #f0fff4 !important;
// //           font-weight: 700;
// //           color: #065f46;
// //         }

// //         .grand-total-row {
// //           background: linear-gradient(90deg, #22c55e, #16a34a) !important;
// //           color: white;
// //         }

// //         .grand-total-row td {
// //           font-weight: 800;
// //           font-size: 1rem;
// //           padding: 1rem 0.6rem;
// //         }

// //         /* ============ PRINT FIXES ============ */
// //         @media print {
// //           .no-print,
// //           nav, 
// //           .navbar, 
// //           header.site-header,
// //           .site-header,
// //           footer,
// //           .site-footer,
// //           .footer,
// //           .copyright,
// //           .all-rights-reserved {
// //             display: none !important;
// //             visibility: hidden !important;
// //           }
          
// //           body {
// //             margin: 0 !important;
// //             padding: 0 !important;
// //             font-size: 14px !important;
// //           }
          
// //           .salary-report-container {
// //             background: white !important;
// //             padding: 0 !important;
// //             margin: 0 !important;
// //           }
          
// //           .main-card {
// //             box-shadow: none !important;
// //             border-radius: 0 !important;
// //             margin: 0 !important;
// //             max-width: 100% !important;
// //           }
          
// //           .challan-format {
// //             page-break-inside: avoid;
// //             page-break-after: avoid;
// //             max-width: 100%;
// //             margin: 0;
// //             padding: 0;
// //           }
          
// //           @page {
// //             size: A4 landscape;
// //             margin: 10mm 8mm;
// //           }
          
// //           .challan-header {
// //             padding: 1rem !important;
// //             margin-bottom: 0.8rem;
// //           }
          
// //           .company-info h2 {
// //             font-size: 1.6rem !important;
// //           }
          
// //           .report-info h3 {
// //             font-size: 1.3rem !important;
// //           }
          
// //           .report-info p {
// //             font-size: 0.9rem !important;
// //           }
          
// //           .main-table {
// //             font-size: 12px !important;
// //             margin-top: 0.8rem !important;
// //           }
          
// //           .main-table th {
// //             padding: 6px 4px !important;
// //             font-size: 11px !important;
// //             background: #666 !important;
// //             color: white !important;
// //           }
          
// //           .main-table td {
// //             padding: 5px 4px !important;
// //             font-size: 11px !important;
// //           }
          
// //           .worker-name {
// //             padding: 6px 8px !important;
// //             font-size: 12px !important;
// //             font-weight: 800 !important;
// //           }
          
// //           .rate-input-mini {
// //             width: 50px !important;
// //             padding: 2px !important;
// //             font-size: 10px !important;
// //           }
          
// //           .grand-total-row {
// //             background: #333 !important;
// //             color: white !important;
// //           }
          
// //           .grand-total-row td {
// //             font-size: 13px !important;
// //             font-weight: 800 !important;
// //             padding: 7px 4px !important;
// //           }
          
// //           .main-table,
// //           .challan-format {
// //             transform: scale(0.98);
// //             transform-origin: top left;
// //           }
// //         }

// //         @media (max-width: 768px) {
// //           .salary-report-container {
// //             padding: 1rem 0.5rem;
// //           }
// //           .filter-grid {
// //             grid-template-columns: 1fr;
// //             gap: 1rem;
// //           }
// //           .action-buttons {
// //             justify-content: center;
// //           }
// //           .challan-header {
// //             flex-direction: column;
// //             gap: 1rem;
// //             text-align: center;
// //           }
// //         }
// //           * 1) फिल्टर ग्रिड पहले से ही auto-fit था; मोबाइल पर 100% चौड़ाई */
// // @media (max-width:768px){
// //   .salary-report-container{padding:1rem .5rem;}
// //   .filter-grid{grid-template-columns:1fr;gap:1rem;}
// //   .action-buttons{justify-content:center;}
// //   .challan-header{flex-direction:column;gap:1rem;text-align:center;}
// // }

// // /* 2) मोबाइल-फ्रेंडली टेबल: thead हाइड, हर <td> के आगे label */
// // @media (max-width:768px){
// //   .main-table thead{display:none;}
// //   .main-table, .main-table tbody, .main-table tr,
// //   .main-table td{display:block;width:100%;}
// //   .main-table tr{margin:0 0 1rem;border:1px solid #e2e8f0;border-radius:8px;padding:.5rem;background:#fff;}
// //   .main-table td{
// //       padding-left:55%;
// //       text-align:left;
// //       position:relative;
// //       border:none;
// //       border-bottom:1px solid #f1f5f9;
// //       white-space:normal;
// //   }
// //   .main-table td::before{
// //       content:attr(data-label);
// //       position:absolute;
// //       left:1rem;
// //       top:50%;
// //       transform:translateY(-50%);
// //       font-weight:600;
// //       color:#667eea;
// //   }
// //   /* worker-header, totals, grand-total अलग रंग बरक़रार रखें */
// //   .worker-name,
// //   .worker-total,
// //   .grand-total-row{display:block;border:none;border-radius:6px;}
// //   .worker-name{padding:.8rem;background:#edf2f7;font-size:1rem;}
// //   .worker-total, .grand-total-row td{padding:.8rem;text-align:right;}
// // }

// // /* 3) rate-input चौड़ाई मोबाइल पर बड़ी दिखती तो न्यूनतम सेट */
// // @media (max-width:768px){
// //   .rate-input-mini{width:80px;}
// // }
// //       `}</style>

// //       <div className="main-card">
// //         {/* Clean Header - Only Logo */}
// //         <div className="report-header">
// //           <div className="company-logo">
// //             <img src="/logo.png" alt="Company Logo" />
// //           </div>
// //         </div>

// //         {/* Filter Section */}
// //         <div className="filter-section no-print">
// //           <div className="filter-grid">
// //             <div className="filter-group">
// //               <label className="filter-label">From Date</label>
// //               <input
// //                 type="date"
// //                 value={fromDate}
// //                 onChange={handleFromDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">To Date</label>
// //               <input
// //                 type="date"
// //                 min={fromDate}
// //                 value={toDate}
// //                 onChange={handleToDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">Worker Selection</label>
// //               <Select
// //                 options={workers}
// //                 value={worker}
// //                 onChange={(selected) => setWorker(selected)}
// //                 isSearchable={true}
// //                 isClearable={false}
// //                 placeholder="Select worker..."
// //                 styles={{
// //                   control: (base) => ({
// //                     ...base,
// //                     background: 'white',
// //                     border: '2px solid #e2e8f0',
// //                     borderRadius: '12px',
// //                     padding: '0.25rem 0.5rem',
// //                     fontSize: '1rem',
// //                     fontWeight: '500',
// //                     boxShadow: 'none',
// //                     '&:hover': { borderColor: '#667eea' }
// //                   }),
// //                   option: (base, state) => ({
// //                     ...base,
// //                     backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8faff' : 'white',
// //                     color: state.isSelected ? 'white' : '#2d3748',
// //                     fontWeight: '500'
// //                   })
// //                 }}
// //               />
// //             </div>
// //           </div>

// //           <div className="action-buttons">
// //             <button onClick={handlePrint} className="print-button">
// //               🖨️ Print Salary Report
// //             </button>
// //           </div>
// //         </div>

// //         {/* Report Content */}
// //         <div className="report-content">
// //           {report.length > 0 ? (
// //             <div className="challan-format">
// //               {/* Challan Header */}
// //               <div className="challan-header">
// //                 <div className="company-section">
// //                   <div className="company-logo-print">
// //                     <img src="/logo.png" alt="Logo" />
// //                   </div>
// //                   <div className="company-info">
// //                     <h2>GPFAX FOOTWEAR</h2>
// //                   </div>
// //                 </div>
// //                 <div className="report-info">
// //                   <h3>SALARY REPORT</h3>
// //                   <p>Period: {formatDateRange()}</p>
// //                   <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
// //                   <p>Grand Total: ₹{totalSalary}</p>
// //                 </div>
// //               </div>

// //               {/* ✅ Clean Table - No Extra Worker Column */}
// //               <table className="main-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Date</th>
// //                     <th>Article</th>
// //                     <th>Gender</th>
// //                     <th>Cartons</th>
// //                     <th>Pair/Crtn</th>
// //                     <th>Rate (₹)</th>
// //                     <th>Earnings (₹)</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {report.map((workerData) => (
// //                     <React.Fragment key={workerData.worker}>
// //                       {/* Worker Header Row */}
// //                       <tr>
// //                         <td colSpan="7" className="worker-name">
// //                           👤 {workerData.worker}
// //                         </td>
// //                       </tr>
                      
// //                       {/* Worker Articles */}
// //                       {workerData.articles.map((article, idx) => (
// //                         <tr key={`${workerData.worker}_${idx}`}>
// //                           <td data-label="Date">{article.date}</td>
// //                           <td data-label="Article" style={{fontWeight:'600'}}>{article.article}</td>
// //                           <td data-label="Gender">{article.gender || "-"}</td>
// //                           <td data-label="Cartons" style={{ fontWeight: '600', color: '#3b82f6' }}>{article.cartons}</td>
// //                           <td data-label="Pair/Crtn">{article.pairPerCarton}</td>
// //                           <td  data-label="Rate (₹)">
// //                             <input
// //                               type="number"
// //                               step="0.01"
// //                               max="10000"
// //                               value={rates[`${article.article}_${article.gender}`] || ""}
// //                               onChange={(e) =>
// //                                 handleRateChange(article.article, article.gender, e.target.value)
// //                               }
// //                               min="0"
// //                               className="rate-input-mini"
// //                               placeholder="0"
// //                             />
// //                           </td>
// //                           <td data-label="Earnings (₹)" className="salary-value">
// //                             ₹{getSalaryForArticle(
// //                               article.article,
// //                               article.gender,
// //                               article.cartons,
// //                               article.pairPerCarton
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
                      
// //                       {/* Worker Total Row */}
// //                       <tr className="worker-total">
// //                         <td colSpan="6" style={{ textAlign: 'right', fontWeight: '700' }}>
// //                           Total for {workerData.worker}:
// //                         </td>
// //                         <td style={{ fontWeight: '700' }}>
// //                           ₹{getTotalSalaryForWorker(workerData)}
// //                         </td>
// //                       </tr>
// //                     </React.Fragment>
// //                   ))}
                  
// //                   {/* Grand Total Row */}
// //                   <tr className="grand-total-row">
// //                     <td colSpan="6" style={{ textAlign: 'right' }}>
// //                       🏆 GRAND TOTAL - ALL WORKERS:
// //                     </td>
// //                     <td>
// //                       ₹{totalSalary}
// //                     </td>
// //                   </tr>
// //                 </tbody>
// //               </table>
// //             </div>
// //           ) : (
// //             <div className="no-data-card">
// //               <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📊</div>
// //               <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
// //                 {fromDate && toDate
// //                   ? "No production records found"
// //                   : "Select Date Range to Generate Report"}
// //               </div>
// //               <div style={{ opacity: '0.7' }}>
// //                 {fromDate && toDate
// //                   ? "Try adjusting your date range or worker selection"
// //                   : "Please select both from and to dates to view salary data"}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SalaryReport
// // import React, { useState, useEffect, useCallback } from "react";
// // import Select from "react-select";
// // import api from "../utils/api";

// // const SalaryReport = () => {
// //   const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate, setToDate] = useState("");
// //   const [report, setReport] = useState([]);
// //   const [workers, setWorkers] = useState([]);
// //   const [rates, setRates] = useState({});

// //   /* ---------------- FETCH ---------------- */
// //   const fetchReport = useCallback(async () => {
// //     if (!fromDate || !toDate) return;
// //     try {
// //       const { data } = await api.get("/salary/salary-report", {
// //         params: { from: fromDate, to: toDate, worker: worker.value }
// //       });

// //       const allData = data.data || [];

// //       /* worker-dropdown */
// //       const uniq = [...new Set(allData.map(i => i.worker))];
// //       setWorkers([{ value:"all", label:"All Workers" },
// //                   ...uniq.map(w => ({ value:w, label:w }))]);

// //       setReport(worker.value === "all"
// //         ? allData
// //         : allData.filter(i => i.worker === worker.value)
// //       );
// //     } catch (err) {
// //       console.error("Fetch error:", err);
// //       setReport([]);
// //       setWorkers([]);
// //     }
// //   }, [fromDate, toDate, worker]);

// //   useEffect(() => {
// //     if (fromDate && toDate) {
// //       fetchReport();
// //     }
// //   }, [fetchReport, fromDate, toDate]);

// //   const handleFromDateChange = (e) => {
// //     const newFromDate = e.target.value;
// //     setFromDate(newFromDate);
// //     if (toDate && new Date(toDate) < new Date(newFromDate)) {
// //       setToDate("");
// //     }
// //   };

// //   const handleToDateChange = (e) => {
// //     const newToDate = e.target.value;
// //     if (new Date(newToDate) < new Date(fromDate)) {
// //       alert("⚠️ To Date cannot be earlier than From Date!");
// //       return;
// //     }
// //     setToDate(newToDate);
// //   };

// //   const handleRateChange = (article, gender, rate) => {
// //     let value = parseFloat(rate) || 0;
// //     if (value > 10000) value = 10000;
// //     value = Math.floor(value * 100) / 100;
// //     setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
// //   };

// //   const getSalaryForArticle = (article, gender, cartons, pairPerCarton) => {
// //     const rate = rates[`${article}_${gender}`] || 0;
// //     return (cartons * pairPerCarton * rate).toFixed(2);
// //   };

// //   const getTotalSalaryForWorker = (workerData) => {
// //     return workerData.articles
// //       .reduce(
// //         (acc, article) =>
// //           acc +
// //           parseFloat(
// //             getSalaryForArticle(
// //               article.article,
// //               article.gender,
// //               article.cartons,
// //               article.pairPerCarton
// //             )
// //           ),
// //         0
// //       )
// //       .toFixed(2);
// //   };

// //   const totalSalary = report
// //     .reduce((acc, worker) => acc + parseFloat(getTotalSalaryForWorker(worker)), 0)
// //     .toFixed(2);

// //   const handlePrint = () => window.print();

// //   const formatDateRange = () => {
// //     if (!fromDate || !toDate) return "";
// //     const fromFormatted = new Date(fromDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     const toFormatted = new Date(toDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     return `${fromFormatted} to ${toFormatted}`;
// //   };

// //   return (
// //     <div className="salary-report-container">
// //       <style jsx>{`
// //         .salary-report-container {
// //           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
// //           min-height: 100vh;
// //           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
// //           padding: 2rem 1rem;
// //         }

// //         .report-header {
// //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// //           color: white;
// //           padding: 1.5rem;
// //           border-radius: 20px 20px 0 0;
// //           text-align: center;
// //           position: relative;
// //           overflow: hidden;
// //         }

// //         .company-logo {
// //           width: 80px;
// //           height: 80px;
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           margin: 0 auto;
// //           border: 3px solid rgba(255, 255, 255, 0.3);
// //         }

// //         .company-logo img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .main-card {
// //           background: white;
// //           border-radius: 0 0 20px 20px;
// //           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
// //           overflow: hidden;
// //           max-width: 1400px;
// //           margin: 0 auto;
// //         }

// //         .filter-section {
// //           background: #f8faff;
// //           padding: 2rem;
// //           border-bottom: 2px solid #e2e8f0;
// //         }

// //         .filter-grid {
// //           display: grid;
// //           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
// //           gap: 1.5rem;
// //           align-items: end;
// //           margin-bottom: 1rem;
// //         }

// //         .filter-group {
// //           display: flex;
// //           flex-direction: column;
// //         }

// //         .filter-label {
// //           font-weight: 600;
// //           color: #2d3748;
// //           margin-bottom: 0.5rem;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //         }

// //         .modern-input {
// //           background: white;
// //           border: 2px solid #e2e8f0;
// //           border-radius: 12px;
// //           padding: 0.75rem 1rem;
// //           font-size: 1rem;
// //           transition: all 0.3s ease;
// //           font-weight: 500;
// //         }

// //         .modern-input:focus {
// //           outline: none;
// //           border-color: #667eea;
// //           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
// //           transform: translateY(-1px);
// //         }

// //         .action-buttons {
// //           display: flex;
// //           justify-content: flex-end;
// //           gap: 1rem;
// //           margin-top: 1rem;
// //         }

// //         .print-button {
// //           background: linear-gradient(45deg, #667eea, #764ba2);
// //           color: white;
// //           border: none;
// //           padding: 0.75rem 2rem;
// //           border-radius: 12px;
// //           font-size: 1rem;
// //           font-weight: 600;
// //           cursor: pointer;
// //           transition: all 0.3s ease;
// //           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
// //         }

// //         .print-button:hover {
// //           transform: translateY(-2px);
// //           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
// //         }

// //         .report-content {
// //           padding: 2rem;
// //         }

// //         .no-data-card {
// //           background: white;
// //           padding: 3rem;
// //           text-align: center;
// //           border-radius: 16px;
// //           border: 2px dashed #cbd5e0;
// //           color: #718096;
// //         }

// //         /* ============ SINGLE PAGE CHALLAN FORMAT ============ */
// //         .challan-format {
// //           background: white;
// //           width: 100%;
// //         }

// //         .challan-header {
// //           background: #fff;
// //           padding: 1rem;
// //           border-bottom: 3px solid #667eea;
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //         }

// //         .company-section {
// //           display: flex;
// //           align-items: center;
// //           gap: 1rem;
// //         }

// //         .company-logo-print {
// //           width: 60px;
// //           height: 60px;
// //           background: rgba(102, 126, 234, 0.1);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           border: 2px solid #667eea;
// //         }

// //         .company-logo-print img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .company-info h2 {
// //           margin: 0;
// //           font-size: 1.8rem;
// //           color: #2d3748;
// //           font-weight: 800;
// //         }

// //         .report-info {
// //           text-align: right;
// //         }

// //         .report-info h3 {
// //           margin: 0;
// //           color: #667eea;
// //           font-size: 1.4rem;
// //           font-weight: 700;
// //         }

// //         .report-info p {
// //           margin: 0;
// //           color: #718096;
// //           font-size: 1rem;
// //         }

// //         .main-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 1rem;
// //           font-size: 1rem;
// //         }

// //         .main-table th {
// //           background: linear-gradient(90deg, #667eea, #764ba2);
// //           color: white;
// //           padding: 0.8rem 0.6rem;
// //           text-align: center;
// //           font-weight: 700;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //           border: 1px solid #5a6fd8;
// //         }

// //         .main-table td {
// //           padding: 0.7rem 0.6rem;
// //           text-align: center;
// //           border: 1px solid #e2e8f0;
// //           vertical-align: middle;
// //           font-weight: 500;
// //         }

// //         .main-table tbody tr:nth-child(even) {
// //           background: #f8faff;
// //         }

// //         .worker-name {
// //           background: #edf2f7;
// //           font-weight: 700;
// //           color: #2d3748;
// //           text-align: left;
// //           padding: 0.8rem;
// //           font-size: 1rem;
// //         }

// //         .rate-input-mini {
// //           width: 70px;
// //           padding: 0.4rem;
// //           border: 1px solid #e2e8f0;
// //           border-radius: 4px;
// //           text-align: center;
// //           font-size: 0.9rem;
// //         }

// //         .salary-value {
// //           font-weight: 700;
// //           color: #22c55e;
// //         }

// //         .worker-total {
// //           background: #f0fff4 !important;
// //           font-weight: 700;
// //           color: #065f46;
// //         }

// //         .grand-total-row {
// //           background: linear-gradient(90deg, #22c55e, #16a34a) !important;
// //           color: white;
// //         }

// //         .grand-total-row td {
// //           font-weight: 800;
// //           font-size: 1rem;
// //           padding: 1rem 0.6rem;
// //         }

// //         /* ============ ENHANCED MOBILE RESPONSIVE ============ */
// //         @media (max-width: 768px) {
// //           .salary-report-container {
// //             padding: 1rem 0.5rem;
// //           }
          
// //           .report-header {
// //             padding: 1rem;
// //           }

// //           .company-logo {
// //             width: 60px;
// //             height: 60px;
// //           }

// //           .filter-section {
// //             padding: 1rem;
// //           }
          
// //           .filter-grid {
// //             grid-template-columns: 1fr;
// //             gap: 1rem;
// //           }
          
// //           .action-buttons {
// //             justify-content: center;
// //           }

// //           .print-button {
// //             width: 100%;
// //             max-width: 300px;
// //           }
          
// //           .report-content {
// //             padding: 1rem;
// //           }

// //           .challan-header {
// //             flex-direction: column;
// //             gap: 1rem;
// //             text-align: center;
// //             padding: 1rem 0.5rem;
// //           }

// //           .company-section {
// //             justify-content: center;
// //           }

// //           .report-info {
// //             text-align: center;
// //           }

// //           .company-info h2 {
// //             font-size: 1.4rem;
// //           }

// //           .report-info h3 {
// //             font-size: 1.2rem;
// //           }

// //           .report-info p {
// //             font-size: 0.9rem;
// //           }

// //           /* Mobile Table Responsiveness */
// //           .main-table {
// //             font-size: 0.85rem;
// //             display: block;
// //             overflow-x: auto;
// //             white-space: nowrap;
// //           }

// //           .main-table thead {
// //             display: none;
// //           }

// //           .main-table tbody {
// //             display: block;
// //           }

// //           .main-table tr {
// //             display: block;
// //             margin-bottom: 1rem;
// //             border: 1px solid #e2e8f0;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             background: white;
// //             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //           }

// //           .main-table td {
// //             display: flex;
// //             justify-content: space-between;
// //             align-items: center;
// //             padding: 0.5rem 0;
// //             border: none;
// //             border-bottom: 1px solid #f1f5f9;
// //             text-align: left;
// //           }

// //           .main-table td:last-child {
// //             border-bottom: none;
// //           }

// //           .main-table td::before {
// //             content: attr(data-label);
// //             font-weight: 600;
// //             color: #667eea;
// //             flex: 0 0 40%;
// //             text-align: left;
// //           }

// //           .worker-name {
// //             background: #667eea !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             font-size: 1.1rem;
// //             margin-bottom: 0.5rem;
// //           }

// //           .worker-name::before {
// //             display: none;
// //           }

// //           .worker-total {
// //             background: #22c55e !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             font-weight: 700;
// //             font-size: 1rem;
// //           }

// //           .worker-total::before {
// //             display: none;
// //           }

// //           .grand-total-row {
// //             background: linear-gradient(135deg, #22c55e, #16a34a) !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1.5rem;
// //             font-weight: 800;
// //             font-size: 1.2rem;
// //           }

// //           .grand-total-row td::before {
// //             display: none;
// //           }

// //           .rate-input-mini {
// //             width: 100px;
// //             padding: 0.5rem;
// //             font-size: 1rem;
// //           }

// //           .salary-value {
// //             font-weight: 700;
// //             color: #22c55e;
// //             font-size: 1rem;
// //           }

// //           /* Special handling for total rows */
// //           .worker-total td,
// //           .grand-total-row td {
// //             justify-content: center;
// //             text-align: center;
// //             font-weight: 700;
// //           }
// //         }

// //         /* ============ PRINT STYLES ============ */
// //         @media print {
// //           .no-print,
// //           nav, 
// //           .navbar, 
// //           header.site-header,
// //           .site-header,
// //           footer,
// //           .site-footer,
// //           .footer,
// //           .copyright,
// //           .all-rights-reserved {
// //             display: none !important;
// //             visibility: hidden !important;
// //           }
          
// //           body {
// //             margin: 0 !important;
// //             padding: 0 !important;
// //             font-size: 14px !important;
// //           }
          
// //           .salary-report-container {
// //             background: white !important;
// //             padding: 0 !important;
// //             margin: 0 !important;
// //           }
          
// //           .main-card {
// //             box-shadow: none !important;
// //             border-radius: 0 !important;
// //             margin: 0 !important;
// //             max-width: 100% !important;
// //           }
          
// //           .challan-format {
// //             page-break-inside: avoid;
// //             page-break-after: avoid;
// //             max-width: 100%;
// //             margin: 0;
// //             padding: 0;
// //           }

// //           /* Reset mobile styles for print */
// //           .main-table {
// //             display: table !important;
// //             font-size: 12px !important;
// //             margin-top: 0.8rem !important;
// //           }

// //           .main-table thead {
// //             display: table-header-group !important;
// //           }

// //           .main-table tbody {
// //             display: table-row-group !important;
// //           }

// //           .main-table tr {
// //             display: table-row !important;
// //             margin: 0 !important;
// //             border: none !important;
// //             padding: 0 !important;
// //             background: transparent !important;
// //             box-shadow: none !important;
// //           }

// //           .main-table td {
// //             display: table-cell !important;
// //             padding: 5px 4px !important;
// //             border: 1px solid #e2e8f0 !important;
// //             text-align: center !important;
// //             font-size: 11px !important;
// //           }

// //           .main-table td::before {
// //             display: none !important;
// //           }
          
// //           @page {
// //             size: A4 landscape;
// //             margin: 10mm 8mm;
// //           }
          
// //           .challan-header {
// //             padding: 1rem !important;
// //             margin-bottom: 0.8rem;
// //             flex-direction: row !important;
// //             text-align: left !important;
// //           }
          
// //           .company-info h2 {
// //             font-size: 1.6rem !important;
// //           }

// //           .report-info {
// //             text-align: right !important;
// //           }
          
// //           .report-info h3 {
// //             font-size: 1.3rem !important;
// //           }
          
// //           .report-info p {
// //             font-size: 0.9rem !important;
// //           }
          
// //           .main-table th {
// //             padding: 6px 4px !important;
// //             font-size: 11px !important;
// //             background: #666 !important;
// //             color: white !important;
// //           }
          
// //           .worker-name {
// //             padding: 6px 8px !important;
// //             font-size: 12px !important;
// //             font-weight: 800 !important;
// //             background: #edf2f7 !important;
// //             color: #2d3748 !important;
// //             text-align: left !important;
// //           }
          
// //           .rate-input-mini {
// //             width: 50px !important;
// //             padding: 2px !important;
// //             font-size: 10px !important;
// //           }
          
// //           .grand-total-row {
// //             background: #333 !important;
// //             color: white !important;
// //           }
          
// //           .grand-total-row td {
// //             font-size: 13px !important;
// //             font-weight: 800 !important;
// //             padding: 7px 4px !important;
// //           }
          
// //           .main-table,
// //           .challan-format {
// //             transform: scale(0.98);
// //             transform-origin: top left;
// //           }
// //         }
// //       `}</style>

// //       <div className="main-card">
// //         {/* Clean Header - Only Logo */}
// //         <div className="report-header">
// //           <div className="company-logo">
// //             <img src="/logo.png" alt="Company Logo" />
// //           </div>
// //         </div>

// //         {/* Filter Section */}
// //         <div className="filter-section no-print">
// //           <div className="filter-grid">
// //             <div className="filter-group">
// //               <label className="filter-label">From Date</label>
// //               <input
// //                 type="date"
// //                 value={fromDate}
// //                 onChange={handleFromDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">To Date</label>
// //               <input
// //                 type="date"
// //                 min={fromDate}
// //                 value={toDate}
// //                 onChange={handleToDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">Worker Selection</label>
// //               <Select
// //                 options={workers}
// //                 value={worker}
// //                 onChange={(selected) => setWorker(selected)}
// //                 isSearchable={true}
// //                 isClearable={false}
// //                 placeholder="Select worker..."
// //                 styles={{
// //                   control: (base) => ({
// //                     ...base,
// //                     background: 'white',
// //                     border: '2px solid #e2e8f0',
// //                     borderRadius: '12px',
// //                     padding: '0.25rem 0.5rem',
// //                     fontSize: '1rem',
// //                     fontWeight: '500',
// //                     boxShadow: 'none',
// //                     '&:hover': { borderColor: '#667eea' }
// //                   }),
// //                   option: (base, state) => ({
// //                     ...base,
// //                     backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8faff' : 'white',
// //                     color: state.isSelected ? 'white' : '#2d3748',
// //                     fontWeight: '500'
// //                   })
// //                 }}
// //               />
// //             </div>
// //           </div>

// //           <div className="action-buttons">
// //             <button onClick={handlePrint} className="print-button">
// //               🖨️ Print Salary Report
// //             </button>
// //           </div>
// //         </div>

// //         {/* Report Content */}
// //         <div className="report-content">
// //           {report.length > 0 ? (
// //             <div className="challan-format">
// //               {/* Challan Header */}
// //               <div className="challan-header">
// //                 <div className="company-section">
// //                   <div className="company-logo-print">
// //                     <img src="/logo.png" alt="Logo" />
// //                   </div>
// //                   <div className="company-info">
// //                     <h2>GPFAX FOOTWEAR</h2>
// //                   </div>
// //                 </div>
// //                 <div className="report-info">
// //                   <h3>SALARY REPORT</h3>
// //                   <p>Period: {formatDateRange()}</p>
// //                   <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
// //                   <p>Grand Total: ₹{totalSalary}</p>
// //                 </div>
// //               </div>

// //               {/* ✅ Responsive Table with proper data-labels */}
// //               <table className="main-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Date</th>
// //                     <th>Article</th>
// //                     <th>Gender</th>
// //                     <th>Cartons</th>
// //                     <th>Pair/Crtn</th>
// //                     <th>Rate (₹)</th>
// //                     <th>Earnings (₹)</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {report.map((workerData) => (
// //                     <React.Fragment key={workerData.worker}>
// //                       {/* Worker Header Row */}
// //                       <tr>
// //                         <td colSpan="7" className="worker-name">
// //                           👤 {workerData.worker}
// //                         </td>
// //                       </tr>
                      
// //                       {/* Worker Articles */}
// //                       {workerData.articles.map((article, idx) => (
// //                         <tr key={`${workerData.worker}_${idx}`}>
// //                           <td data-label="Date:">{article.date}</td>
// //                           <td data-label="Article:" style={{fontWeight:'600'}}>{article.article}</td>
// //                           <td data-label="Gender:">{article.gender || "-"}</td>
// //                           <td data-label="Cartons:" style={{ fontWeight: '600', color: '#3b82f6' }}>{article.cartons}</td>
// //                           <td data-label="Pair/Crtn:">{article.pairPerCarton}</td>
// //                           <td data-label="Rate (₹):">
// //                             <input
// //                               type="number"
// //                               step="0.01"
// //                               max="10000"
// //                               value={rates[`${article.article}_${article.gender}`] || ""}
// //                               onChange={(e) =>
// //                                 handleRateChange(article.article, article.gender, e.target.value)
// //                               }
// //                               min="0"
// //                               className="rate-input-mini"
// //                               placeholder="0"
// //                             />
// //                           </td>
// //                           <td data-label="Earnings (₹):" className="salary-value">
// //                             ₹{getSalaryForArticle(
// //                               article.article,
// //                               article.gender,
// //                               article.cartons,
// //                               article.pairPerCarton
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
                      
// //                       {/* Worker Total Row */}
// //                       <tr className="worker-total">
// //                         <td colSpan="7" style={{ textAlign: 'center', fontWeight: '700' }}>
// //                           Total for {workerData.worker}: ₹{getTotalSalaryForWorker(workerData)}
// //                         </td>
// //                       </tr>
// //                     </React.Fragment>
// //                   ))}
                  
// //                   {/* Grand Total Row */}
// //                   <tr className="grand-total-row">
// //                     <td colSpan="7" style={{ textAlign: 'center' }}>
// //                       🏆 GRAND TOTAL - ALL WORKERS: ₹{totalSalary}
// //                     </td>
// //                   </tr>
// //                 </tbody>
// //               </table>
// //             </div>
// //           ) : (
// //             <div className="no-data-card">
// //               <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📊</div>
// //               <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
// //                 {fromDate && toDate
// //                   ? "No production records found"
// //                   : "Select Date Range to Generate Report"}
// //               </div>
// //               <div style={{ opacity: '0.7' }}>
// //                 {fromDate && toDate
// //                   ? "Try adjusting your date range or worker selection"
// //                   : "Please select both from and to dates to view salary data"}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SalaryReport;
// // import React, { useState, useEffect, useCallback, useMemo } from "react";
// // import Select from "react-select";
// // import api from "../utils/api";

// // const SalaryReport = () => {
// //   const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
// //   const [fromDate, setFromDate] = useState("");
// //   const [toDate, setToDate] = useState("");
// //   const [report, setReport] = useState([]);
// //   const [workers, setWorkers] = useState([]);
// //   const [rates, setRates] = useState({});
// //   const [search, setSearch] = useState("");

// //   /* ---------------- FETCH ---------------- */
// //   const fetchReport = useCallback(async () => {
// //     if (!fromDate || !toDate) return;
// //     try {
// //       const { data } = await api.get("/salary/salary-report", {
// //         params: { from: fromDate, to: toDate, worker: worker.value }
// //       });

// //       const allData = data.data || [];

// //       /* worker-dropdown */
// //       const uniq = [...new Set(allData.map(i => i.worker))];
// //       setWorkers([
// //         { value: "all", label: "All Workers" },
// //         ...uniq.map(w => ({ value: w, label: w }))
// //       ]);

// //       setReport(
// //         worker.value === "all"
// //           ? allData
// //           : allData.filter(i => i.worker === worker.value)
// //       );
// //     } catch (err) {
// //       console.error("Fetch error:", err);
// //       setReport([]);
// //       setWorkers([]);
// //     }
// //   }, [fromDate, toDate, worker]);

// //   useEffect(() => {
// //     if (fromDate && toDate) {
// //       fetchReport();
// //     }
// //   }, [fetchReport, fromDate, toDate]);

// //   const handleFromDateChange = (e) => {
// //     const newFromDate = e.target.value;
// //     setFromDate(newFromDate);
// //     if (toDate && new Date(toDate) < new Date(newFromDate)) {
// //       setToDate("");
// //     }
// //   };

// //   const handleToDateChange = (e) => {
// //     const newToDate = e.target.value;
// //     if (new Date(newToDate) < new Date(fromDate)) {
// //       alert("⚠️ To Date cannot be earlier than From Date!");
// //       return;
// //     }
// //     setToDate(newToDate);
// //   };

// //   const handleRateChange = (article, gender, rate) => {
// //     let value = parseFloat(rate) || 0;
// //     if (value > 10000) value = 10000;
// //     value = Math.floor(value * 100) / 100;
// //     setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
// //   };

// //   const getSalaryForArticle = (article, gender, cartons, pairPerCarton) => {
// //     const rate = rates[`${article}_${gender}`] || 0;
// //     return (cartons * pairPerCarton * rate).toFixed(2);
// //   };

// //   const getTotalSalaryForWorker = (workerData) => {
// //     return workerData.articles
// //       .reduce(
// //         (acc, article) =>
// //           acc +
// //           parseFloat(
// //             getSalaryForArticle(
// //               article.article,
// //               article.gender,
// //               article.cartons,
// //               article.pairPerCarton
// //             )
// //           ),
// //         0
// //       )
// //       .toFixed(2);
// //   };

// //   /* ---------------- SEARCH FILTER ---------------- */
// //   const normalizedSearch = search.trim().toLowerCase();

// //   const matchesSearch = useCallback(
// //     (a) => {
// //       if (!normalizedSearch) return true;
// //       const fields = [
// //         a.date,
// //         a.article,
// //         a.gender,
// //         String(a.cartons),
// //         String(a.pairPerCarton),
// //         String(rates[`${a.article}_${a.gender}`] || "")
// //       ];
// //       return fields.some(f => String(f || "").toLowerCase().includes(normalizedSearch));
// //     },
// //     [normalizedSearch, rates]
// //   );

// //   const filteredReport = useMemo(() => {
// //     if (!normalizedSearch) return report;
// //     return report
// //       .map(wd => ({
// //         ...wd,
// //         articles: wd.articles.filter(matchesSearch)
// //       }))
// //       .filter(wd => wd.articles.length > 0);
// //   }, [report, matchesSearch, normalizedSearch]);
// // // eslint-disable-next-line react-hooks/exhaustive-deps
// // const totalSalary = useMemo(() => {
// //   return filteredReport
// //     .reduce((acc, wd) => acc + parseFloat(getTotalSalaryForWorker(wd)), 0)
// //     .toFixed(2);
// // }, [filteredReport, rates, getTotalSalaryForWorker]);

// //   const handlePrint = () => window.print();

// //   const formatDateRange = () => {
// //     if (!fromDate || !toDate) return "";
// //     const fromFormatted = new Date(fromDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     const toFormatted = new Date(toDate).toLocaleDateString('en-IN', {
// //       day: '2-digit', month: 'short', year: 'numeric'
// //     });
// //     return `${fromFormatted} to ${toFormatted}`;
// //   };

// //   return (
// //     <div className="salary-report-container">
// //       <style jsx>{`
// //         .salary-report-container {
// //           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
// //           min-height: 100vh;
// //           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
// //           padding: 2rem 1rem;
// //         }

// //         .report-header {
// //           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
// //           color: white;
// //           padding: 1.5rem;
// //           border-radius: 20px 20px 0 0;
// //           text-align: center;
// //           position: relative;
// //           overflow: hidden;
// //         }

// //         .company-logo {
// //           width: 80px;
// //           height: 80px;
// //           background: rgba(255, 255, 255, 0.2);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           margin: 0 auto;
// //           border: 3px solid rgba(255, 255, 255, 0.3);
// //         }

// //         .company-logo img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .main-card {
// //           background: white;
// //           border-radius: 0 0 20px 20px;
// //           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
// //           overflow: hidden;
// //           max-width: 1400px;
// //           margin: 0 auto;
// //         }

// //         .filter-section {
// //           background: #f8faff;
// //           padding: 2rem;
// //           border-bottom: 2px solid #e2e8f0;
// //         }

// //         .filter-grid {
// //           display: grid;
// //           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
// //           gap: 1.5rem;
// //           align-items: end;
// //           margin-bottom: 1rem;
// //         }

// //         .filter-group {
// //           display: flex;
// //           flex-direction: column;
// //         }

// //         .filter-label {
// //           font-weight: 600;
// //           color: #2d3748;
// //           margin-bottom: 0.5rem;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //         }

// //         .modern-input {
// //           background: white;
// //           border: 2px solid #e2e8f0;
// //           border-radius: 12px;
// //           padding: 0.75rem 1rem;
// //           font-size: 1rem;
// //           transition: all 0.3s ease;
// //           font-weight: 500;
// //         }

// //         .modern-input:focus {
// //           outline: none;
// //           border-color: #667eea;
// //           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
// //           transform: translateY(-1px);
// //         }

// //         .action-buttons {
// //           display: flex;
// //           justify-content: flex-end;
// //           gap: 1rem;
// //           margin-top: 1rem;
// //         }

// //         .print-button {
// //           background: linear-gradient(45deg, #667eea, #764ba2);
// //           color: white;
// //           border: none;
// //           padding: 0.75rem 2rem;
// //           border-radius: 12px;
// //           font-size: 1rem;
// //           font-weight: 600;
// //           cursor: pointer;
// //           transition: all 0.3s ease;
// //           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
// //         }

// //         .print-button:hover {
// //           transform: translateY(-2px);
// //           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
// //         }

// //         .report-content {
// //           padding: 2rem;
// //         }

// //         .no-data-card {
// //           background: white;
// //           padding: 3rem;
// //           text-align: center;
// //           border-radius: 16px;
// //           border: 2px dashed #cbd5e0;
// //           color: #718096;
// //         }

// //         .challan-format {
// //           background: white;
// //           width: 100%;
// //         }

// //         .challan-header {
// //           background: #fff;
// //           padding: 1rem;
// //           border-bottom: 3px solid #667eea;
// //           display: flex;
// //           justify-content: space-between;
// //           align-items: center;
// //         }

// //         .company-section {
// //           display: flex;
// //           align-items: center;
// //           gap: 1rem;
// //         }

// //         .company-logo-print {
// //           width: 60px;
// //           height: 60px;
// //           background: rgba(102, 126, 234, 0.1);
// //           border-radius: 50%;
// //           display: flex;
// //           align-items: center;
// //           justify-content: center;
// //           border: 2px solid #667eea;
// //         }

// //         .company-logo-print img {
// //           width: 70%;
// //           height: 70%;
// //           object-fit: contain;
// //           border-radius: 50%;
// //         }

// //         .company-info h2 {
// //           margin: 0;
// //           font-size: 1.8rem;
// //           color: #2d3748;
// //           font-weight: 800;
// //         }

// //         .report-info {
// //           text-align: right;
// //         }

// //         .report-info h3 {
// //           margin: 0;
// //           color: #667eea;
// //           font-size: 1.4rem;
// //           font-weight: 700;
// //         }

// //         .report-info p {
// //           margin: 0;
// //           color: #718096;
// //           font-size: 1rem;
// //         }

// //         .main-table {
// //           width: 100%;
// //           border-collapse: collapse;
// //           margin-top: 1rem;
// //           font-size: 1rem;
// //         }

// //         .main-table th {
// //           background: linear-gradient(90deg, #667eea, #764ba2);
// //           color: white;
// //           padding: 0.8rem 0.6rem;
// //           text-align: center;
// //           font-weight: 700;
// //           font-size: 0.9rem;
// //           text-transform: uppercase;
// //           letter-spacing: 0.5px;
// //           border: 1px solid #5a6fd8;
// //         }

// //         .main-table td {
// //           padding: 0.7rem 0.6rem;
// //           text-align: center;
// //           border: 1px solid #e2e8f0;
// //           vertical-align: middle;
// //           font-weight: 500;
// //         }

// //         .main-table tbody tr:nth-child(even) {
// //           background: #f8faff;
// //         }

// //         .worker-name {
// //           background: #edf2f7;
// //           font-weight: 700;
// //           color: #2d3748;
// //           text-align: left;
// //           padding: 0.8rem;
// //           font-size: 1rem;
// //         }

// //         .rate-input-mini {
// //           width: 70px;
// //           padding: 0.4rem;
// //           border: 1px solid #e2e8f0;
// //           border-radius: 4px;
// //           text-align: center;
// //           font-size: 0.9rem;
// //         }

// //         .salary-value {
// //           font-weight: 700;
// //           color: #22c55e;
// //         }

// //         .worker-total {
// //           background: #f0fff4 !important;
// //           font-weight: 700;
// //           color: #065f46;
// //         }

// //         .grand-total-row {
// //           background: linear-gradient(90deg, #22c55e, #16a34a) !important;
// //           color: white;
// //         }

// //         .grand-total-row td {
// //           font-weight: 800;
// //           font-size: 1rem;
// //           padding: 1rem 0.6rem;
// //         }

// //         @media (max-width: 768px) {
// //           .salary-report-container {
// //             padding: 1rem 0.5rem;
// //           }
          
// //           .report-header {
// //             padding: 1rem;
// //           }

// //           .company-logo {
// //             width: 60px;
// //             height: 60px;
// //           }

// //           .filter-section {
// //             padding: 1rem;
// //           }
          
// //           .filter-grid {
// //             grid-template-columns: 1fr;
// //             gap: 1rem;
// //           }
          
// //           .action-buttons {
// //             justify-content: center;
// //           }

// //           .print-button {
// //             width: 100%;
// //             max-width: 300px;
// //           }
          
// //           .report-content {
// //             padding: 1rem;
// //           }

// //           .challan-header {
// //             flex-direction: column;
// //             gap: 1rem;
// //             text-align: center;
// //             padding: 1rem 0.5rem;
// //           }

// //           .company-section {
// //             justify-content: center;
// //           }

// //           .report-info {
// //             text-align: center;
// //           }

// //           .company-info h2 {
// //             font-size: 1.4rem;
// //           }

// //           .report-info h3 {
// //             font-size: 1.2rem;
// //           }

// //           .report-info p {
// //             font-size: 0.9rem;
// //           }

// //           .main-table {
// //             font-size: 0.85rem;
// //             display: block;
// //             overflow-x: auto;
// //             white-space: nowrap;
// //           }

// //           .main-table thead {
// //             display: none;
// //           }

// //           .main-table tbody {
// //             display: block;
// //           }

// //           .main-table tr {
// //             display: block;
// //             margin-bottom: 1rem;
// //             border: 1px solid #e2e8f0;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             background: white;
// //             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
// //           }

// //           .main-table td {
// //             display: flex;
// //             justify-content: space-between;
// //             align-items: center;
// //             padding: 0.5rem 0;
// //             border: none;
// //             border-bottom: 1px solid #f1f5f9;
// //             text-align: left;
// //           }

// //           .main-table td:last-child {
// //             border-bottom: none;
// //           }

// //           .main-table td::before {
// //             content: attr(data-label);
// //             font-weight: 600;
// //             color: #667eea;
// //             flex: 0 0 40%;
// //             text-align: left;
// //           }

// //           .worker-name {
// //             background: #667eea !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             font-size: 1.1rem;
// //             margin-bottom: 0.5rem;
// //           }

// //           .worker-name::before {
// //             display: none;
// //           }

// //           .worker-total {
// //             background: #22c55e !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1rem;
// //             font-weight: 700;
// //             font-size: 1rem;
// //           }

// //           .worker-total::before {
// //             display: none;
// //           }

// //           .grand-total-row {
// //             background: linear-gradient(135deg, #22c55e, #16a34a) !important;
// //             color: white !important;
// //             text-align: center;
// //             border-radius: 8px;
// //             padding: 1.5rem;
// //             font-weight: 800;
// //             font-size: 1.2rem;
// //           }

// //           .grand-total-row td::before {
// //             display: none;
// //           }

// //           .rate-input-mini {
// //             width: 100px;
// //             padding: 0.5rem;
// //             font-size: 1rem;
// //           }

// //           .salary-value {
// //             font-weight: 700;
// //             color: #22c55e;
// //             font-size: 1rem;
// //           }

// //           .worker-total td,
// //           .grand-total-row td {
// //             justify-content: center;
// //             text-align: center;
// //             font-weight: 700;
// //           }
// //         }

// //         @media print {
// //           .no-print,
// //           nav, 
// //           .navbar, 
// //           header.site-header,
// //           .site-header,
// //           footer,
// //           .site-footer,
// //           .footer,
// //           .copyright,
// //           .all-rights-reserved {
// //             display: none !important;
// //             visibility: hidden !important;
// //           }
          
// //           body {
// //             margin: 0 !important;
// //             padding: 0 !important;
// //             font-size: 14px !important;
// //           }
          
// //           .salary-report-container {
// //             background: white !important;
// //             padding: 0 !important;
// //             margin: 0 !important;
// //           }
          
// //           .main-card {
// //             box-shadow: none !important;
// //             border-radius: 0 !important;
// //             margin: 0 !important;
// //             max-width: 100% !important;
// //           }
          
// //           .challan-format {
// //             page-break-inside: avoid;
// //             page-break-after: avoid;
// //             max-width: 100%;
// //             margin: 0;
// //             padding: 0;
// //           }

// //           .main-table {
// //             display: table !important;
// //             font-size: 12px !important;
// //             margin-top: 0.8rem !important;
// //           }

// //           .main-table thead {
// //             display: table-header-group !important;
// //           }

// //           .main-table tbody {
// //             display: table-row-group !important;
// //           }

// //           .main-table tr {
// //             display: table-row !important;
// //             margin: 0 !important;
// //             border: none !important;
// //             padding: 0 !important;
// //             background: transparent !important;
// //             box-shadow: none !important;
// //           }

// //           .main-table td {
// //             display: table-cell !important;
// //             padding: 5px 4px !important;
// //             border: 1px solid #e2e8f0 !important;
// //             text-align: center !important;
// //             font-size: 11px !important;
// //           }

// //           .main-table td::before {
// //             display: none !important;
// //           }
          
// //           @page {
// //             size: A4 landscape;
// //             margin: 10mm 8mm;
// //           }
          
// //           .challan-header {
// //             padding: 1rem !important;
// //             margin-bottom: 0.8rem;
// //             flex-direction: row !important;
// //             text-align: left !important;
// //           }
          
// //           .company-info h2 {
// //             font-size: 1.6rem !important;
// //           }

// //           .report-info {
// //             text-align: right !important;
// //           }
          
// //           .report-info h3 {
// //             font-size: 1.3rem !important;
// //           }
          
// //           .report-info p {
// //             font-size: 0.9rem !important;
// //           }
          
// //           .main-table th {
// //             padding: 6px 4px !important;
// //             font-size: 11px !important;
// //             background: #666 !important;
// //             color: white !important;
// //           }
          
// //           .worker-name {
// //             padding: 6px 8px !important;
// //             font-size: 12px !important;
// //             font-weight: 800 !important;
// //             background: #edf2f7 !important;
// //             color: #2d3748 !important;
// //             text-align: left !important;
// //           }
          
// //           .rate-input-mini {
// //             width: 50px !important;
// //             padding: 2px !important;
// //             font-size: 10px !important;
// //           }
          
// //           .grand-total-row {
// //             background: #333 !important;
// //             color: white !important;
// //           }
          
// //           .grand-total-row td {
// //             font-size: 13px !important;
// //             font-weight: 800 !important;
// //             padding: 7px 4px !important;
// //           }
          
// //           .main-table,
// //           .challan-format {
// //             transform: scale(0.98);
// //             transform-origin: top left;
// //           }
// //         }
// //       `}</style>

// //       <div className="main-card">
// //         <div className="report-header">
// //           <div className="company-logo">
// //             <img src="/logo.png" alt="Company Logo" />
// //           </div>
// //         </div>

// //         <div className="filter-section no-print">
// //           <div className="filter-grid">
// //             <div className="filter-group">
// //               <label className="filter-label">From Date</label>
// //               <input
// //                 type="date"
// //                 value={fromDate}
// //                 onChange={handleFromDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">To Date</label>
// //               <input
// //                 type="date"
// //                 min={fromDate}
// //                 value={toDate}
// //                 onChange={handleToDateChange}
// //                 required
// //                 className="modern-input"
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">Worker Selection</label>
// //               <Select
// //                 options={workers}
// //                 value={worker}
// //                 onChange={(selected) => setWorker(selected)}
// //                 isSearchable={true}
// //                 isClearable={false}
// //                 placeholder="Select worker..."
// //                 styles={{
// //                   control: (base) => ({
// //                     ...base,
// //                     background: 'white',
// //                     border: '2px solid #e2e8f0',
// //                     borderRadius: '12px',
// //                     padding: '0.25rem 0.5rem',
// //                     fontSize: '1rem',
// //                     fontWeight: '500',
// //                     boxShadow: 'none',
// //                     '&:hover': { borderColor: '#667eea' }
// //                   }),
// //                   option: (base, state) => ({
// //                     ...base,
// //                     backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8faff' : 'white',
// //                     color: state.isSelected ? 'white' : '#2d3748',
// //                     fontWeight: '500'
// //                   })
// //                 }}
// //               />
// //             </div>

// //             <div className="filter-group">
// //               <label className="filter-label">Search</label>
// //               <input
// //                 type="text"
// //                 value={search}
// //                 onChange={(e) => setSearch(e.target.value)}
// //                 placeholder="Search date, article, gender, cartons..."
// //                 className="modern-input"
// //               />
// //             </div>
// //           </div>

// //           <div className="action-buttons">
// //             <button onClick={handlePrint} className="print-button">
// //               🖨️ Print Salary Report
// //             </button>
// //           </div>
// //         </div>

// //         <div className="report-content">
// //           {filteredReport.length > 0 ? (
// //             <div className="challan-format">
// //               <div className="challan-header">
// //                 <div className="company-section">
// //                   <div className="company-logo-print">
// //                     <img src="/logo.png" alt="Logo" />
// //                   </div>
// //                   <div className="company-info">
// //                     <h2>GPFAX FOOTWEAR</h2>
// //                   </div>
// //                 </div>
// //                 <div className="report-info">
// //                   <h3>SALARY REPORT</h3>
// //                   <p>Period: {formatDateRange()}</p>
// //                   <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
// //                   <p>Grand Total: ₹{totalSalary}</p>
// //                 </div>
// //               </div>

// //               <table className="main-table">
// //                 <thead>
// //                   <tr>
// //                     <th>Date</th>
// //                     <th>Article</th>
// //                     <th>Gender</th>
// //                     <th>Cartons</th>
// //                     <th>Pair/Crtn</th>
// //                     <th>Rate (₹)</th>
// //                     <th>Earnings (₹)</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {filteredReport.map((workerData) => (
// //                     <React.Fragment key={workerData.worker}>
// //                       <tr>
// //                         <td colSpan="7" className="worker-name">
// //                           👤 {workerData.worker}
// //                         </td>
// //                       </tr>
                      
// //                       {workerData.articles.map((article, idx) => (
// //                         <tr key={`${workerData.worker}_${idx}`}>
// //                           <td data-label="Date:">{article.date}</td>
// //                           <td data-label="Article:" style={{fontWeight:'600'}}>{article.article}</td>
// //                           <td data-label="Gender:">{article.gender || "-"}</td>
// //                           <td data-label="Cartons:" style={{ fontWeight: '600', color: '#3b82f6' }}>{article.cartons}</td>
// //                           <td data-label="Pair/Crtn:">{article.pairPerCarton}</td>
// //                           <td data-label="Rate (₹):">
// //                             <input
// //                               type="number"
// //                               step="0.01"
// //                               max="10000"
// //                               value={rates[`${article.article}_${article.gender}`] || ""}
// //                               onChange={(e) =>
// //                                 handleRateChange(article.article, article.gender, e.target.value)
// //                               }
// //                               min="0"
// //                               className="rate-input-mini"
// //                               placeholder="0"
// //                             />
// //                           </td>
// //                           <td data-label="Earnings (₹):" className="salary-value">
// //                             ₹{getSalaryForArticle(
// //                               article.article,
// //                               article.gender,
// //                               article.cartons,
// //                               article.pairPerCarton
// //                             )}
// //                           </td>
// //                         </tr>
// //                       ))}
                      
// //                       <tr className="worker-total">
// //                         <td colSpan="7" style={{ textAlign: 'center', fontWeight: '700' }}>
// //                           Total for {workerData.worker}: ₹{getTotalSalaryForWorker(workerData)}
// //                         </td>
// //                       </tr>
// //                     </React.Fragment>
// //                   ))}
                  
// //                   <tr className="grand-total-row">
// //                     <td colSpan="7" style={{ textAlign: 'center' }}>
// //                       🏆 GRAND TOTAL - ALL WORKERS: ₹{totalSalary}
// //                     </td>
// //                   </tr>
// //                 </tbody>
// //               </table>
// //             </div>
// //           ) : (
// //             <div className="no-data-card">
// //               <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📊</div>
// //               <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
// //                 {fromDate && toDate
// //                   ? (search ? "No records match the search" : "No production records found")
// //                   : "Select Date Range to Generate Report"}
// //               </div>
// //               <div style={{ opacity: '0.7' }}>
// //                 {fromDate && toDate
// //                   ? (search ? "Try adjusting your search query" : "Try adjusting your date range or worker selection")
// //                   : "Please select both from and to dates to view salary data"}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SalaryReport;
// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import Select from "react-select";
// import api from "../utils/api";

// const SalaryReport = () => {
//   const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [report, setReport] = useState([]);
//   const [workers, setWorkers] = useState([]);
//   const [rates, setRates] = useState({});
//   const [search, setSearch] = useState("");

//   /* ---------------- FETCH ---------------- */
//   // const fetchReport = useCallback(async () => {
//   //   if (!fromDate || !toDate) return;
//   //   try {
//   //     const { data } = await api.get("/salary/salary-report", {
//   //       params: { from: fromDate, to: toDate, worker: worker.value }
//   //     });

//   //     const allData = data.data || [];

//   //     /* worker-dropdown */
//   //     const uniq = [...new Set(allData.map(i => i.worker))];
//   //     setWorkers([
//   //       { value: "all", label: "All Workers" },
//   //       ...uniq.map(w => ({ value: w, label: w }))
//   //     ]);

//   //     setReport(
//   //       worker.value === "all"
//   //         ? allData
//   //         : allData.filter(i => i.worker === worker.value)
//   //     );
//   //   } catch (err) {
//   //     console.error("Fetch error:", err);
//   //     setReport([]);
//   //     setWorkers([]);
//   //   }
//   // }, [fromDate, toDate, worker]);

// //   const fetchReport = useCallback(async () => {
// //   if (!fromDate || !toDate) return;
// //   try {
// //     const { data } = await api.get("/salary/salary-report", {
// //       params: { from: fromDate, to: toDate, worker: worker.value }
// //     });

// //     const allData = data.data || [];

// //     // ✅ IMPROVED: Clean worker dropdown with better deduplication
// //     const workerNames = allData
// //       .map(i => i.worker?.trim().toUpperCase()) // Normalize names
// //       .filter(Boolean) // Remove empty values
// //       .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
// //       .sort(); // Sort alphabetically

// //     setWorkers([
// //       { value: "all", label: "All Workers" },
// //       ...workerNames.map(w => ({ value: w, label: w }))
// //     ]);

// //     setReport(
// //       worker.value === "all"
// //         ? allData
// //         : allData.filter(i => i.worker === worker.value)
// //     );
// //   } catch (err) {
// //     console.error("Fetch error:", err);
// //     setReport([]);
// //     setWorkers([]);
// //   }
// // }, [fromDate, toDate, worker]);

// const fetchReport = useCallback(async () => {
//   if (!fromDate || !toDate) return;
//   try {
//     const { data } = await api.get("/salary/salary-report", {
//       params: { from: fromDate, to: toDate, worker: worker.value }
//     });

//     const allData = data.data || [];

//     // ✅ FIX: Get workers from backend data (case-insensitive)
//     const workerSet = new Set();
//     allData.forEach(item => {
//       const normalizedWorker = item.worker?.trim().toUpperCase();
//       if (normalizedWorker) {
//         workerSet.add(normalizedWorker);
//       }
//     });

//     const sortedWorkers = Array.from(workerSet).sort();

//     setWorkers([
//       { value: "all", label: "All Workers" },
//       ...sortedWorkers.map(w => ({ value: w, label: w }))
//     ]);

//     setReport(
//       worker.value === "all"
//         ? allData
//         : allData.filter(i => i.worker?.toUpperCase() === worker.value?.toUpperCase())
//     );
//   } catch (err) {
//     console.error("Fetch error:", err);
//     setReport([]);
//     setWorkers([]);
//   }
// }, [fromDate, toDate, worker]);

//   useEffect(() => {
//     if (fromDate && toDate) {
//       fetchReport();
//     }
//   }, [fetchReport, fromDate, toDate]);

//   const handleFromDateChange = (e) => {
//     const newFromDate = e.target.value;
//     setFromDate(newFromDate);
//     if (toDate && new Date(toDate) < new Date(newFromDate)) {
//       setToDate("");
//     }
//   };

//   const handleToDateChange = (e) => {
//     const newToDate = e.target.value;
//     if (new Date(newToDate) < new Date(fromDate)) {
//       alert("⚠️ To Date cannot be earlier than From Date!");
//       return;
//     }
//     setToDate(newToDate);
//   };

//   const handleRateChange = (article, gender, rate) => {
//     let value = parseFloat(rate) || 0;
//     if (value > 10000) value = 10000;
//     value = Math.floor(value * 100) / 100;
//     setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
//   };

//   /* ---------------- OPTIMIZED FUNCTIONS ---------------- */
//   const getSalaryForArticle = useCallback((article, gender, cartons, pairPerCarton) => {
//     const rate = rates[`${article}_${gender}`] || 0;
//     return (cartons * pairPerCarton * rate).toFixed(2);
//   }, [rates]);

//   const getTotalSalaryForWorker = useCallback((workerData) => {
//     return workerData.articles
//       .reduce(
//         (acc, article) =>
//           acc +
//           parseFloat(
//             getSalaryForArticle(
//               article.article,
//               article.gender,
//               article.cartons,
//               article.pairPerCarton
//             )
//           ),
//         0
//       )
//       .toFixed(2);
//   }, [getSalaryForArticle]);

//   /* ---------------- SEARCH FILTER ---------------- */
//   const normalizedSearch = search.trim().toLowerCase();

//   const matchesSearch = useCallback(
//     (a) => {
//       if (!normalizedSearch) return true;
//       const fields = [
//         a.date,
//         a.article,
//         a.gender,
//         String(a.cartons),
//         String(a.pairPerCarton),
//         String(rates[`${a.article}_${a.gender}`] || "")
//       ];
//       return fields.some(f => String(f || "").toLowerCase().includes(normalizedSearch));
//     },
//     [normalizedSearch, rates]
//   );

//   const filteredReport = useMemo(() => {
//     if (!normalizedSearch) return report;
//     return report
//       .map(wd => ({
//         ...wd,
//         articles: wd.articles.filter(matchesSearch)
//       }))
//       .filter(wd => wd.articles.length > 0);
//   }, [report, matchesSearch, normalizedSearch]);

//   const totalSalary = useMemo(() => {
//     return filteredReport
//       .reduce((acc, wd) => acc + parseFloat(getTotalSalaryForWorker(wd)), 0)
//       .toFixed(2);
//   }, [filteredReport, getTotalSalaryForWorker]);

//   const handlePrint = () => window.print();

//   const formatDateRange = () => {
//     if (!fromDate || !toDate) return "";
//     const fromFormatted = new Date(fromDate).toLocaleDateString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric'
//     });
//     const toFormatted = new Date(toDate).toLocaleDateString('en-IN', {
//       day: '2-digit', month: 'short', year: 'numeric'
//     });
//     return `${fromFormatted} to ${toFormatted}`;
//   };

//   return (
//     <div className="salary-report-container">
//       <style jsx>{`
//         .salary-report-container {
//           background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
//           min-height: 100vh;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//           padding: 2rem 1rem;
//         }

//         .report-header {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           padding: 1.5rem;
//           border-radius: 20px 20px 0 0;
//           text-align: center;
//           position: relative;
//           overflow: hidden;
//         }

//         .company-logo {
//           width: 80px;
//           height: 80px;
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto;
//           border: 3px solid rgba(255, 255, 255, 0.3);
//         }

//         .company-logo img {
//           width: 70%;
//           height: 70%;
//           object-fit: contain;
//           border-radius: 50%;
//         }

//         .main-card {
//           background: white;
//           border-radius: 0 0 20px 20px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//           overflow: hidden;
//           max-width: 1400px;
//           margin: 0 auto;
//         }

//         .filter-section {
//           background: #f8faff;
//           padding: 2rem;
//           border-bottom: 2px solid #e2e8f0;
//         }

//         .filter-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 1.5rem;
//           align-items: end;
//           margin-bottom: 1rem;
//         }

//         .filter-group {
//           display: flex;
//           flex-direction: column;
//         }

//         .filter-label {
//           font-weight: 600;
//           color: #2d3748;
//           margin-bottom: 0.5rem;
//           font-size: 0.9rem;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//         }

//         .modern-input {
//           background: white;
//           border: 2px solid #e2e8f0;
//           border-radius: 12px;
//           padding: 0.75rem 1rem;
//           font-size: 1rem;
//           transition: all 0.3s ease;
//           font-weight: 500;
//         }

//         .modern-input:focus {
//           outline: none;
//           border-color: #667eea;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           transform: translateY(-1px);
//         }

//         .action-buttons {
//           display: flex;
//           justify-content: flex-end;
//           gap: 1rem;
//           margin-top: 1rem;
//         }

//         .print-button {
//           background: linear-gradient(45deg, #667eea, #764ba2);
//           color: white;
//           border: none;
//           padding: 0.75rem 2rem;
//           border-radius: 12px;
//           font-size: 1rem;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
//         }

//         .print-button:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//         }

//         .report-content {
//           padding: 2rem;
//         }

//         .no-data-card {
//           background: white;
//           padding: 3rem;
//           text-align: center;
//           border-radius: 16px;
//           border: 2px dashed #cbd5e0;
//           color: #718096;
//         }

//         .challan-format {
//           background: white;
//           width: 100%;
//         }

//         .challan-header {
//           background: #fff;
//           padding: 1rem;
//           border-bottom: 3px solid #667eea;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//         }

//         .company-section {
//           display: flex;
//           align-items: center;
//           gap: 1rem;
//         }

//         .company-logo-print {
//           width: 60px;
//           height: 60px;
//           background: rgba(102, 126, 234, 0.1);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           border: 2px solid #667eea;
//         }

//         .company-logo-print img {
//           width: 70%;
//           height: 70%;
//           object-fit: contain;
//           border-radius: 50%;
//         }

//         .company-info h2 {
//           margin: 0;
//           font-size: 1.8rem;
//           color: #2d3748;
//           font-weight: 800;
//         }

//         .report-info {
//           text-align: right;
//         }

//         .report-info h3 {
//           margin: 0;
//           color: #667eea;
//           font-size: 1.4rem;
//           font-weight: 700;
//         }

//         .report-info p {
//           margin: 0;
//           color: #718096;
//           font-size: 1rem;
//         }

//         .main-table {
//           width: 100%;
//           border-collapse: collapse;
//           margin-top: 1rem;
//           font-size: 1rem;
//         }

//         .main-table th {
//           background: linear-gradient(90deg, #667eea, #764ba2);
//           color: white;
//           padding: 0.8rem 0.6rem;
//           text-align: center;
//           font-weight: 700;
//           font-size: 0.9rem;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           border: 1px solid #5a6fd8;
//         }

//         .main-table td {
//           padding: 0.7rem 0.6rem;
//           text-align: center;
//           border: 1px solid #e2e8f0;
//           vertical-align: middle;
//           font-weight: 500;
//         }

//         .main-table tbody tr:nth-child(even) {
//           background: #f8faff;
//         }

//         .worker-name {
//           background: #edf2f7;
//           font-weight: 700;
//           color: #2d3748;
//           text-align: left;
//           padding: 0.8rem;
//           font-size: 1rem;
//         }

//         .rate-input-mini {
//           width: 70px;
//           padding: 0.4rem;
//           border: 1px solid #e2e8f0;
//           border-radius: 4px;
//           text-align: center;
//           font-size: 0.9rem;
//         }

//         .salary-value {
//           font-weight: 700;
//           color: #22c55e;
//         }

//         .worker-total {
//           background: #f0fff4 !important;
//           font-weight: 700;
//           color: #065f46;
//         }

//         .grand-total-row {
//           background: linear-gradient(90deg, #22c55e, #16a34a) !important;
//           color: white;
//         }

//         .grand-total-row td {
//           font-weight: 800;
//           font-size: 1rem;
//           padding: 1rem 0.6rem;
//         }

//         @media (max-width: 768px) {
//           .salary-report-container {
//             padding: 1rem 0.5rem;
//           }
          
//           .report-header {
//             padding: 1rem;
//           }

//           .company-logo {
//             width: 60px;
//             height: 60px;
//           }

//           .filter-section {
//             padding: 1rem;
//           }
          
//           .filter-grid {
//             grid-template-columns: 1fr;
//             gap: 1rem;
//           }
          
//           .action-buttons {
//             justify-content: center;
//           }

//           .print-button {
//             width: 100%;
//             max-width: 300px;
//           }
          
//           .report-content {
//             padding: 1rem;
//           }

//           .challan-header {
//             flex-direction: column;
//             gap: 1rem;
//             text-align: center;
//             padding: 1rem 0.5rem;
//           }

//           .company-section {
//             justify-content: center;
//           }

//           .report-info {
//             text-align: center;
//           }

//           .company-info h2 {
//             font-size: 1.4rem;
//           }

//           .report-info h3 {
//             font-size: 1.2rem;
//           }

//           .report-info p {
//             font-size: 0.9rem;
//           }

//           .main-table {
//             font-size: 0.85rem;
//             display: block;
//             overflow-x: auto;
//             white-space: nowrap;
//           }

//           .main-table thead {
//             display: none;
//           }

//           .main-table tbody {
//             display: block;
//           }

//           .main-table tr {
//             display: block;
//             margin-bottom: 1rem;
//             border: 1px solid #e2e8f0;
//             border-radius: 8px;
//             padding: 1rem;
//             background: white;
//             box-shadow: 0 2px 4px rgba(0,0,0,0.1);
//           }

//           .main-table td {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding: 0.5rem 0;
//             border: none;
//             border-bottom: 1px solid #f1f5f9;
//             text-align: left;
//           }

//           .main-table td:last-child {
//             border-bottom: none;
//           }

//           .main-table td::before {
//             content: attr(data-label);
//             font-weight: 600;
//             color: #667eea;
//             flex: 0 0 40%;
//             text-align: left;
//           }

//           .worker-name {
//             background: #667eea !important;
//             color: white !important;
//             text-align: center;
//             border-radius: 8px;
//             padding: 1rem;
//             font-size: 1.1rem;
//             margin-bottom: 0.5rem;
//           }

//           .worker-name::before {
//             display: none;
//           }

//           .worker-total {
//             background: #22c55e !important;
//             color: white !important;
//             text-align: center;
//             border-radius: 8px;
//             padding: 1rem;
//             font-weight: 700;
//             font-size: 1rem;
//           }

//           .worker-total::before {
//             display: none;
//           }

//           .grand-total-row {
//             background: linear-gradient(135deg, #22c55e, #16a34a) !important;
//             color: white !important;
//             text-align: center;
//             border-radius: 8px;
//             padding: 1.5rem;
//             font-weight: 800;
//             font-size: 1.2rem;
//           }

//           .grand-total-row td::before {
//             display: none;
//           }

//           .rate-input-mini {
//             width: 100px;
//             padding: 0.5rem;
//             font-size: 1rem;
//           }

//           .salary-value {
//             font-weight: 700;
//             color: #22c55e;
//             font-size: 1rem;
//           }

//           .worker-total td,
//           .grand-total-row td {
//             justify-content: center;
//             text-align: center;
//             font-weight: 700;
//           }
//         }

//         @media print {
//           .no-print,
//           nav, 
//           .navbar, 
//           header.site-header,
//           .site-header,
//           footer,
//           .site-footer,
//           .footer,
//           .copyright,
//           .all-rights-reserved {
//             display: none !important;
//             visibility: hidden !important;
//           }
          
//           body {
//             margin: 0 !important;
//             padding: 0 !important;
//             font-size: 14px !important;
//           }
          
//           .salary-report-container {
//             background: white !important;
//             padding: 0 !important;
//             margin: 0 !important;
//           }
          
//           .main-card {
//             box-shadow: none !important;
//             border-radius: 0 !important;
//             margin: 0 !important;
//             max-width: 100% !important;
//           }
          
//           .challan-format {
//             page-break-inside: avoid;
//             page-break-after: avoid;
//             max-width: 100%;
//             margin: 0;
//             padding: 0;
//           }

//           .main-table {
//             display: table !important;
//             font-size: 12px !important;
//             margin-top: 0.8rem !important;
//           }

//           .main-table thead {
//             display: table-header-group !important;
//           }

//           .main-table tbody {
//             display: table-row-group !important;
//           }

//           .main-table tr {
//             display: table-row !important;
//             margin: 0 !important;
//             border: none !important;
//             padding: 0 !important;
//             background: transparent !important;
//             box-shadow: none !important;
//           }

//           .main-table td {
//             display: table-cell !important;
//             padding: 5px 4px !important;
//             border: 1px solid #e2e8f0 !important;
//             text-align: center !important;
//             font-size: 11px !important;
//           }

//           .main-table td::before {
//             display: none !important;
//           }
          
//           @page {
//             size: A4 landscape;
//             margin: 10mm 8mm;
//           }
          
//           .challan-header {
//             padding: 1rem !important;
//             margin-bottom: 0.8rem;
//             flex-direction: row !important;
//             text-align: left !important;
//           }
          
//           .company-info h2 {
//             font-size: 1.6rem !important;
//           }

//           .report-info {
//             text-align: right !important;
//           }
          
//           .report-info h3 {
//             font-size: 1.3rem !important;
//           }
          
//           .report-info p {
//             font-size: 0.9rem !important;
//           }
          
//           .main-table th {
//             padding: 6px 4px !important;
//             font-size: 11px !important;
//             background: #666 !important;
//             color: white !important;
//           }
          
//           .worker-name {
//             padding: 6px 8px !important;
//             font-size: 12px !important;
//             font-weight: 800 !important;
//             background: #edf2f7 !important;
//             color: #2d3748 !important;
//             text-align: left !important;
//           }
          
//           .rate-input-mini {
//             width: 50px !important;
//             padding: 2px !important;
//             font-size: 10px !important;
//           }
          
//           .grand-total-row {
//             background: #333 !important;
//             color: white !important;
//           }
          
//           .grand-total-row td {
//             font-size: 13px !important;
//             font-weight: 800 !important;
//             padding: 7px 4px !important;
//           }
          
//           .main-table,
//           .challan-format {
//             transform: scale(0.98);
//             transform-origin: top left;
//           }
//         }
//       `}</style>

//       <div className="main-card">
//         <div className="report-header">
//           <div className="company-logo">
//             <img src="/logo.png" alt="Company Logo" />
//           </div>
//         </div>

//         <div className="filter-section no-print">
//           <div className="filter-grid">
//             <div className="filter-group">
//               <label className="filter-label">From Date</label>
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={handleFromDateChange}
//                 required
//                 className="modern-input"
//               />
//             </div>

//             <div className="filter-group">
//               <label className="filter-label">To Date</label>
//               <input
//                 type="date"
//                 min={fromDate}
//                 value={toDate}
//                 onChange={handleToDateChange}
//                 required
//                 className="modern-input"
//               />
//             </div>

//             <div className="filter-group">
//               <label className="filter-label">Worker Selection</label>
//               <Select
//                 options={workers}
//                 value={worker}
//                 onChange={(selected) => setWorker(selected)}
//                 isSearchable={true}
//                 isClearable={false}
//                 placeholder="Select worker..."
//                 styles={{
//                   control: (base) => ({
//                     ...base,
//                     background: 'white',
//                     border: '2px solid #e2e8f0',
//                     borderRadius: '12px',
//                     padding: '0.25rem 0.5rem',
//                     fontSize: '1rem',
//                     fontWeight: '500',
//                     boxShadow: 'none',
//                     '&:hover': { borderColor: '#667eea' }
//                   }),
//                   option: (base, state) => ({
//                     ...base,
//                     backgroundColor: state.isSelected ? '#667eea' : state.isFocused ? '#f8faff' : 'white',
//                     color: state.isSelected ? 'white' : '#2d3748',
//                     fontWeight: '500'
//                   })
//                 }}
//               />
//             </div>

//             <div className="filter-group">
//               <label className="filter-label">Search</label>
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search date, article, gender, cartons..."
//                 className="modern-input"
//               />
//             </div>
//           </div>

//           <div className="action-buttons">
//             <button onClick={handlePrint} className="print-button">
//               🖨️ Print Salary Report
//             </button>
//           </div>
//         </div>

//         <div className="report-content">
//           {filteredReport.length > 0 ? (
//             <div className="challan-format">
//               <div className="challan-header">
//                 <div className="company-section">
//                   <div className="company-logo-print">
//                     <img src="/logo.png" alt="Logo" />
//                   </div>
//                   <div className="company-info">
//                     <h2>GPFAX FOOTWEAR</h2>
//                   </div>
//                 </div>
//                 <div className="report-info">
//                   <h3>SALARY REPORT</h3>
//                   <p>Period: {formatDateRange()}</p>
//                   <p>Generated: {new Date().toLocaleDateString('en-IN')}</p>
//                   <p>Grand Total: ₹{totalSalary}</p>
//                 </div>
//               </div>

//               <table className="main-table">
//                 <thead>
//                   <tr>
//                     <th>Date</th>
//                     <th>Article</th>
//                     <th>Gender</th>
//                     <th>Cartons</th>
//                     <th>Pair/Crtn</th>
//                     <th>Rate (₹)</th>
//                     <th>Earnings (₹)</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredReport.map((workerData) => (
//                     <React.Fragment key={workerData.worker}>
//                       <tr>
//                         <td colSpan="7" className="worker-name">
//                           👤 {workerData.worker}
//                         </td>
//                       </tr>
                      
//                       {workerData.articles.map((article, idx) => (
//                         <tr key={`${workerData.worker}_${idx}`}>
//                           <td data-label="Date:">{article.date}</td>
//                           <td data-label="Article:" style={{fontWeight:'600'}}>{article.article}</td>
//                           <td data-label="Gender:">{article.gender || "-"}</td>
//                           <td data-label="Cartons:" style={{ fontWeight: '600', color: '#3b82f6' }}>{article.cartons}</td>
//                           <td data-label="Pair/Crtn:">{article.pairPerCarton}</td>
//                           <td data-label="Rate (₹):">
//                             <input
//                               type="number"
//                               step="0.01"
//                               max="10000"
//                               value={rates[`${article.article}_${article.gender}`] || ""}
//                               onChange={(e) =>
//                                 handleRateChange(article.article, article.gender, e.target.value)
//                               }
//                               min="0"
//                               className="rate-input-mini"
//                               placeholder="0"
//                             />
//                           </td>
//                           <td data-label="Earnings (₹):" className="salary-value">
//                             ₹{getSalaryForArticle(
//                               article.article,
//                               article.gender,
//                               article.cartons,
//                               article.pairPerCarton
//                             )}
//                           </td>
//                         </tr>
//                       ))}
                      
//                       <tr className="worker-total">
//                         <td colSpan="7" style={{ textAlign: 'center', fontWeight: '700' }}>
//                           Total for {workerData.worker}: ₹{getTotalSalaryForWorker(workerData)}
//                         </td>
//                       </tr>
//                     </React.Fragment>
//                   ))}
                  
//                   <tr className="grand-total-row">
//                     <td colSpan="7" style={{ textAlign: 'center' }}>
//                       🏆 GRAND TOTAL - ALL WORKERS: ₹{totalSalary}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className="no-data-card">
//               <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: '0.5' }}>📊</div>
//               <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
//                 {fromDate && toDate
//                   ? (search ? "No records match the search" : "No production records found")
//                   : "Select Date Range to Generate Report"}
//               </div>
//               <div style={{ opacity: '0.7' }}>
//                 {fromDate && toDate
//                   ? (search ? "Try adjusting your search query" : "Try adjusting your date range or worker selection")
//                   : "Please select both from and to dates to view salary data"}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SalaryReport;
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Select from "react-select";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const SalaryReport = () => {
  const { company } = useAuth();
  const [worker, setWorker] = useState({ value: "all", label: "All Workers" });
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [report, setReport] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [rates, setRates] = useState({});
  const [search, setSearch] = useState("");

  const fetchReport = useCallback(async () => {
    if (!fromDate || !toDate) return;
    try {
      const { data } = await api.get("/salary/salary-report", {
        params: { from: fromDate, to: toDate, worker: worker.value },
      });
      const allData = data.data || [];
      const workerSet = new Set();
      allData.forEach((item) => {
        const normalizedWorker = item.worker?.trim().toUpperCase();
        if (normalizedWorker) workerSet.add(normalizedWorker);
      });
      const sortedWorkers = Array.from(workerSet).sort();
      setWorkers([
        { value: "all", label: "All Workers" },
        ...sortedWorkers.map((w) => ({ value: w, label: w })),
      ]);
      setReport(
        worker.value === "all"
          ? allData
          : allData.filter(
              (i) => i.worker?.toUpperCase() === worker.value?.toUpperCase()
            )
      );
    } catch (err) {
      setReport([]);
      setWorkers([]);
    }
  }, [fromDate, toDate, worker]);

  useEffect(() => {
    if (fromDate && toDate) fetchReport();
  }, [fetchReport, fromDate, toDate]);

  const handleFromDateChange = (e) => {
    const newFromDate = e.target.value;
    setFromDate(newFromDate);
    if (toDate && new Date(toDate) < new Date(newFromDate)) setToDate("");
  };

  const handleToDateChange = (e) => {
    const newToDate = e.target.value;
    if (new Date(newToDate) < new Date(fromDate)) {
      alert("⚠️ To Date cannot be earlier than From Date!");
      return;
    }
    setToDate(newToDate);
  };

  const handleRateChange = (article, gender, rate) => {
    let value = parseFloat(rate) || 0;
    if (value > 10000) value = 10000;
    value = Math.floor(value * 100) / 100;
    setRates((prev) => ({ ...prev, [`${article}_${gender}`]: value }));
  };

  const getSalaryForArticle = useCallback(
    (article, gender, cartons, pairPerCarton) => {
      const rate = rates[`${article}_${gender}`] || 0;
      return (cartons * pairPerCarton * rate).toFixed(2);
    },
    [rates]
  );

  const getWorkerTotals = useCallback(
    (workerData) => {
      let totalCartons = 0,
        totalPairs = 0,
        totalEarnings = 0;
      (workerData.articles || []).forEach((a) => {
        totalCartons += a.cartons;
        totalPairs += a.cartons * a.pairPerCarton;
        totalEarnings += parseFloat(
          getSalaryForArticle(a.article, a.gender, a.cartons, a.pairPerCarton)
        );
      });
      return {
        totalCartons,
        totalPairs,
        totalEarnings: totalEarnings.toFixed(2),
      };
    },
    [getSalaryForArticle]
  );

  const normalizedSearch = search.trim().toLowerCase();
  const matchesSearch = useCallback(
    (a) => {
      if (!normalizedSearch) return true;
      const fields = [
        a.date,
        a.article,
        a.gender,
        String(a.cartons),
        String(a.pairPerCarton),
        String(rates[`${a.article}_${a.gender}`] || ""),
      ];
      return fields.some((f) =>
        String(f || "").toLowerCase().includes(normalizedSearch)
      );
    },
    [normalizedSearch, rates]
  );

  const filteredReport = useMemo(() => {
    if (!normalizedSearch) return report;
    if (report.length && report[0].articles) {
      return report
        .map((wd) => ({
          ...wd,
          articles: wd.articles.filter(matchesSearch),
        }))
        .filter((wd) => wd.articles.length > 0);
    }
    return report.filter(matchesSearch);
  }, [report, matchesSearch, normalizedSearch]);

  const grandTotals = useMemo(() => {
    let totalCartons = 0,
      totalPairs = 0,
      grandTotal = 0;
    if (filteredReport.length && filteredReport[0]?.articles) {
      filteredReport.forEach((wd) => {
        wd.articles.forEach((a) => {
          totalCartons += a.cartons;
          totalPairs += a.cartons * a.pairPerCarton;
          grandTotal += parseFloat(
            getSalaryForArticle(a.article, a.gender, a.cartons, a.pairPerCarton)
          );
        });
      });
    } else {
      filteredReport.forEach((a) => {
        totalCartons += a.cartons;
        totalPairs += a.cartons * a.pairPerCarton;
        grandTotal += parseFloat(
          getSalaryForArticle(a.article, a.gender, a.cartons, a.pairPerCarton)
        );
      });
    }
    return {
      totalCartons,
      totalPairs,
      grandTotal: grandTotal.toFixed(2),
    };
  }, [filteredReport, getSalaryForArticle]);

  const handlePrint = () => window.print();

  return (
    <div className="salary-report-container">
      <style>{`
  *{box-sizing:border-box;margin:0;padding:0}
  .salary-report-container{
    background:#f1f4fb;
    min-height:100vh;
    font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    -webkit-font-smoothing:antialiased;
    padding:1.5rem 0;
    display:flex;
    justify-content:center;
  }
  .main-card{
    background:white;
    border-radius:16px;
    box-shadow:0 8px 32px rgba(0,0,0,0.10);
    overflow:hidden;
    width:90%;
    max-width:960px;
    border:1px solid #e2e8f0;
  }
  .report-header{
    background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);
    color:white;
    padding:1.2rem 1.5rem;
    text-align:center;
    border-bottom:none;
  }
  .report-header h2{font-size:1.45rem;font-weight:800;margin:0;letter-spacing:-0.3px}
  .report-header p{font-size:0.875rem;margin:0.3rem 0 0 0;opacity:0.72}
  .filter-section{
    background:#f8fafc;
    padding:1rem 1.4rem;
    border-bottom:1px solid #e2e8f0;
  }
  .filter-grid{
    display:grid;
    grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
    gap:0.8rem;
  }
  .filter-label{
    font-weight:600;
    color:#6366f1;
    font-size:0.76rem;
    margin-bottom:0.3rem;
    text-transform:uppercase;
    letter-spacing:0.4px;
    display:block;
  }
  .modern-input{
    border:1.5px solid #e2e8f0;
    border-radius:8px;
    padding:0.45rem 0.7rem;
    font-size:0.855rem;
    height:34px;
    font-family:inherit;
    color:#1e293b;
    outline:none;
    transition:border-color 0.2s;
    width:100%;
  }
  .modern-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.15)}
  .action-buttons{
    display:flex;
    justify-content:flex-end;
    margin-top:0.7rem;
  }
  .print-button{
    background:linear-gradient(135deg,#6366f1,#8b5cf6);
    color:white;
    border:none;
    padding:0.55rem 1.4rem;
    border-radius:8px;
    font-size:0.855rem;
    font-weight:600;
    cursor:pointer;
    font-family:inherit;
    transition:all 0.2s ease;
    box-shadow:0 3px 10px rgba(99,102,241,0.32);
  }
  .print-button:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(99,102,241,0.44)}
  .report-content{padding:1.2rem}
  .main-table{
    width:100%;
    border-collapse:collapse;
    table-layout:fixed;
    font-size:0.93rem;
    font-family:inherit;
  }
  .main-table th,.main-table td{
    border:1px solid #e2e8f0;
    text-align:center;
    padding:0.55rem 0.5rem;
    white-space:nowrap;
  }
  .main-table th{
    background:linear-gradient(135deg,#1e1b4b,#312e81);
    color:white;
    font-weight:700;
    font-size:0.78rem;
    text-transform:uppercase;
    letter-spacing:0.4px;
    border-color:#2d2c6e;
  }
  .main-table tbody tr:nth-child(even){background:#f8fafc}
  .main-table tbody tr{transition:background 0.15s}
  .main-table tbody tr:hover{background:rgba(99,102,241,0.05)}
  .worker-name{
    background:#eef2ff;
    font-weight:700;
    color:#4338ca;
    text-align:left !important;
    padding:0.5rem 0.8rem !important;
    border-left:4px solid #6366f1 !important;
    font-size:0.875rem !important;
  }
  .worker-total{
    background:#d1fae5 !important;
    font-weight:700;
    color:#065f46;
  }
  .salary-value{font-weight:700;color:#059669}
  .grand-total-row{
    background:linear-gradient(135deg,#064e3b,#065f46) !important;
    color:white;
    font-weight:800;
  }

  @media print{
    body{background:white;}
    .salary-report-container{padding:0;display:block;}
    .main-card{max-width:100%;box-shadow:none;border:none;}
    .no-print{display:none;}
  }
    @media (max-width: 768px) {
  .main-card {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .filter-grid {
    grid-template-columns: 1fr 1fr; /* 2 per row */
    gap: 0.6rem;
  }

  .filter-section {
    padding: 0.8rem;
  }

  .report-content {
    padding: 0.6rem;
    overflow-x: auto; /* enables scroll for table */
  }

  .main-table {
    min-width: 700px; /* keeps layout intact on small screens */
    font-size: 0.7rem;
  }

  .main-table th,
  .main-table td {
    padding: 0.25rem 0.2rem;
  }

  .print-button {
    width: 100%;
    font-size: 0.8rem;
    padding: 0.5rem;
  }
}

@media (max-width: 480px) {
  .filter-grid {
    grid-template-columns: 1fr; /* stack vertically on small phones */
  }

  .report-header h2 {
    font-size: 1.1rem;
  }

  .report-header p {
    font-size: 0.8rem;
  }

  .modern-input {
    font-size: 0.8rem;
    height: 28px;
  }

  .filter-label {
    font-size: 0.7rem;
  }
}
  /* === Mobile Fine-Tuning === */
@media (max-width: 768px) {
  .salary-report-container {
    padding: 0.5rem 0;
  }

  .report-header {
    padding: 0.7rem 0.5rem;
  }

  .filter-section {
    border-bottom: none;
  }

  .filter-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .filter-label {
    font-size: 0.75rem;
  }

  .modern-input,
  .react-select__control {
    font-size: 0.8rem;
    height: 30px !important;
  }

  .report-content {
    padding: 0.5rem;
    overflow-x: auto;
  }

  .main-table {
    min-width: 650px;
    font-size: 0.68rem;
  }

  .main-table th,
  .main-table td {
    padding: 0.25rem 0.2rem;
  }

  .print-button {
    font-size: 0.8rem;
    width: 100%;
    padding: 0.45rem;
  }
}

@media (max-width: 400px) {
  .report-header h2 {
    font-size: 1rem;
  }
  .report-header p {
    font-size: 0.75rem;
  }
}


`}</style>


      <div className="main-card">
        <div className="report-header">
          <h2>Salary Report</h2>
          <p>{company?.name || 'My Business'}</p>
        </div>

        <div className="filter-section no-print">
          <div className="filter-grid">
            <div>
              <label className="filter-label">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={handleFromDateChange}
                className="modern-input"
              />
            </div>
            <div>
              <label className="filter-label">To Date</label>
              <input
                type="date"
                min={fromDate}
                value={toDate}
                onChange={handleToDateChange}
                className="modern-input"
              />
            </div>
            <div>
              <label className="filter-label">Worker</label>
              <Select options={workers} value={worker} onChange={setWorker} />
            </div>
            <div>
              <label className="filter-label">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="modern-input"
              />
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={handlePrint} className="print-button">
              🖨️ Print Salary Report
            </button>
          </div>
        </div>

        <div className="report-content">
          {filteredReport.length > 0 ? (
            <table className="main-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Article</th>
                  <th>Gender</th>
                  <th>Cartons</th>
                  <th>Pair/Carton</th>
                  <th>Rate (₹)</th>
                  <th>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredReport[0]?.articles
                  ? filteredReport.map((wd) => {
                      const totals = getWorkerTotals(wd);
                      return (
                        <React.Fragment key={wd.worker}>
                          <tr>
                            <td colSpan="7" className="worker-name">
                              👤 Worker: {wd.worker}
                            </td>
                          </tr>
                          {wd.articles.map((a, i) => (
                            <tr key={i}>
                              <td>{a.date}</td>
                              <td>{a.article}</td>
                              <td>{a.gender}</td>
                              <td>{a.cartons}</td>
                              <td>{a.pairPerCarton}</td>
                              <td>
                                <input
                                  type="number"
                                  value={
                                    rates[`${a.article}_${a.gender}`] || ""
                                  }
                                  onChange={(e) =>
                                    handleRateChange(
                                      a.article,
                                      a.gender,
                                      e.target.value
                                    )
                                  }
                                  style={{
                                    width: "55px",
                                    textAlign: "center",
                                    fontSize: "0.75rem",
                                  }}
                                />
                              </td>
                              <td className="salary-value">
                                ₹
                                {getSalaryForArticle(
                                  a.article,
                                  a.gender,
                                  a.cartons,
                                  a.pairPerCarton
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr className="worker-total">
                            <td colSpan="3" style={{ textAlign: "right" }}>
                              Subtotal - {wd.worker}
                            </td>
                            <td>{totals.totalCartons}</td>
                            <td>{totals.totalPairs}</td>
                            <td colSpan="2">₹{totals.totalEarnings}</td>
                          </tr>
                        </React.Fragment>
                      );
                    })
                  : null}
                <tr className="grand-total-row">
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    🏆 GRAND TOTAL
                  </td>
                  <td>{grandTotals.totalCartons}</td>
                  <td>{grandTotals.totalPairs}</td>
                  <td colSpan="2">₹{grandTotals.grandTotal}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              No Data Found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalaryReport;
