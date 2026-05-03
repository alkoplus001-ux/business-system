// import React, { useEffect, useState, useCallback } from 'react';
// import { useSearchParams } from 'react-router-dom';

// function fmtDate(d) {
//   const dt = new Date(d);
//   const yyyy = dt.getFullYear();
//   const mm = String(dt.getMonth() + 1).padStart(2, '0');
//   const dd = String(dt.getDate()).padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// }

// function firstDayOfMonth(date = new Date()) {
//   return fmtDate(new Date(date.getFullYear(), date.getMonth(), 1));
// }

// function today() {
//   return fmtDate(new Date());
// }

// function formatCurrency(v) {
//   const n = Number(v || 0);
//   return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
// }

// export default function PartySummary() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [party, setParty] = useState((searchParams.get('party') || '').toUpperCase());
//   const [from, setFrom] = useState(searchParams.get('from') || firstDayOfMonth());
//   const [to, setTo] = useState(searchParams.get('to') || today());
//   const [data, setData] = useState({ perParty: [], perArticle: [], perDay: [] });
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState('');

//   // When "from" changes and "to" is before "from", reset "to"
//   useEffect(() => {
//     if (from && to && to < from) {
//       setTo(from);
//     }
//   }, [from, to]);

//   // Memoized loader
//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErr('');

//       // Keep URL in sync with filters
//       const qs = new URLSearchParams();
//       if (party) qs.set('party', party.toUpperCase());
//       if (from) qs.set('from', from);
//       if (to) qs.set('to', to);
//       setSearchParams(qs);

//       // Fetch summary
//       const res = await fetch(`/api/challans/party-summary?${qs.toString()}`);
//       const json = await res.json();
//       if (!json.success) throw new Error(json.error || 'Failed to load');
//       setData(json.data || { perParty: [], perArticle: [], perDay: [] });
//     } catch (e) {
//       setErr(e.message || 'Failed to load');
//       setData({ perParty: [], perArticle: [], perDay: [] });
//     } finally {
//       setLoading(false);
//     }
//   }, [party, from, to, setSearchParams]);

//   // Load summary when filters change
//   useEffect(() => {
//     load();
//   }, [load]);

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Party Challan Summary</h2>

//       <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
//         <input
//           placeholder="Party"
//           value={party}
//           onChange={(e) => setParty((e.target.value || '').toUpperCase())}
//           style={{ padding: 8, width: 220 }}
//         />
//         <input
//           type="date"
//           value={from}
//           onChange={(e) => {
//             const newFrom = e.target.value;
//             setFrom(newFrom);
//             // If to-date is before new from-date, reset to-date
//             if (to && to < newFrom) setTo('');
//           }}
//         />
//         <input
//           type="date"
//           value={to}
//           onChange={(e) => setTo(e.target.value)}
//           min={from || undefined}
//           disabled={!from}
//         />
//         <button onClick={load}>Apply</button>
//       </div>

//       {err && <div style={{ color: 'red', marginBottom: 12 }}>{err}</div>}

