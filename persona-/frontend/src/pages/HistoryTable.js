




// import React, { useState, useEffect, useMemo } from 'react';
// import { Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import api from '../utils/api'; // ✅ Axios instance imported

// const HistoryTable = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedAction, setSelectedAction] = useState('');
//   const [selectedUpdatedBy, setSelectedUpdatedBy] = useState('');

//   // ✅ Updated fetch function using axios instance
//   const fetchHistory = async () => {
//     try {
//       const response = await api.get('/history'); // ✅ No /api prefix needed (already in baseURL)
//       const data = response.data;
//       if (data.success) {
//         setHistory(data.data);
//       } else {
//         setError(data.error || 'Failed to load history.');
//       }
//     } catch (err) {
//       console.error('Fetch history error:', err);
//       setError(err.response?.data?.error || err.message || 'Failed to load history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchHistory();
//   }, []);

//   // Compute unique values for dropdowns
//   const uniqueActions = useMemo(() => [...new Set(history.map(entry => entry.action))].sort(), [history]);
//   const uniqueUpdatedBy = useMemo(
//     () => [...new Set(history.map(e => (e.updatedByName || e.updatedBy?.username || 'Unknown')))].sort(),
//     [history]
//   );

//   // Filtered history based on search and dropdowns
//   const filteredHistory = useMemo(() => {
//     return history.filter(entry => {
//       const searchLower = searchTerm.toLowerCase();
//       const entryText = `${entry.product?.article || ''} ${entry.product?.color || ''} ${entry.product?.size || ''} ${entry.note || ''} ${(entry.updatedByName || entry.updatedBy?.username || '')}`.toLowerCase();

//       const matchesSearch = entryText.includes(searchLower);
//       const matchesAction = selectedAction ? entry.action === selectedAction : true;
//       const matchesUpdatedBy = selectedUpdatedBy
//         ? (entry.updatedByName || entry.updatedBy?.username || 'Unknown') === selectedUpdatedBy
//         : true;

//       return matchesSearch && matchesAction && matchesUpdatedBy;
//     });
//   }, [history, searchTerm, selectedAction, selectedUpdatedBy]);

//   // ✅ Updated delete handler using axios
//   const handleDelete = async (id) => {
//     if (!window.confirm(
//       '⚠ WARNING: Are you sure you want to delete this entry? This will revert stock changes and cannot be undone.'
//     )) return;
    
//     try {
//       const result = await api.delete(`/history/${id}`); // ✅ Using axios instance
//       if (result.data.success) {
//         setHistory(prev => prev.filter(item => item._id !== id));
//         toast.success('Entry deleted successfully.');
//       } else {
//         toast.error('Failed to delete: ' + (result.data.error || 'Unknown error'));
//       }
//     } catch (err) {
//       console.error('Delete error:', err);
//       toast.error('Error deleting entry: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   // ✅ Updated permanent delete handler using axios
//   const handlePermanentDelete = async (row) => {
//     // safety: agar product ya product.article missing ho to ignore
//     if (!row.product || !row.product.article) {
//       toast.error('Permanent delete not possible: product field missing.');
//       return;
//     }
//     if (row.action === 'CHALLAN_OUT') return;  // double-safety

//     if (!window.confirm(
//           `🚨  '${row.product.article}' को पूरी तरह delete और सारी संबंधित salary 0 करनी है?`
//         )) return;

//     try {
//       const result = await api.post('/history/permanent-delete-article', { // ✅ Using axios instance
//         article: row.product.article,
//         gender : row.product.gender,   // ये फ़ील्ड मौजूद न हो तो backend ignore कर देगा
//         size   : row.product.size,
//         color  : row.product.color
//       });
      
//       if (result.data.success) {
//         toast.success('Article deleted & salaries reset');
//         fetchHistory();                 // तालिका रीफ़्रेश
//       } else {
//         toast.error(result.data.error || 'Permanent delete failed');
//       }
//     } catch (err) {
//       console.error('Permanent delete error:', err);
//       toast.error(err.response?.data?.error || err.message || 'Permanent delete failed');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-bg min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading history...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-bg min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="alert alert-danger" role="alert">
//           <h4 className="alert-heading">Error!</h4>
//           <p>{error}</p>
//           <button className="btn btn-outline-danger" onClick={() => {
//             setError(null);
//             setLoading(true);
//             fetchHistory();
//           }}>
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
//  return (
//     <div className="dashboard-bg min-vh-100 py-4">
//       <style>{`
//         .dashboard-bg {
//           background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
//           min-height: 100vh;
//         }
//         .card {
//           box-shadow: 0 8px 32px 0 rgba(85,76,219,0.08), 0 2px 8px rgba(60,72,126,0.12);
//           border-radius: 16px;
//           border: none;
//         }
//         .card-body {
//           background: rgba(255,255,255,0.98);
//           border-radius: 12px;
//         }
//         .search-input {
//           background: #f0f4fc;
//           border-radius: 10px;
//           border: 1px solid #d5dcf8;
//           padding: 12px 16px;
//         }
//         .filter-select {
//           background: #f0f4fc;
//           border-radius: 8px;
//           border: 1px solid #d5dcf8;
//           padding: 8px 12px;
//           min-width: 140px;
//         }
//         .table {
//           background: white;
//           border-radius: 10px;
//           overflow: hidden;
//         }
//         .table-dark {
//           background: linear-gradient(90deg, #6c7293 0%, #4a5568 100%);
//           color: white;
//         }
//         .table-hover tbody tr:hover {
//           background-color: #f5f2ff !important;
//           transition: background-color 0.2s ease;
//         }
//         .btn-action {
//           border-radius: 6px;
//           font-weight: 500;
//           padding: 8px 12px;
//           font-size: 12px;
//           margin: 2px;
//           border: none;
//           transition: all 0.2s ease;
//           min-width: 80px;
//         }
//         .btn-edit {
//           background: linear-gradient(45deg, #4CAF50, #45a049);
//           color: white;
//         }
//         .btn-edit:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
//         }
//         .btn-delete {
//           background: linear-gradient(45deg, #f44336, #d32f2f);
//           color: white;
//         }
//         .btn-delete:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
//         }
//         .btn-permanent {
//           background: linear-gradient(45deg, #333, #000);
//           color: white;
//           min-width: 110px;
//         }
//         .btn-permanent:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
//         }
//         .btn-disabled {
//           opacity: 0.5;
//           cursor: not-allowed !important;
//           transform: none !important;
//           box-shadow: none !important;
//         }
//         .party-link {
//           background: linear-gradient(45deg, #007BFF, #0056b3);
//           color: white !important;
//           padding: 10px 16px;
//           border-radius: 8px;
//           text-decoration: none !important;
//           font-weight: 500;
//           transition: all 0.2s ease;
//           display: inline-block;
//         }
//         .party-link:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
//           color: white !important;
//         }
//         .action-badge {
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 600;
//           text-transform: uppercase;
//         }
//         .action-add { background: #e8f5e8; color: #2e7d32; }
//         .action-update { background: #e3f2fd; color: #1565c0; }
//         .action-challan { background: #fff3e0; color: #ef6c00; }
//         .action-delete { background: #ffebee; color: #c62828; }
//         .text-truncate-custom {
//           max-width: 150px;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .operations-cell {
//           min-width: 280px;
//           white-space: nowrap;
//         }
//         @media (max-width: 768px) {
//           .table-responsive { font-size: 12px; }
//           .btn-action { padding: 6px 8px; font-size: 10px; min-width: 60px; }
//           .filter-controls { flex-direction: column !important; }
//           .btn-permanent { min-width: 80px; }
//         }
//       `}</style>