//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <>
//           {/* Totals per Party */}
//           <h3>Totals per Party</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
//             <thead>
//               <tr style={{ background: '#f7f7f7' }}>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Party</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Total Cartons</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Total Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(!data.perParty || data.perParty.length === 0) ? (
//                 <tr><td colSpan={3} style={{ padding: 10, textAlign: 'center' }}>No data</td></tr>
//               ) : data.perParty.map((r, i) => (
//                 <tr key={i}>
//                   <td style={{ padding: '6px 0' }}>{r.partyName || '-'}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{r.cartons ?? 0}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(r.amount)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Per Article Breakdown */}
//           <h3>Per Article Breakdown</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
//             <thead>
//               <tr style={{ background: '#f7f7f7' }}>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Date</th>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Article</th>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Color</th>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Size</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Rate</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Cartons</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(!data.perArticle || data.perArticle.length === 0) ? (
//                 <tr><td colSpan={7} style={{ padding: 10, textAlign: 'center' }}>No data</td></tr>
//               ) : data.perArticle.map((r, i) => (
//                 <tr key={i}>
//                   <td style={{ padding: '6px 0' }}>{r.date || '-'}</td>
//                   <td style={{ padding: '6px 0' }}>{r.article}</td>
//                   <td style={{ padding: '6px 0' }}>{r.color}</td>
//                   <td style={{ padding: '6px 0' }}>{r.size}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{r.rate ?? 0}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{r.cartons ?? 0}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(r.amount)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Per Day Totals */}
//           <h3>Per Day Totals</h3>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead>
//               <tr style={{ background: '#f7f7f7' }}>
//                 <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Date</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Cartons</th>
//                 <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: '8px 6px' }}>Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(!data.perDay || data.perDay.length === 0) ? (
//                 <tr><td colSpan={3} style={{ padding: 10, textAlign: 'center' }}>No data</td></tr>
//               ) : data.perDay.map((r, i) => (
//                 <tr key={i}>
//                   <td style={{ padding: '6px 0' }}>{r.date}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{r.cartons ?? 0}</td>
//                   <td style={{ padding: '6px 0', textAlign: 'right' }}>{formatCurrency(r.amount)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </>
//       )}
//     </div>
//   );
// }
// import React, { useEffect, useState, useCallback } from 'react';
// import { useSearchParams } from 'react-router-dom';
// import api from "../utils/api";

// function fmtDate(d) {
//   const dt = new Date(d);
//   const yyyy = dt.getFullYear();
//   const mm = String(dt.getMonth() + 1).padStart(2, '0');
//   const dd = String(dt.getDate()).padStart(2, '0');
//   return `${yyyy}-${mm}-${dd}`;
// }

// function firstDayOfMonth(date = new Date()) {
//   return fmtDate(new Date(date.getFullYear(), date.getMonth(), 1));
// }

// function today() {
//   return fmtDate(new Date());
// }

// function formatCurrency(v) {
//   const n = Number(v || 0);
//   return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
// }

// export default function PartySummary() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [party, setParty] = useState((searchParams.get('party') || '').toUpperCase());
//   const [from, setFrom] = useState(searchParams.get('from') || firstDayOfMonth());
//  // Default ko blank rakhein
// //const [from, setFrom] = useState(searchParams.get('from') || '');
// //const [to, setTo] = useState(searchParams.get('to') || '');

//  const [to, setTo] = useState(searchParams.get('to') || today());
//   const [data, setData] = useState({ perParty: [], perArticle: [], perDay: [] });
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState('');

//   // When "from" changes and "to" is before "from", reset "to"
//   useEffect(() => {
//     if (from && to && to < from) {
//       setTo(from);
//     }
//   }, [from, to]);

//   // Memoized loader
//   const load = useCallback(async () => {
//     try {
//       setLoading(true);
//       setErr('');

//       // Keep URL in sync with filters
//       const qs = new URLSearchParams();
//       if (party) qs.set('party', party.toUpperCase());
//       if (from) qs.set('from', from);
//       if (to) qs.set('to', to);
//       setSearchParams(qs);

//       // Fetch summary
//       const res = await api.get(`/challans/party-summary?${qs.toString()}`);
// const json = res.data; // Note: axios returns data in .data property
//       if (!json.success) throw new Error(json.error || 'Failed to load');
//       setData(json.data || { perParty: [], perArticle: [], perDay: [] });
//     } catch (e) {
//       setErr(e.message || 'Failed to load');
//       setData({ perParty: [], perArticle: [], perDay: [] });
//     } finally {
//       setLoading(false);
//     }
//   }, [party, from, to, setSearchParams]);

//   // Load summary when filters change
//   useEffect(() => {
//     load();
//   }, [load]);

//   return (
//     <div className="dashboard-bg min-vh-100 py-4">
//       <style>{`
//         .dashboard-bg {
//           background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
//           min-height: 100vh;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//         }
        
//         .summary-card {
//           background: #ffffff;
//           border-radius: 16px;
//           box-shadow: 0 10px 40px 0 rgba(85,76,219,0.08), 0 4px 16px rgba(60,72,126,0.12);
//           border: none;
//           margin-bottom: 2rem;
//         }
        
//         .card-header-gradient {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           border-radius: 16px 16px 0 0;
//           padding: 2rem;
//           text-align: center;
//           position: relative;
//           overflow: hidden;
//         }
        
//         .card-header-gradient::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
//           pointer-events: none;
//         }
        
//         .header-icon {
//           width: 80px;
//           height: 80px;
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 1rem;
//           font-size: 2rem;
//           backdrop-filter: blur(10px);
//           border: 3px solid rgba(255, 255, 255, 0.3);
//         }
//         .header-logo {
//   width: 100%;
//   height: 100%;
//   object-fit: contain;
//   border-radius: 50%;
// }

//         .filter-section {
//           background: #f8f9ff;
//           border-radius: 12px;
//           padding: 1.5rem;
//           margin: 2rem 0;
//           border: 1px solid #e1e8f7;
//         }
        
//         .form-control-modern {
//           background: #ffffff;
//           border: 2px solid #e2e8f0;
//           border-radius: 10px;
//           padding: 0.75rem 1rem;
//           transition: all 0.3s ease;
//           font-size: 0.95rem;
//         }
        
//         .form-control-modern:focus {
//           outline: none;
//           border-color: #667eea;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           transform: translateY(-1px);
//         }
        
//         .btn-apply {
//           background: linear-gradient(45deg, #667eea, #764ba2);
//           color: white;
//           border: none;
//           border-radius: 10px;
//           padding: 0.75rem 2rem;
//           font-weight: 600;
//           transition: all 0.3s ease;
//           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
//         }
        
//         .btn-apply:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//           color: white;
//         }
        
//         .table-modern {
//           background: white;
//           border-radius: 12px;
//           overflow: hidden;
//           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
//           margin-bottom: 2rem;
//         }
        
//         .table-modern thead {
//           background: linear-gradient(90deg, #6c7293 0%, #4a5568 100%);
//           color: white;
//         }
        
//         .table-modern th {
//           padding: 1rem;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           font-size: 0.85rem;
//           border: none;
//         }
        
//         .table-modern td {
//           padding: 1rem;
//           border-bottom: 1px solid #f1f5f9;
//           vertical-align: middle;
//         }
        
//         .table-modern tbody tr:hover {
//           background-color: #f8faff;
//           transition: background-color 0.2s ease;
//         }
        
//         .table-modern tbody tr:last-child td {
//           border-bottom: none;
//         }
        
//         .currency-amount {
//           font-weight: 600;
//           color: #059669;
//         }
        
//         .section-title {
//           color: #2d3748;
//           font-weight: 700;
//           margin: 2rem 0 1rem 0;
//           display: flex;
//           align-items: center;
//         }
        
//         .section-icon {
//           width: 40px;
//           height: 40px;
//           background: linear-gradient(45deg, #667eea, #764ba2);
//           border-radius: 10px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           margin-right: 1rem;
//           font-size: 1.2rem;
//         }
        
//         .loading-spinner {
//           display: flex;
//           justify-content: center;
//           align-items: center;
//           padding: 4rem 2rem;
//           flex-direction: column;
//         }
        
//         .error-alert {
//           background: linear-gradient(45deg, #fee2e2, #fecaca);
//           border: 1px solid #fca5a5;
//           color: #7f1d1d;
//           padding: 1rem;
//           border-radius: 10px;
//           margin: 1rem 0;
//           display: flex;
//           align-items: center;
//         }
        
//         .no-data {
//           text-align: center;
//           padding: 3rem 2rem;
//           color: #64748b;
//         }
        