//       <div className="container-fluid">
//         <div className="card">
//           <div className="card-body">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <h2 className="mb-0 text-primary">
//                 <i className="bi bi-clock-history me-2"></i>
//                 Stock History / Audit Trail
//               </h2>
//               <Link to="/party-summary" className="party-link">
//                 <i className="bi bi-people me-2"></i>
//                 Party Summary
//               </Link>
//             </div>

//             {/* Search and Filter Controls */}
//             <div className="row mb-4 filter-controls">
//               <div className="col-md-5 mb-3">
//                 <div className="input-group">
//                   <span className="input-group-text bg-light border-0">
//                     <i className="bi bi-search text-muted"></i>
//                   </span>
//                   <input
//                     type="text"
//                     className="form-control search-input border-0"
//                     placeholder="Search by article, color, size, note..."
//                     value={searchTerm}
//                     onChange={e => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-3 mb-3">
//                 <select
//                   className="form-select filter-select"
//                   value={selectedAction}
//                   onChange={e => setSelectedAction(e.target.value)}
//                 >
//                   <option value="">All Actions</option>
//                   {uniqueActions.map(action => (
//                     <option key={action} value={action}>{action}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-4 mb-3">
//                 <select
//                   className="form-select filter-select"
//                   value={selectedUpdatedBy}
//                   onChange={e => setSelectedUpdatedBy(e.target.value)}
//                 >
//                   <option value="">All Updated By</option>
//                   {uniqueUpdatedBy.map(name => (
//                     <option key={name} value={name}>{name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Results Count */}
//             <div className="mb-3">
//               <small className="text-muted">
//                 Showing {filteredHistory.length} of {history.length} records
//               </small>
//             </div>

//             {/* Table */}
//             <div className="table-responsive">
//               <table className="table table-hover table-bordered">
//                 <thead className="table-dark">
//                   <tr>
//                     <th>Action</th>
//                     <th>Article</th>
//                     <th>Color</th>
//                     <th>Size</th>
//                     <th>Cartons</th>
//                     <th>Updated By</th>
//                     <th>Timestamp</th>
//                     <th>Note</th>
//                     <th>Operations</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredHistory.length === 0 ? (
//                     <tr>
//                       <td colSpan="9" className="text-center py-5">
//                         <div className="text-muted">
//                           <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
//                           {searchTerm || selectedAction || selectedUpdatedBy
//                             ? 'No matching history records found.'
//                             : 'No history records found.'}
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredHistory.map(entry => (
//                       <tr key={entry._id}>
//                         <td>
//                           <span className={`action-badge action-${entry.action.toLowerCase()}`}>
//                             {entry.action}
//                           </span>
//                         </td>
//                         <td className="fw-medium">{entry.product?.article || 'N/A'}</td>
//                         <td>{entry.product?.color || 'N/A'}</td>
//                         <td>{entry.product?.size || 'N/A'}</td>
//                         <td className="text-center">
//                           <span className={`badge ${entry.quantityChanged > 0 ? 'bg-success' : entry.quantityChanged < 0 ? 'bg-danger' : 'bg-secondary'}`}>
//                             {entry.quantityChanged > 0 ? '+' : ''}{entry.quantityChanged}
//                           </span>
//                         </td>
//                         <td className="text-truncate-custom">
//                           {entry.updatedByName || entry.updatedBy?.username || 'Unknown'}
//                         </td>
//                         <td className="small">{new Date(entry.timestamp).toLocaleString()}</td>
//                         <td className="text-truncate-custom">
//                           {entry.partyName ? (
//                             <div className="small">
//                               <strong>Party:</strong> <Link to={`/party-summary?party=${encodeURIComponent(entry.partyName)}`} className="text-primary">{entry.partyName}</Link>
//                               <br />
//                               <strong>Invoice:</strong> {entry.invoiceNo || '-'}
//                             </div>
//                           ) : (entry.note || '-')}
//                         </td>
//                       <td className="operations-cell">
//   {/* Edit Button */}
//   {entry.action === 'ADD' || entry.action === 'UPDATE' ? (
//     <Link
//       to={entry.salaryEntryId ? `/salary-entry/edit/${entry.salaryEntryId}` : '#'}
//       className={`btn btn-action btn-edit text-decoration-none ${!entry.salaryEntryId ? 'btn-disabled' : ''}`}
//       onClick={(e) => {
//         if (!entry.salaryEntryId) {
//           e.preventDefault();
//           toast.error('Salary entry ID missing. Cannot edit old entries.');
//         }
//       }}
//       title={entry.salaryEntryId ? "Edit this specific entry" : "Cannot edit old entries"}
//     >
//       Edit
//     </Link>
//   ) : entry.action === 'CHALLAN_OUT' ? (
//     <Link
//       to={entry.challanId ? `/challan-out/edit/${entry.challanId}` : '#'}  // ✅ NO FALLBACK
//       className={`btn btn-action btn-edit text-decoration-none ${!entry.challanId ? 'btn-disabled' : ''}`}
//       onClick={(e) => {
//         if (!entry.challanId) {
//           e.preventDefault();
//           toast.error('Challan ID missing. Please run migration or contact admin.');
//         }
//       }}
//       title={entry.challanId ? "Edit this challan" : "Challan ID missing - cannot edit"}
//     >
//       Edit
//     </Link>
//   ) : (
//     <button
//       className="btn btn-action btn-edit btn-disabled"
//       disabled={true}
//       title="Edit is disabled for this action type"
//     >
//       Edit
//     </button>
//   )}

//   {/* Delete Button - ONLY enabled for CHALLAN_OUT */}
//   <button
//     className={`btn btn-action btn-delete ${entry.action !== 'CHALLAN_OUT' ? 'btn-disabled' : ''}`}
//     title={
//       entry.action !== 'CHALLAN_OUT'
//         ? 'Delete is only allowed for CHALLAN_OUT entries'
//         : 'Delete challan entry and revert stock'
//     }
//     onClick={() => {
//       if (entry.action === 'CHALLAN_OUT') {
//         handleDelete(entry._id);
//       }
//     }}
//     disabled={entry.action !== 'CHALLAN_OUT'}
//   >
//     Delete
//   </button>

//   {/* Permanent Delete Button */}
//   <button
//     className={`btn btn-action btn-permanent ${entry.action === 'CHALLAN_OUT' ? 'btn-disabled' : ''}`}
//     disabled={entry.action === 'CHALLAN_OUT'}
//     title={
//       entry.action === 'CHALLAN_OUT'
//         ? 'Permanent delete disabled for Challan OUT entries'
//         : 'Permanently remove this entry'
//     }
//     onClick={() => handlePermanentDelete(entry)}
//   >
//     Permanent Delete
//   </button>
// </td>


//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HistoryTable;





// import React, { useState, useEffect, useMemo, useCallback } from 'react';

// import { Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import api from '../utils/api';

// const PAGE_SIZE = 50;

// const HistoryTable = () => {
//   const [history, setHistory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pageLoading, setPageLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // pagination
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalCount, setTotalCount] = useState(0);

//   // filters
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedAction, setSelectedAction] = useState('');
//   const [selectedUpdatedBy, setSelectedUpdatedBy] = useState('');

//   // ---------- API with pagination ----------
//   const fetchHistory = useCallback(
//   async (targetPage = 1) => {
//     try {
//       setPageLoading(true);

//       const response = await api.get('/history', {
//         params: { page: targetPage, limit: PAGE_SIZE },
//       });
//       const data = response.data;

//       if (data.success) {
//         setHistory(data.data || []);
//         setPage(data.page || targetPage);
//         setTotalPages(data.totalPages || 1);
//         setTotalCount(data.totalCount || (data.data ? data.data.length : 0));
//         setError(null);
//       } else {
//         setError(data.error || 'Failed to load history.');
//       }
//     } catch (err) {
//       console.error('Fetch history error:', err);
//       setError(err.response?.data?.error || err.message || 'Failed to load history');
//     } finally {
//       setLoading(false);
//       setPageLoading(false);
//     }
//   },
//   [] // <- koi dependency nahi
// );

//  useEffect(() => {
//   fetchHistory(1);
// }, [fetchHistory]);


//   // Compute unique values for dropdowns
//   const uniqueActions = useMemo(
//     () => [...new Set(history.map(entry => entry.action))].sort(),
//     [history]
//   );
//   const uniqueUpdatedBy = useMemo(
//     () =>
//       [...new Set(
//         history.map(e => (e.updatedByName || e.updatedBy?.username || 'Unknown'))
//       )].sort(),
//     [history]
//   );

//   // Filtered history based on search and dropdowns
//   const filteredHistory = useMemo(() => {
//     return history.filter(entry => {
//       const searchLower = searchTerm.toLowerCase();
//       const entryText = `${entry.product?.article || ''} ${entry.product?.color || ''} ${entry.product?.size || ''} ${entry.note || ''} ${(entry.updatedByName || entry.updatedBy?.username || '')}`.toLowerCase();

//       const matchesSearch = entryText.includes(searchLower);
//       const matchesAction = selectedAction ? entry.action === selectedAction : true;
//       const matchesUpdatedBy = selectedUpdatedBy
//         ? (entry.updatedByName || entry.updatedBy?.username || 'Unknown') === selectedUpdatedBy
//         : true;

//       return matchesSearch && matchesAction && matchesUpdatedBy;
//     });
//   }, [history, searchTerm, selectedAction, selectedUpdatedBy]);

//   // delete
//   const handleDelete = async (id) => {
//     if (
//       !window.confirm(
//         '⚠ WARNING: Are you sure you want to delete this entry? This will revert stock changes and cannot be undone.'
//       )
//     ) return;

//     const prev = history;
//     setHistory(prev.filter(item => item._id !== id));

//     try {
//       const result = await api.delete(`/history/${id}`);
//       if (result.data.success) {
//         toast.success('Entry deleted successfully.');
//       } else {
//         toast.error('Failed to delete: ' + (result.data.error || 'Unknown error'));
//         setHistory(prev);
//       }
//     } catch (err) {
//       console.error('Delete error:', err);
//       toast.error('Error deleting entry: ' + (err.response?.data?.error || err.message));
//       setHistory(prev);
//     }
//   };

//   // permanent delete
//   const handlePermanentDelete = async (row) => {
//     if (!row.product || !row.product.article) {
//       toast.error('Permanent delete not possible: product field missing.');
//       return;
//     }
//     if (row.action === 'CHALLAN_OUT') return;