//         .stats-badge {
//           background: linear-gradient(45deg, #3b82f6, #1e40af);
//           color: white;
//           padding: 0.5rem 1rem;
//           border-radius: 20px;
//           font-size: 0.9rem;
//           font-weight: 600;
//           display: inline-block;
//         }
        
//         @media (max-width: 768px) {
//           .filter-section { padding: 1rem; }
//           .card-header-gradient { padding: 1.5rem; }
//           .header-icon { width: 60px; height: 60px; font-size: 1.5rem; }
//           .filter-controls { flex-direction: column !important; }
//           .filter-controls > * { margin-bottom: 0.75rem !important; }
//           .table-modern { font-size: 0.85rem; }
//           .table-modern th, .table-modern td { padding: 0.75rem 0.5rem; }
//         }
//       `}</style>

//       <div className="container-fluid">
//         <div className="row justify-content-center">
//           <div className="col-12">
//             {/* Header Card */}
//             <div className="summary-card">
//               <div className="card-header-gradient">
//                 <div className="header-icon">
//   <img src="/logo.png" alt="Logo" className="header-logo" />
// </div>

//                 <h1 className="mb-2">Party Challan Summary</h1>
//                 <p className="mb-0 opacity-75">Comprehensive analysis of party transactions and deliveries</p>
//               </div>

//               {/* Filter Section */}
//               <div className="p-4">
//                 <div className="filter-section">
//                   <h5 className="mb-3 text-dark">
//                     <i className="bi bi-funnel me-2"></i>
//                     Filters & Search
//                   </h5>
//                   <div className="row filter-controls">
//                     <div className="col-md-3 mb-3">
//                       <label className="form-label fw-semibold text-muted small text-uppercase">From Date</label>
//                       <input
//                         type="date"
//                         className="form-control form-control-modern"
//                         value={from}
//                         onChange={(e) => {
//                           const newFrom = e.target.value;
//                           setFrom(newFrom);
//                           if (to && to < newFrom) setTo('');
//                         }}
//                       />
//                     </div>
//                     <div className="col-md-3 mb-3">
//                       <label className="form-label fw-semibold text-muted small text-uppercase">To Date</label>
//                       <input
//   type="date"
//   className="form-control form-control-modern"
//   value={to}
//   onChange={(e) => setTo(e.target.value)}
//   min={from || undefined}
//   disabled={!from}
// />

//                     </div>
//                     <div className="col-md-4 mb-3">
//                       <label className="form-label fw-semibold text-muted small text-uppercase">Party Name</label>
//                      <input
//   className="form-control form-control-modern"
//   placeholder="Enter party name..."
//   value={party}
//   onChange={(e) => setParty((e.target.value || '').toUpperCase())}
//   disabled={!from || !to}
// />


//                     </div>
                    
//                     <div className="col-md-2 mb-3 d-flex align-items-end">
//                       <button 
//   className="btn-apply w-100" 
//   onClick={load}
//   disabled={loading || !from || !to}
// >
//   {loading ? (
//     <>
//       <span className="spinner-border spinner-border-sm me-2" role="status"></span>
//       Loading...
//     </>
//   ) : (
//     <>
//       <i className="bi bi-search me-2"></i>
//       Apply
//     </>
//   )}
// </button>

//                     </div>
//                   </div>
//                 </div>

//                 {/* Error Alert */}
//                 {err && (
//                   <div className="error-alert">
//                     <i className="bi bi-exclamation-triangle-fill me-2"></i>
//                     <strong>Error:</strong> {err}
//                   </div>
//                 )}