//     if (
//       !window.confirm(
//         `🚨  '${row.product.article}' को पूरी तरह delete और सारी संबंधित salary 0 करनी है?`
//       )
//     ) return;

//     try {
//       const result = await api.post('/history/permanent-delete-article', {
//         article: row.product.article,
//         gender: row.product.gender,
//         size: row.product.size,
//         color: row.product.color,
//       });

//       if (result.data.success) {
//         toast.success('Article deleted & salaries reset');
//         fetchHistory(page);
//       } else {
//         toast.error(result.data.error || 'Permanent delete failed');
//       }
//     } catch (err) {
//       console.error('Permanent delete error:', err);
//       toast.error(err.response?.data?.error || err.message || 'Permanent delete failed');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-bg min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading history...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-bg min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="alert alert-danger" role="alert">
//           <h4 className="alert-heading">Error!</h4>
//           <p>{error}</p>
//           <button
//             className="btn btn-outline-danger"
//             onClick={() => {
//               setError(null);
//               fetchHistory(1);
//             }}
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-bg min-vh-100 py-4">
//       <style>{`
//         .dashboard-bg {
//           background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
//           min-height: 100vh;
//         }
//         .card {
//           box-shadow: 0 8px 32px 0 rgba(85,76,219,0.08), 0 2px 8px rgba(60,72,126,0.12);
//           border-radius: 16px;
//           border: none;
//         }
//         .card-body {
//           background: rgba(255,255,255,0.98);
//           border-radius: 12px;
//         }
//         .search-input {
//           background: #f0f4fc;
//           border-radius: 10px;
//           border: 1px solid #d5dcf8;
//           padding: 12px 16px;
//         }
//         .filter-select {
//           background: #f0f4fc;
//           border-radius: 8px;
//           border: 1px solid #d5dcf8;
//           padding: 8px 12px;
//           min-width: 140px;
//         }
//         .table {
//           background: white;
//           border-radius: 10px;
//           overflow: hidden;
//         }
//         .table-dark {
//           background: linear-gradient(90deg, #6c7293 0%, #4a5568 100%);
//           color: white;
//         }
//         .table-hover tbody tr:hover {
//           background-color: #f5f2ff !important;
//           transition: background-color 0.2s ease;
//         }
//         .btn-action {
//           border-radius: 6px;
//           font-weight: 500;
//           padding: 8px 12px;
//           font-size: 12px;
//           margin: 2px;
//           border: none;
//           transition: all 0.2s ease;
//           min-width: 80px;
//         }
//         .btn-edit {
//           background: linear-gradient(45deg, #4CAF50, #45a049);
//           color: white;
//         }
//         .btn-edit:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
//         }
//         .btn-delete {
//           background: linear-gradient(45deg, #f44336, #d32f2f);
//           color: white;
//         }
//         .btn-delete:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(244, 67, 54, 0.3);
//         }
//         .btn-permanent {
//           background: linear-gradient(45deg, #333, #000);
//           color: white;
//           min-width: 110px;
//         }
//         .btn-permanent:hover {
//           transform: translateY(-1px);
//           box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
//         }
//         .btn-disabled {
//           opacity: 0.5;
//           cursor: not-allowed !important;
//           transform: none !important;
//           box-shadow: none !important;
//         }
//         .party-link {
//           background: linear-gradient(45deg, #007BFF, #0056b3);
//           color: white !important;
//           padding: 10px 16px;
//           border-radius: 8px;
//           text-decoration: none !important;
//           font-weight: 500;
//           transition: all 0.2s ease;
//           display: inline-block;
//         }
//         .party-link:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 6px 20px rgba(0, 123, 255, 0.3);
//           color: white !important;
//         }
//         .action-badge {
//           padding: 4px 8px;
//           border-radius: 12px;
//           font-size: 11px;
//           font-weight: 600;
//           text-transform: uppercase;
//         }
//         .action-add { background: #e8f5e8; color: #2e7d32; }
//         .action-update { background: #e3f2fd; color: #1565c0; }
//         .action-challan { background: #fff3e0; color: #ef6c00; }
//         .action-delete { background: #ffebee; color: #c62828; }
//         .text-truncate-custom {
//           max-width: 150px;
//           overflow: hidden;
//           text-overflow: ellipsis;
//           white-space: nowrap;
//         }
//         .operations-cell {
//           min-width: 280px;
//           white-space: nowrap;
//         }
//         @media (max-width: 768px) {
//           .table-responsive { font-size: 12px; }
//           .btn-action { padding: 6px 8px; font-size: 10px; min-width: 60px; }
//           .filter-controls { flex-direction: column !important; }
//           .btn-permanent { min-width: 80px; }
//         }
//       `}</style>

//       <div className="container-fluid">
//         <div className="card">
//           <div className="card-body">
//             <div className="d-flex justify-content-between align-items-center mb-4">
//               <h2 className="mb-0 text-primary">
//                 <i className="bi bi-clock-history me-2"></i>
//                 Stock History / Audit Trail
//               </h2>
//               <Link to="/party-summary" className="party-link">
//                 <i className="bi bi-people me-2"></i>
//                 Party Summary
//               </Link>
//             </div>

//             {/* Search and Filter Controls */}
//             <div className="row mb-4 filter-controls">
//               <div className="col-md-5 mb-3">
//                 <div className="input-group">
//                   <span className="input-group-text bg-light border-0">
//                     <i className="bi bi-search text-muted"></i>
//                   </span>
//                   <input
//                     type="text"
//                     className="form-control search-input border-0"
//                     placeholder="Search by article, color, size, note..."
//                     value={searchTerm}
//                     onChange={e => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//               </div>
//               <div className="col-md-3 mb-3">
//                 <select
//                   className="form-select filter-select"
//                   value={selectedAction}
//                   onChange={e => setSelectedAction(e.target.value)}
//                 >
//                   <option value="">All Actions</option>
//                   {uniqueActions.map(action => (
//                     <option key={action} value={action}>{action}</option>
//                   ))}
//                 </select>
//               </div>
//               <div className="col-md-4 mb-3">
//                 <select
//                   className="form-select filter-select"
//                   value={selectedUpdatedBy}
//                   onChange={e => setSelectedUpdatedBy(e.target.value)}
//                 >
//                   <option value="">All Updated By</option>
//                   {uniqueUpdatedBy.map(name => (
//                     <option key={name} value={name}>{name}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Results Count */}
//             <div className="mb-3">
//               <small className="text-muted">
//                 Showing {filteredHistory.length} of {totalCount} records (page {page} / {totalPages})
//               </small>
//             </div>

//             {/* Table */}
//             <div className="table-responsive">
//               <table className="table table-hover table-bordered">
//                 <thead className="table-dark">
//                   <tr>
//                     <th>Action</th>
//                     <th>Article</th>
//                     <th>Color</th>
//                     <th>Size</th>
//                     <th>Cartons</th>
//                     <th>Updated By</th>
//                     <th>Timestamp</th>
//                     <th>Note</th>
//                     <th>Operations</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredHistory.length === 0 ? (
//                     <tr>
//                       <td colSpan="9" className="text-center py-5">
//                         <div className="text-muted">
//                           <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
//                           {searchTerm || selectedAction || selectedUpdatedBy
//                             ? 'No matching history records found.'
//                             : 'No history records found.'}
//                         </div>
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredHistory.map(entry => (
//                       <tr key={entry._id}>
//                         <td>
//                           <span className={`action-badge action-${entry.action.toLowerCase()}`}>
//                             {entry.action}
//                           </span>
//                         </td>
//                         <td className="fw-medium">{entry.product?.article || 'N/A'}</td>
//                         <td>{entry.product?.color || 'N/A'}</td>
//                         <td>{entry.product?.size || 'N/A'}</td>
//                         <td className="text-center">
//                           <span className={`badge ${
//                             entry.quantityChanged > 0
//                               ? 'bg-success'
//                               : entry.quantityChanged < 0
//                               ? 'bg-danger'
//                               : 'bg-secondary'
//                           }`}>
//                             {entry.quantityChanged > 0 ? '+' : ''}{entry.quantityChanged}
//                           </span>
//                         </td>
//                         <td className="text-truncate-custom">
//                           {entry.updatedByName || entry.updatedBy?.username || 'Unknown'}
//                         </td>
//                         <td className="small">
//                           {new Date(entry.timestamp).toLocaleString()}
//                         </td>
//                         <td className="text-truncate-custom">
//                           {entry.partyName ? (
//                             <div className="small">
//                               <strong>Party:</strong>{' '}
//                               <Link
//                                 to={`/party-summary?party=${encodeURIComponent(entry.partyName)}`}
//                                 className="text-primary"
//                               >
//                                 {entry.partyName}
//                               </Link>
//                               <br />
//                               <strong>Invoice:</strong> {entry.invoiceNo || '-'}
//                             </div>
//                           ) : (entry.note || '-')}
//                         </td>
//                         <td className="operations-cell">
//                           {/* Edit Button */}
//                           {entry.action === 'ADD' || entry.action === 'UPDATE' ? (
//                             <Link
//                               to={entry.salaryEntryId ? `/salary-entry/edit/${entry.salaryEntryId}` : '#'}
//                               className={`btn btn-action btn-edit text-decoration-none ${
//                                 !entry.salaryEntryId ? 'btn-disabled' : ''
//                               }`}
//                               onClick={(e) => {
//                                 if (!entry.salaryEntryId) {
//                                   e.preventDefault();
//                                   toast.error('Salary entry ID missing. Cannot edit old entries.');
//                                 }
//                               }}
//                               title={entry.salaryEntryId
//                                 ? 'Edit this specific entry'
//                                 : 'Cannot edit old entries'}
//                             >
//                               Edit
//                             </Link>
//                           ) : entry.action === 'CHALLAN_OUT' ? (
//                             <Link
//                               to={entry.challanId ? `/challan-out/edit/${entry.challanId}` : '#'}
//                               className={`btn btn-action btn-edit text-decoration-none ${
//                                 !entry.challanId ? 'btn-disabled' : ''
//                               }`}
//                               onClick={(e) => {
//                                 if (!entry.challanId) {
//                                   e.preventDefault();
//                                   toast.error(
//                                     'Challan ID missing. Please run migration or contact admin.'
//                                   );
//                                 }
//                               }}
//                               title={entry.challanId
//                                 ? 'Edit this challan'
//                                 : 'Challan ID missing - cannot edit'}
//                             >
//                               Edit
//                             </Link>
//                           ) : (
//                             <button
//                               className="btn btn-action btn-edit btn-disabled"
//                               disabled
//                               title="Edit is disabled for this action type"
//                             >
//                               Edit
//                             </button>
//                           )}

//                           {/* Delete Button - ONLY enabled for CHALLAN_OUT */}
//                           <button
//                             className={`btn btn-action btn-delete ${
//                               entry.action !== 'CHALLAN_OUT' ? 'btn-disabled' : ''
//                             }`}
//                             title={
//                               entry.action !== 'CHALLAN_OUT'
//                                 ? 'Delete is only allowed for CHALLAN_OUT entries'
//                                 : 'Delete challan entry and revert stock'
//                             }
//                             onClick={() => {
//                               if (entry.action === 'CHALLAN_OUT') {
//                                 handleDelete(entry._id);
//                               }
//                             }}
//                             disabled={entry.action !== 'CHALLAN_OUT'}
//                           >
//                             Delete
//                           </button>

//                           {/* Permanent Delete Button */}
//                           <button
//                             className={`btn btn-action btn-permanent ${
//                               entry.action === 'CHALLAN_OUT' ? 'btn-disabled' : ''
//                             }`}
//                             disabled={entry.action === 'CHALLAN_OUT'}
//                             title={
//                               entry.action === 'CHALLAN_OUT'
//                                 ? 'Permanent delete disabled for Challan OUT entries'
//                                 : 'Permanently remove this entry'
//                             }
//                             onClick={() => handlePermanentDelete(entry)}
//                           >
//                             Permanent Delete
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination buttons */}
//             <div className="d-flex justify-content-between align-items-center mt-3">
//               <button
//                 className="btn btn-outline-secondary"
//                 disabled={page <= 1 || pageLoading}
//                 onClick={() => fetchHistory(page - 1)}
//               >
//                 ← Prev
//               </button>

//               <span className="text-muted small">
//                 Page {page} of {totalPages}
//               </span>

//               <button
//                 className="btn btn-outline-secondary"
//                 disabled={page >= totalPages || pageLoading}
//                 onClick={() => fetchHistory(page + 1)}
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HistoryTable;
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import api from '../utils/api';
import '../App.css';

const PAGE_SIZE = 50;

const HistoryTable = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedUpdatedBy, setSelectedUpdatedBy] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' });
  const searchRef = useRef(null);

  // ---------- API with pagination + global search ----------
  const fetchHistory = useCallback(
    async (targetPage = 1) => {
      try {
        setPageLoading(true);

        const response = await api.get('/history', {
          params: {
            page: targetPage,
            limit: PAGE_SIZE,
            search: searchTerm,
            action: selectedAction,
            updatedBy: selectedUpdatedBy,
          },
        });
        const data = response.data;

        if (data.success) {
          setHistory(data.data || []);
          setPage(data.page || targetPage);
          setTotalPages(data.totalPages || 1);
          setTotalCount(data.totalCount || 0);
          setError(null);
        } else {
          setError(data.error || 'Failed to load history.');
        }
      } catch (err) {
        console.error('Fetch history error:', err);
        setError(
          err.response?.data?.error ||
            err.message ||
            'Failed to load history'
        );
      } finally {
        setLoading(false);
        setPageLoading(false);
      }
    },
    [searchTerm, selectedAction, selectedUpdatedBy]
  );

  // initial load
  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // handlers: search + filters (state change)
  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  }, []);

  const handleActionChange = useCallback((e) => {
    setSelectedAction(e.target.value);
    setPage(1);
  }, []);

  const handleUpdatedByChange = useCallback((e) => {
    setSelectedUpdatedBy(e.target.value);
    setPage(1);
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Keyboard shortcut: press / to focus search
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // debounce search/filter fetch
  useEffect(() => {
    const id = setTimeout(() => {
      fetchHistory(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchTerm, selectedAction, selectedUpdatedBy, fetchHistory]);

  // ✅ NEW: Find page for given article (uses /history/page-of-article)
  const handleFindArticlePage = useCallback(async () => {
    const article = searchTerm.trim();
    if (!article) {
      toast.error('Please enter article to find page.');
      return;
    }
    try {
      const res = await api.get('/history/page-of-article', {
        params: { article, limit: PAGE_SIZE },
      });
      if (!res.data.success) {
        toast.error(res.data.message || 'Article not found in history');
        return;
      }
      const targetPage = res.data.page;
      setPage(targetPage);
      // Normal list load WITHOUT search filter, because page is for full history
      await api
        .get('/history', {
          params: {
            page: targetPage,
            limit: PAGE_SIZE,
            // search intentionally blank for full list position
          },
        })
        .then((response) => {
          const data = response.data;
          if (data.success) {
            setHistory(data.data || []);
            setTotalPages(data.totalPages || 1);
            setTotalCount(data.totalCount || 0);
          } else {
            toast.error(
              data.error || 'Failed to load history for target page'
            );
          }
        });
      toast.success(`Article "${article}" is on page ${targetPage}`);
    } catch (err) {
      console.error('Find article page error:', err);
      toast.error(
        err.response?.data?.error ||
          err.message ||
          'Failed to find article page'
      );
    }
  }, [searchTerm]);

  // dropdown options (current page data)
  const uniqueActions = useMemo(
    () => [...new Set(history.map((entry) => entry.action))].sort(),
    [history]
  );
  const uniqueUpdatedBy = useMemo(
    () =>
      [
        ...new Set(
          history.map(
            (e) =>
              e.updatedByName ||
              e.updatedBy?.username ||
              'Unknown'
          )
        ),
      ].sort(),
    [history]
  );

  // Client-side date filtering on current page
  const filteredByDate = useMemo(() => {
    return history.filter(entry => {
      const ts = new Date(entry.timestamp);
      if (dateFrom && ts < new Date(dateFrom)) return false;
      if (dateTo   && ts > new Date(dateTo + 'T23:59:59')) return false;
      return true;
    });
  }, [history, dateFrom, dateTo]);

  // Client-side sort on top of date-filtered data
  const displayHistory = useMemo(() => {
    if (!sortConfig.key) return filteredByDate;
    return [...filteredByDate].sort((a, b) => {
      let va, vb;
      switch (sortConfig.key) {
        case 'action':    va = a.action || '';                                  vb = b.action || '';                                  break;
        case 'article':   va = a.product?.article || '';                       vb = b.product?.article || '';                       break;
        case 'cartons':   va = a.quantityChanged ?? 0;                         vb = b.quantityChanged ?? 0;                         break;
        case 'timestamp': va = new Date(a.timestamp).getTime();                vb = new Date(b.timestamp).getTime();                break;
        case 'updatedBy': va = a.updatedByName || a.updatedBy?.username || ''; vb = b.updatedByName || b.updatedBy?.username || ''; break;
        default:          va = 0; vb = 0;
      }
      const cmp = typeof va === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortConfig.dir === 'asc' ? cmp : -cmp;
    });
  }, [filteredByDate, sortConfig]);

  // delete
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '⚠ WARNING: Are you sure you want to delete this entry? This will revert stock changes and cannot be undone.'
      )
    )
      return;

    const prev = history;
    setHistory(prev.filter((item) => item._id !== id));

    try {
      const result = await api.delete(`/history/${id}`);
      if (result.data.success) {
        toast.success('Entry deleted successfully.');
        fetchHistory(page);
      } else {
        toast.error(
          'Failed to delete: ' +
            (result.data.error || 'Unknown error')
        );
        setHistory(prev);
      }
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(
        'Error deleting entry: ' +
          (err.response?.data?.error || err.message)
      );
      setHistory(prev);
    }
  };

  // permanent delete — only for ADD/UPDATE, disabled for CHALLAN_OUT
  const handlePermanentDelete = async (row) => {
    if (!row.product || !row.product.article) {
      toast.error('Permanent delete not possible: product field missing.');
      return;
    }
    if (row.action === 'CHALLAN_OUT') return;

    if (!window.confirm(`🚨 '${row.product.article}' को पूरी तरह delete और सारी संबंधित salary 0 करनी है?`)) return;

    try {
      const result = await api.post('/history/permanent-delete-article', {
        article: row.product.article,
        gender: row.product.gender,
        size: row.product.size,
        color: row.product.color,
      });
      if (result.data.success) {
        toast.success('Article deleted & salaries reset');
        fetchHistory(page);
      } else {
        toast.error(result.data.error || 'Permanent delete failed');
      }
    } catch (err) {
      console.error('Permanent delete error:', err);
      toast.error(err.response?.data?.error || err.message || 'Permanent delete failed');
    }
  };

  const handleExportExcel = async () => {
    try {
      // Fetch all matching records from backend (not just current page)
      const params = { limit: 10000 };
      if (searchTerm)       params.search    = searchTerm;
      if (selectedAction)   params.action    = selectedAction;
      if (selectedUpdatedBy) params.updatedBy = selectedUpdatedBy;
      if (dateFrom)         params.from      = dateFrom;
      if (dateTo)           params.to        = `${dateTo}T23:59:59`;
      const response = await api.get('/history', { params });
      const allRecords = response.data.data || [];

      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Stock History');

      // Set column widths only (no header property — we add header row manually below)
      ws.columns = [
        { width: 16 }, { width: 18 }, { width: 13 }, { width: 8 },
        { width: 14 }, { width: 18 }, { width: 22 }, { width: 26 }, { width: 15 },
      ];

      // Header row as plain array so ExcelJS doesn't conflict with auto-headers
      const hdrRow = ws.addRow([
        'Action', 'Article', 'Color', 'Size', 'Qty Changed',
        'Updated By', 'Timestamp', 'Party / Note', 'Invoice No',
      ]);
      hdrRow.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
      hdrRow.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F172A' } };
      hdrRow.alignment = { horizontal: 'center', vertical: 'middle' };
      hdrRow.height    = 18;

      // Data rows as arrays — avoids key-lookup issues in browser builds
      allRecords.forEach(e => {
        const qty = e.quantityChanged;
        const dataRow = ws.addRow([
          e.action,
          e.product?.article || 'N/A',
          e.product?.color   || 'N/A',
          e.product?.size    || 'N/A',
          qty,
          e.updatedByName || e.updatedBy?.username || 'Unknown',
          new Date(e.timestamp).toLocaleString('en-IN'),
          e.partyName || e.note || '-',
          e.invoiceNo || '-',
        ]);
        // Color qty cell by index (5th column, 1-based)
        if (typeof qty === 'number') {
          dataRow.getCell(5).font = {
            bold: true,
            color: { argb: qty < 0 ? 'FFdc2626' : qty > 0 ? 'FF059669' : 'FF64748b' },
          };
        }
      });

      const buf  = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.style.display = 'none';
      a.href     = url;
      a.download = `history-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 800);
      toast.success('History exported!');
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Export failed. Please try again.');
    }
  };

  const getActionBadgeClass = (action) => {
    switch ((action || '').toUpperCase()) {
      case 'ADD':         return 'hist-badge hist-badge-add';
      case 'UPDATE':      return 'hist-badge hist-badge-update';
      case 'CHALLAN_OUT': return 'hist-badge hist-badge-challan';
      case 'DELETE':      return 'hist-badge hist-badge-delete';
      case 'IMPORT':      return 'hist-badge hist-badge-import';
      default:            return 'hist-badge hist-badge-other';
    }
  };

  if (loading) {
    return (
      <div className="hist-loading">
        <div className="hist-loader-ring" />
        <span style={{ fontSize: '0.9rem' }}>Loading history…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hist-error-box">
        <div style={{ fontSize: '2.8rem', marginBottom: 14 }}>⚠️</div>
        <h4 style={{ color: '#dc2626', marginBottom: 8 }}>Something went wrong</h4>
        <p style={{ color: '#64748b', marginBottom: 24 }}>{error}</p>
        <button
          onClick={() => { setError(null); fetchHistory(1); }}
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="hist-page">

      {/* ── Page Header ── */}
      <div className="hist-header">
        <div className="container-fluid" style={{ padding: '0 24px' }}>
          <div className="hist-header-inner">
            <div>
              <h1 className="hist-title">🕐 History &amp; Audit Trail</h1>
              <p className="hist-sub">Complete record of all stock movements</p>
            </div>
            <Link to="/party-summary" className="hist-party-btn">
              👥 Party Summary
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="hist-body container-fluid">
        <div className="hist-card">

          {/* Toolbar */}
          <div className="hist-toolbar">
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <input
                ref={searchRef}
                type="text"
                className="hist-search"
                placeholder="Search article, color, size, note…"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <span className="search-shortcut-hint" title="Press / to focus">/</span>
              <button className="hist-find-btn" onClick={handleFindArticlePage}>
                🔍 Find Page
              </button>
              <select className="hist-select" value={selectedAction} onChange={handleActionChange}>
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
              <select className="hist-select" value={selectedUpdatedBy} onChange={handleUpdatedByChange}>
                <option value="">All Updated By</option>
                {uniqueUpdatedBy.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>

            {/* Date range + Export */}
            <div className="hist-date-row">
              <span className="hist-date-label">📅 From:</span>
              <input
                type="date"
                className="hist-date-input"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
              <span className="hist-date-label">To:</span>
              <input
                type="date"
                className="hist-date-input"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
              {(dateFrom || dateTo) && (
                <button className="hist-clear-date-btn" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  ✕ Clear
                </button>
              )}
              <button className="hist-export-btn" onClick={handleExportExcel} style={{ marginLeft: 'auto' }}>
                📊 Export Excel
              </button>
            </div>
          </div>

          {/* Records info */}
          <div className="hist-records-info">
            Showing {history.length} of {totalCount} records
            &nbsp;·&nbsp; Page {page} / {totalPages}
            {pageLoading && <span style={{ marginLeft: 8, opacity: 0.6 }}>Refreshing…</span>}
          </div>

          {/* Table */}
          <div className="hist-table-wrap">
            <table className="hist-table">
              <thead>
                <tr>
                  {[
                    { key: 'action',    label: 'Action' },
                    { key: 'article',   label: 'Article' },
                  ].map(({ key, label }) => (
                    <th key={key} className="sort-th" onClick={() => handleSort(key)}>
                      {label} <span className="sort-icon">{sortConfig.key === key ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
                    </th>
                  ))}
                  <th>Color</th>
                  <th>Size</th>
                  <th className="sort-th" onClick={() => handleSort('cartons')}>
                    Cartons <span className="sort-icon">{sortConfig.key === 'cartons' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
                  </th>
                  <th className="sort-th" onClick={() => handleSort('updatedBy')}>
                    Updated By <span className="sort-icon">{sortConfig.key === 'updatedBy' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
                  </th>
                  <th className="sort-th" onClick={() => handleSort('timestamp')}>
                    Timestamp <span className="sort-icon">{sortConfig.key === 'timestamp' ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}</span>
                  </th>
                  <th>Note / Party</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                {displayHistory.length === 0 ? (
                  <tr>
                    <td colSpan="9">
                      <div className="prod-empty">
                        <span className="prod-empty-icon">📭</span>
                        <h5 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>
                          {searchTerm || selectedAction || selectedUpdatedBy || dateFrom || dateTo
                            ? 'No matching records found'
                            : 'No history records yet'}
                        </h5>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayHistory.map(entry => (
                    <tr key={entry._id}>
                      <td>
                        <span className={getActionBadgeClass(entry.action)}>
                          {entry.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>
                        {entry.product?.article || 'N/A'}
                      </td>
                      <td>{entry.product?.color || 'N/A'}</td>
                      <td>{entry.product?.size || 'N/A'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`qty-badge ${entry.quantityChanged > 0 ? 'qty-pos' : entry.quantityChanged < 0 ? 'qty-neg' : 'qty-zero'}`}>
                          {entry.quantityChanged > 0 ? '+' : ''}{entry.quantityChanged}
                        </span>
                      </td>
                      <td style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {entry.updatedByName || entry.updatedBy?.username || 'Unknown'}
                      </td>
                      <td style={{ fontSize: '0.79rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </td>
                      <td style={{ maxWidth: 160, fontSize: '0.82rem' }}>
                        {entry.partyName ? (
                          <>
                            <strong>Party:</strong>{' '}
                            <Link
                              to={`/party-summary?party=${encodeURIComponent(entry.partyName)}`}
                              style={{ color: '#6366f1' }}
                            >
                              {entry.partyName}
                            </Link>
                            <br />
                            <strong>Invoice:</strong> {entry.invoiceNo || '-'}
                          </>
                        ) : (entry.note || '-')}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {/* Edit */}
                        {entry.action === 'ADD' || entry.action === 'UPDATE' ? (
                          <Link
                            to={entry.salaryEntryId ? `/salary-entry/edit/${entry.salaryEntryId}` : '#'}
                            className={`hist-op-btn hist-op-edit ${!entry.salaryEntryId ? 'hist-op-disabled' : ''}`}
                            onClick={e => {
                              if (!entry.salaryEntryId) {
                                e.preventDefault();
                                toast.error('Salary entry ID missing. Cannot edit old entries.');
                              }
                            }}
                          >
                            ✏️ Edit
                          </Link>
                        ) : entry.action === 'CHALLAN_OUT' ? (
                          <Link
                            to={entry.challanId ? `/challan-out/edit/${entry.challanId}` : '#'}
                            className={`hist-op-btn hist-op-edit ${!entry.challanId ? 'hist-op-disabled' : ''}`}
                            onClick={e => {
                              if (!entry.challanId) {
                                e.preventDefault();
                                toast.error('Challan ID missing. Please run migration or contact admin.');
                              }
                            }}
                          >
                            ✏️ Edit
                          </Link>
                        ) : (
                          <span className="hist-op-btn hist-op-edit hist-op-disabled">✏️ Edit</span>
                        )}

                        {/* Delete */}
                        <button
                          className={`hist-op-btn hist-op-delete ${entry.action !== 'CHALLAN_OUT' ? 'hist-op-disabled' : ''}`}
                          onClick={() => { if (entry.action === 'CHALLAN_OUT') handleDelete(entry._id); }}
                          disabled={entry.action !== 'CHALLAN_OUT'}
                          title={entry.action !== 'CHALLAN_OUT' ? 'Only CHALLAN_OUT entries can be deleted' : 'Delete & revert stock'}
                        >
                          🗑️ Delete
                        </button>

                        {/* Permanent Delete */}
                        <button
                          className={`hist-op-btn hist-op-perm ${entry.action === 'CHALLAN_OUT' ? 'hist-op-disabled' : ''}`}
                          disabled={entry.action === 'CHALLAN_OUT'}
                          title={entry.action === 'CHALLAN_OUT' ? 'Use Delete for Challan OUT' : 'Permanently remove article'}
                          onClick={() => handlePermanentDelete(entry)}
                        >
                          ☠️ Perm Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="hist-pagination">
            <button
              className="hist-pag-btn"
              disabled={page <= 1 || pageLoading}
              onClick={() => fetchHistory(page - 1)}
            >
              ← Previous
            </button>
            <span className="hist-pag-info">
              Page {page} of {totalPages}
            </span>
            <button
              className="hist-pag-btn"
              disabled={page >= totalPages || pageLoading}
              onClick={() => fetchHistory(page + 1)}
            >
              Next →
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HistoryTable;