//                 {/* Loading State */}
//                 {loading ? (
//                   <div className="loading-spinner">
//                     <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                     <h5 className="text-muted">Loading party summary...</h5>
//                   </div>
//                 ) : (
//                   <>
//                     {/* Totals per Party */}
//                     <h3 className="section-title">
//                       <div className="section-icon">
//                         <i className="bi bi-people"></i>
//                       </div>
//                       Party-wise Totals
//                     </h3>
//                     <div className="table-responsive">
//                       <table className="table table-modern">
//                         <thead>
//                           <tr>
//                             <th>Party Name</th>
//                             <th className="text-center">Total Cartons</th>
//                             <th className="text-end">Total Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//   {(!from || !to) ? (
//     <tr>
//       <td colSpan={3} className="no-data">
//         <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
//         Pehle date range select karein!
//       </td>
//     </tr>
//   ) : (!data.perParty || data.perParty.length === 0) ? (
//     <tr>
//       <td colSpan={3} className="no-data">
//         <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
//         No party data available for the selected period
//       </td>
//     </tr>
//   ) : data.perParty.map((r, i) => (
//     <tr key={i}>
//       <td className="fw-semibold">{r.partyName || '-'}</td>
//       <td className="text-center">
//         <span className="stats-badge">{r.cartons ?? 0}</span>
//       </td>
//       <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
//     </tr>
//   ))}
// </tbody>

//                       </table>
//                     </div>

//                     {/* Per Article Breakdown */}
//                     <h3 className="section-title">
//                       <div className="section-icon">
//                         <i className="bi bi-box-seam"></i>
//                       </div>
//                       Article-wise Breakdown
//                     </h3>
//                     <div className="table-responsive">
//                       <table className="table table-modern">
//                         <thead>
//                           <tr>
//                             <th>Date</th>
//                             <th>Article</th>
//                             <th>Color</th>
//                             <th>Size</th>
//                             <th className="text-end">Rate</th>
//                             <th className="text-center">Cartons</th>
//                             <th className="text-end">Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {(!data.perArticle || data.perArticle.length === 0) ? (
//                             <tr>
//                               <td colSpan={7} className="no-data">
//                                 <i className="bi bi-archive fs-1 mb-3 d-block"></i>
//                                 No article data available for the selected period
//                               </td>
//                             </tr>
//                           ) : data.perArticle.map((r, i) => (
//                             <tr key={i}>
//                               <td className="text-muted small">{r.date || '-'}</td>
//                               <td className="fw-semibold">{r.article}</td>
//                               <td>{r.color}</td>
//                               <td>{r.size}</td>
//                               <td className="text-end">₹{r.rate ?? 0}</td>
//                               <td className="text-center">
//                                 <span className="badge bg-primary">{r.cartons ?? 0}</span>
//                               </td>
//                               <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>

//                     {/* Per Day Totals */}
//                     <h3 className="section-title">
//                       <div className="section-icon">
//                         <i className="bi bi-calendar-event"></i>
//                       </div>
//                       Daily Totals
//                     </h3>
//                     <div className="table-responsive">
//                       <table className="table table-modern">
//                         <thead>
//                           <tr>
//                             <th>Date</th>
//                             <th className="text-center">Total Cartons</th>
//                             <th className="text-end">Total Amount</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {(!data.perDay || data.perDay.length === 0) ? (
//                             <tr>
//                               <td colSpan={3} className="no-data">
//                                 <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
//                                 No daily data available for the selected period
//                               </td>
//                             </tr>
//                           ) : data.perDay.map((r, i) => (
//                             <tr key={i}>
//                               <td className="fw-semibold">{r.date}</td>
//                               <td className="text-center">
//                                 <span className="stats-badge">{r.cartons ?? 0}</span>
//                               </td>
//                               <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from "../utils/api";

function fmtDate(d) {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function firstDayOfMonth(date = new Date()) {
  return fmtDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

function today() {
  return fmtDate(new Date());
}

function formatCurrency(v) {
  const n = Number(v || 0);
  return n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

export default function PartySummary() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [party, setParty] = useState((searchParams.get('party') || '').toUpperCase());
  const [from, setFrom] = useState(searchParams.get('from') || firstDayOfMonth());
  const [to, setTo] = useState(searchParams.get('to') || today());
  const [data, setData] = useState({ perParty: [], perArticle: [], perDay: [] });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // ✅ New states for autocomplete
  const [partyNames, setPartyNames] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingParties, setLoadingParties] = useState(false);

  // When "from" changes and "to" is before "from", reset "to"
  useEffect(() => {
    if (from && to && to < from) {
      setTo(from);
    }
  }, [from, to]);

  // ✅ Fetch all party names for autocomplete
  const fetchPartyNames = useCallback(async () => {
    try {
      setLoadingParties(true);
      const res = await api.get('/challans/party-names'); // Assume this endpoint exists
      const json = res.data;
      if (json.success) {
        setPartyNames(json.data || []);
      }
    } catch (e) {
      console.error('Failed to fetch party names:', e);
    } finally {
      setLoadingParties(false);
    }
  }, []);

  // Load party names on component mount
  useEffect(() => {
    fetchPartyNames();
  }, [fetchPartyNames]);

  // ✅ Filter parties based on input
  const handlePartyInputChange = (inputValue) => {
    const upperValue = inputValue.toUpperCase();
    setParty(upperValue);
    
    if (upperValue.length > 0) {
      const filtered = partyNames.filter(name => 
        name.toUpperCase().startsWith(upperValue)
      );
      setFilteredParties(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredParties([]);
      setShowSuggestions(false);
    }
  };

  // ✅ Handle suggestion selection
  const handleSuggestionClick = (selectedParty) => {
    setParty(selectedParty.toUpperCase());
    setShowSuggestions(false);
    setFilteredParties([]);
  };

  // ✅ Hide suggestions when clicking outside
  const handleInputBlur = () => {
    // Delay hiding to allow clicking on suggestions
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Memoized loader
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr('');

      // Keep URL in sync with filters
      const qs = new URLSearchParams();
      if (party) qs.set('party', party.toUpperCase());
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);
      setSearchParams(qs);

      // Fetch summary
      const res = await api.get(`/challans/party-summary?${qs.toString()}`);
      const json = res.data;
      if (!json.success) throw new Error(json.error || 'Failed to load');
      setData(json.data || { perParty: [], perArticle: [], perDay: [] });
    } catch (e) {
      setErr(e.message || 'Failed to load');
      setData({ perParty: [], perArticle: [], perDay: [] });
    } finally {
      setLoading(false);
    }
  }, [party, from, to, setSearchParams]);

  // Load summary when filters change
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="dashboard-bg min-vh-100 py-4">
      <style>{`
        .dashboard-bg {
          background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .summary-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px 0 rgba(85,76,219,0.08), 0 4px 16px rgba(60,72,126,0.12);
          border: none;
          margin-bottom: 2rem;
        }
        
        .card-header-gradient {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
          color: white;
          border-radius: 16px 16px 0 0;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .card-header-gradient::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
          pointer-events: none;
        }
        
        .header-icon {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255, 255, 255, 0.3);
        }
        
        .header-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }

        .filter-section {
          background: #f8f9ff;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
          border: 1px solid #e1e8f7;
        }
        
        .form-control-modern {
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }
        
        .form-control-modern:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
          transform: translateY(-1px);
        }

        /* ✅ Autocomplete Styles */
        .autocomplete-container {
          position: relative;
        }

        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 2px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 10px 10px;
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: background-color 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 500;
          color: #2d3748;
        }

        .suggestion-item:hover {
          background-color: #6366f1;
          color: white;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .no-suggestions {
          padding: 1rem;
          text-align: center;
          color: #718096;
          font-style: italic;
        }

        .loading-suggestions {
          padding: 1rem;
          text-align: center;
          color: #6366f1;
        }

        .btn-apply {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 0.75rem 2rem;
          font-weight: 600;
          font-family: 'Inter', -apple-system, sans-serif;
          transition: all 0.25s ease;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
          cursor: pointer;
        }

        .btn-apply:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.48);
          color: white;
        }
        
        .table-modern {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }
        
        .table-modern thead {
          background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
          color: white;
        }

        .table-modern th {
          padding: 12px 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.76rem;
          border: none;
          color: white;
        }
        
        .table-modern td {
          padding: 12px 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
          font-size: 0.93rem;
          color: #1e293b;
          font-weight: 400;
        }
        
        .table-modern tbody tr:hover {
          background-color: #f8faff;
          transition: background-color 0.2s ease;
        }
        
        .table-modern tbody tr:last-child td {
          border-bottom: none;
        }
        
        .currency-amount {
          font-weight: 600;
          color: #059669;
        }
        
        .section-title {
          color: #2d3748;
          font-weight: 700;
          margin: 2rem 0 1rem 0;
          display: flex;
          align-items: center;
        }
        
        .section-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-right: 1rem;
          font-size: 1.2rem;
        }
        
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 4rem 2rem;
          flex-direction: column;
        }
        
        .error-alert {
          background: linear-gradient(45deg, #fee2e2, #fecaca);
          border: 1px solid #fca5a5;
          color: #7f1d1d;
          padding: 1rem;
          border-radius: 10px;
          margin: 1rem 0;
          display: flex;
          align-items: center;
        }
        
        .no-data {
          text-align: center;
          padding: 3rem 2rem;
          color: #64748b;
        }
        
        .stats-badge {
          background: linear-gradient(45deg, #3b82f6, #1e40af);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-block;
        }
        
        @media (max-width: 768px) {
          .filter-section { padding: 1rem; }
          .card-header-gradient { padding: 1.5rem; }
          .header-icon { width: 60px; height: 60px; font-size: 1.5rem; }
          .filter-controls { flex-direction: column !important; }
          .filter-controls > * { margin-bottom: 0.75rem !important; }
          .table-modern { font-size: 0.85rem; }
          .table-modern th, .table-modern td { padding: 0.75rem 0.5rem; }
          
          .suggestions-dropdown {
            max-height: 150px;
          }
        }
      `}</style>

      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            {/* Header Card */}
            <div className="summary-card">
              <div className="card-header-gradient">
                <div className="header-icon" style={{ fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  📋
                </div>
                <h1 className="mb-2">Party Challan Summary</h1>
                <p className="mb-0 opacity-75">Comprehensive analysis of party transactions and deliveries</p>
              </div>

              {/* Filter Section */}
              <div className="p-4">
                <div className="filter-section">
                  <h5 className="mb-3 text-dark">
                    <i className="bi bi-funnel me-2"></i>
                    Filters & Search
                  </h5>
                  <div className="row filter-controls">
                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold text-muted small text-uppercase">From Date</label>
                      <input
                        type="date"
                        className="form-control form-control-modern"
                        value={from}
                        onChange={(e) => {
                          const newFrom = e.target.value;
                          setFrom(newFrom);
                          if (to && to < newFrom) setTo('');
                        }}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label fw-semibold text-muted small text-uppercase">To Date</label>
                      <input
                        type="date"
                        className="form-control form-control-modern"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        min={from || undefined}
                        disabled={!from}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label fw-semibold text-muted small text-uppercase">
                        Party Name
                        {loadingParties && (
                          <span className="text-primary ms-2">
                            <i className="spinner-border spinner-border-sm"></i>
                          </span>
                        )}
                      </label>
                      {/* ✅ Enhanced Autocomplete Input */}
                      <div className="autocomplete-container">
                        <input
                          className="form-control form-control-modern"
                          placeholder="Type party name..."
                          value={party}
                          onChange={(e) => handlePartyInputChange(e.target.value)}
                          onBlur={handleInputBlur}
                          onFocus={() => {
                            if (party.length > 0 && filteredParties.length > 0) {
                              setShowSuggestions(true);
                            }
                          }}
                          disabled={!from || !to}
                        />
                        
                        {/* ✅ Suggestions Dropdown */}
                        {showSuggestions && (
                          <div className="suggestions-dropdown">
                            {loadingParties ? (
                              <div className="loading-suggestions">
                                <i className="spinner-border spinner-border-sm me-2"></i>
                                Loading party names...
                              </div>
                            ) : filteredParties.length > 0 ? (
                              filteredParties.slice(0, 10).map((partyName, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onMouseDown={() => handleSuggestionClick(partyName)}
                                >
                                  {partyName}
                                </div>
                              ))
                            ) : party.length > 0 ? (
                              <div className="no-suggestions">
                                No parties found starting with "{party}"
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-2 mb-3 d-flex align-items-end">
                      <button 
                        className="btn-apply w-100" 
                        onClick={load}
                        disabled={loading || !from || !to}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Loading...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-search me-2"></i>
                            Apply
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Alert */}
                {err && (
                  <div className="error-alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>Error:</strong> {err}
                  </div>
                )}

                {/* Loading State */}
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted">Loading party summary...</h5>
                  </div>
                ) : (
                  <>
                    {/* Totals per Party */}
                    <h3 className="section-title">
                      <div className="section-icon">
                        <i className="bi bi-people"></i>
                      </div>
                      Party-wise Totals
                    </h3>
                    <div className="table-responsive">
                      <table className="table table-modern">
                        <thead>
                          <tr>
                            <th>Party Name</th>
                            <th className="text-center">Total Cartons</th>
                            <th className="text-end">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!from || !to) ? (
                            <tr>
                              <td colSpan={3} className="no-data">
                                <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                                Pehle date range select karein!
                              </td>
                            </tr>
                          ) : (!data.perParty || data.perParty.length === 0) ? (
                            <tr>
                              <td colSpan={3} className="no-data">
                                <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                                No party data available for the selected period
                              </td>
                            </tr>
                          ) : data.perParty.map((r, i) => (
                            <tr key={i}>
                              <td className="fw-semibold">{r.partyName || '-'}</td>
                              <td className="text-center">
                                <span className="stats-badge">{r.cartons ?? 0}</span>
                              </td>
                              <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Per Article Breakdown */}
                    <h3 className="section-title">
                      <div className="section-icon">
                        <i className="bi bi-box-seam"></i>
                      </div>
                      Article-wise Breakdown
                    </h3>
                    <div className="table-responsive">
                      <table className="table table-modern">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Article</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th className="text-end">Rate</th>
                            <th className="text-center">Cartons</th>
                            <th className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!data.perArticle || data.perArticle.length === 0) ? (
                            <tr>
                              <td colSpan={7} className="no-data">
                                <i className="bi bi-archive fs-1 mb-3 d-block"></i>
                                No article data available for the selected period
                              </td>
                            </tr>
                          ) : data.perArticle.map((r, i) => (
                            <tr key={i}>
                              <td className="text-muted small">{r.date || '-'}</td>
                              <td className="fw-semibold">{r.article}</td>
                              <td>{r.color}</td>
                              <td>{r.size}</td>
                              <td className="text-end">₹{r.rate ?? 0}</td>
                              <td className="text-center">
                                <span className="badge bg-primary">{r.cartons ?? 0}</span>
                              </td>
                              <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Per Day Totals */}
                    <h3 className="section-title">
                      <div className="section-icon">
                        <i className="bi bi-calendar-event"></i>
                      </div>
                      Daily Totals
                    </h3>
                    <div className="table-responsive">
                      <table className="table table-modern">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th className="text-center">Total Cartons</th>
                            <th className="text-end">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(!data.perDay || data.perDay.length === 0) ? (
                            <tr>
                              <td colSpan={3} className="no-data">
                                <i className="bi bi-calendar-x fs-1 mb-3 d-block"></i>
                                No daily data available for the selected period
                              </td>
                            </tr>
                          ) : data.perDay.map((r, i) => (
                            <tr key={i}>
                              <td className="fw-semibold">{r.date}</td>
                              <td className="text-center">
                                <span className="stats-badge">{r.cartons ?? 0}</span>
                              </td>
                              <td className="text-end currency-amount">{formatCurrency(r.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
