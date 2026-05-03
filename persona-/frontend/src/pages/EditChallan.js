// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FaPlus, FaTrash, FaSave, FaTimes, FaSpinner, FaFilePdf, FaImages } from 'react-icons/fa';
// import { createPortal } from 'react-dom';
// import api from '../utils/api';
// import './ChallanForm.css';

// // Local helper for suggestions
// function SuggestionPortal({ anchorEl, children }) {
//   if (!anchorEl) return null;
//   const rect = anchorEl.getBoundingClientRect();
//   const style = {
//     position: 'absolute',
//     top: rect.bottom + window.scrollY,
//     left: rect.left + window.scrollX,
//     width: rect.width,
//     maxHeight: 240,
//     overflowY: 'auto',
//     zIndex: 10000,
//     background: '#fff',
//     border: '1px solid #ddd',
//     borderRadius: 8,
//     boxShadow: '0 8px 20px rgba(0,0,0,.15)'
//   };
//   return createPortal(<div style={style}>{children}</div>, document.body);
// }

// const EditChallan = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
  
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [updateSuccess, setUpdateSuccess] = useState(false); // ✅ New state
//   const [downloadingPDF, setDownloadingPDF] = useState(false);
//   const [downloadingProductsPDF, setDownloadingProductsPDF] = useState(false);
//   const [articleVariants, setArticleVariants] = useState({});
//   const [loadingVariants, setLoadingVariants] = useState({});
//   const [stockAvailability, setStockAvailability] = useState({});

//   const articleInputRefs = useRef({});

//   const [formData, setFormData] = useState({
//     partyName: '',
//     date: '',
//     invoiceNo: '',
//     station: '',
//     transport: '',
//     marka: '',
//     items: []
//   });

//   // ✅ Fetch existing challan data
//   useEffect(() => {
//     const fetchChallan = async () => {
//       try {
//         const res = await api.get(`/challans/${id}`);
        
//         if (res.data.success) {
//           const challan = res.data.data;
//           setFormData({
//             partyName: challan.partyName || '',
//             date: challan.date ? new Date(challan.date).toISOString().split('T')[0] : '',
//             invoiceNo: challan.invoiceNo || '',
//             station: challan.station || '',
//             transport: challan.transport || '',
//             marka: challan.marka || '',
//             items: challan.items.map(item => ({
//               article: item.article || '',
//               size: item.size || '',
//               color: item.color || '',
//               cartons: item.cartons || 0,
//               pairPerCarton: item.pairPerCarton || 0,
//               rate: item.rate || 0,
//               totalPair: item.totalPair || 0,
//               amount: item.amount || 0
//             }))
//           });

//           // Fetch variants and stock for each item
//           challan.items.forEach((item, index) => {
//             if (item.article) {
//               fetchArticleVariants(item.article, index, false);
//               fetchStockAvailability(item.article, item.size, item.color, index);
//             }
//           });
//         } else {
//           toast.error('Challan not found');
//           navigate('/history');
//         }
//       } catch (err) {
//         console.error('Fetch challan error:', err);
//         toast.error(err.response?.data?.error || 'Failed to load challan');
//         navigate('/history');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchChallan();
//   }, [id, navigate]);

//   const debounce = (func, delay) => {
//     let t;
//     return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), delay); };
//   };

//   const fetchArticleVariants = async (article, index, isBlur = false) => {
//     if (!article.trim()) { 
//       setArticleVariants(p => ({ ...p, [index]: [] })); 
//       return; 
//     }
//     setLoadingVariants(p => ({ ...p, [index]: true }));
//     try {
//       const response = await api.get(`/challans/article/${article}/variants`);
//       setArticleVariants(p => ({ ...p, [index]: response.data.data }));
//       if (response.data.data.length === 0 && isBlur) {
//         toast.warning(`"${article}" article not found in database`, { autoClose: 3000, position: 'top-center' });
//       }
//     } catch (err) {
//       if (isBlur) toast.error(err.response?.data?.error || `"${article}" not found`, { autoClose: 3000, position: 'top-center' });
//       setArticleVariants(p => ({ ...p, [index]: [] }));
//     } finally {
//       setLoadingVariants(p => ({ ...p, [index]: false }));
//     }
//   };

//   const debouncedFetch = debounce(fetchArticleVariants, 500);

//   const fetchStockAvailability = async (article, size, color, index) => {
//     if (!article || !size || !color) return;
//     try {
//       const res = await api.get('/challans/stock-available', {
//         params: { 
//           article: article.trim().toUpperCase(), 
//           size: size.trim(), 
//           color: color.trim().toUpperCase() 
//         }
//       });
//       setStockAvailability(p => ({ ...p, [index]: res.data.availableCartons || 0 }));
//     } catch {
//       setStockAvailability(p => ({ ...p, [index]: 0 }));
//     }
//   };

//   const handleItemChange = (index, e) => {
//   const { name, value } = e.target;
//   const newItems = [...formData.items];

//   if (name === 'article' || name === 'color') {
//     newItems[index][name] = value.toUpperCase();
//   } else {
//     newItems[index][name] = name === 'cartons' || name === 'rate' ? parseFloat(value) || 0 : value;
//   }

//   if (name === 'article') {
//     debouncedFetch(value, index);
//     newItems[index].size = '';
//     newItems[index].color = '';
//     newItems[index].pairPerCarton = 0;
//     newItems[index].rate = 0;
//   }

//   if (name === 'size') {
//     newItems[index].color = '';
//     const variants = articleVariants[index] || [];
//     const sizeVariants = variants.filter(v => v.size === value);
//     if (sizeVariants.length === 1) {
//       newItems[index].color = sizeVariants[0].color;
//       newItems[index].pairPerCarton = sizeVariants[0].pairPerCarton;
//       newItems[index].rate = sizeVariants[0].rate;
//     }
//   }

//   if (name === 'color') {
//     const variants = articleVariants[index] || [];
//     const selectedVariant = variants.find(v => v.size === newItems[index].size && v.color === value);
//     if (selectedVariant) {
//       newItems[index].pairPerCarton = selectedVariant.pairPerCarton;
//       newItems[index].rate = selectedVariant.rate;
//     }
//   }

//   if (name === 'article' || name === 'size' || name === 'color') {
//     const { article, size, color } = newItems[index];
//     fetchStockAvailability(
//       (article || '').trim().toUpperCase(), 
//       (size || '').trim(), 
//       (color || '').trim().toUpperCase(), 
//       index
//     );
//   }

//   // ✅ VALIDATION: Prevent cartons more than available
//   if (name === 'cartons') {
//     const cartonsVal = parseInt(value) || 0;
//     const available = stockAvailability[index] ?? 0;
    
//     // Negative check
//     if (cartonsVal < 0) { 
//       toast.warning('Cartons negative नहीं हो सकते', { 
//         position: 'top-center',
//         autoClose: 3000 
//       }); 
//       return; 
//     }
    
//     // ✅ Available se zyada check (only if stock data is available)
//     if (available > 0 && cartonsVal > available) { 
//       toast.warning(`Available से ज्यादा cartons नहीं डाल सकते! Available: ${available}`, { 
//         position: 'top-center',
//         autoClose: 4000 
//       }); 
//       return; 
//     }
    
//     newItems[index].cartons = cartonsVal;
//   }

//   newItems[index].totalPair = newItems[index].cartons * newItems[index].pairPerCarton;
//   newItems[index].amount = newItems[index].totalPair * newItems[index].rate;

//   setFormData(prev => ({ ...prev, items: newItems }));
// };


//   const addItemRow = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, { 
//         article: '', 
//         size: '', 
//         color: '', 
//         cartons: '', 
//         pairPerCarton: 0, 
//         rate: 0, 
//         totalPair: 0, 
//         amount: 0 
//       }]
//     }));
//   };

//   const removeItemRow = (index) => {
//     if (formData.items.length > 1) {
//       const newItems = formData.items.filter((_, i) => i !== index);
//       setFormData(prev => ({ ...prev, items: newItems }));
//       const nv = { ...articleVariants }; delete nv[index]; setArticleVariants(nv);
//       const ns = { ...stockAvailability }; delete ns[index]; setStockAvailability(ns);
//     }
//   };

//   const calculateTotals = () => formData.items.reduce((acc, item) => ({
//     totalCartons: acc.totalCartons + (parseInt(item.cartons) || 0),
//     totalPairs: acc.totalPairs + (item.totalPair || 0),
//     totalAmount: acc.totalAmount + (item.amount || 0)
//   }), { totalCartons: 0, totalPairs: 0, totalAmount: 0 });

//   // ✅ PDF Download Functions
//   const downloadChallanPDF = async (challanId, invoiceNo) => {
//     setDownloadingPDF(true);
//     try {
//       const pdfResponse = await api.get(`/challan-pdf/${challanId}`, { 
//         responseType: 'blob', 
//         timeout: 45000, 
//         headers: { 'Accept': 'application/pdf' } 
//       });
      
//       if (!pdfResponse.data || pdfResponse.data.size < 1024) {
//         throw new Error('Invalid PDF received from server');
//       }
      
//       const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
//       const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url; 
//       a.download = `challan-${safeInvoiceNo}.pdf`;
//       document.body.appendChild(a); 
//       a.click(); 
//       document.body.removeChild(a); 
//       window.URL.revokeObjectURL(url);
      
//       toast.success('Challan PDF downloaded successfully!');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.status === 404 ? 'PDF generation service unavailable' : 'Challan PDF download failed: ' + err.message);
//     } finally { 
//       setDownloadingPDF(false); 
//     }
//   };

//   const downloadProductsPDF = async (challanId, invoiceNo) => {
//     setDownloadingProductsPDF(true);
//     try {
//       const pdfResponse = await api.get(`/challan-pdf/${challanId}/products`, { 
//         responseType: 'blob', 
//         timeout: 60000, 
//         headers: { 'Accept': 'application/pdf' } 
//       });
      
//       if (!pdfResponse.data || pdfResponse.data.size < 1024) {
//         throw new Error('Invalid products PDF received from server');
//       }
      
//       const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
//       const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url; 
//       a.download = `challan-products-${safeInvoiceNo}.pdf`;
//       document.body.appendChild(a); 
//       a.click();
      
//       setTimeout(() => { 
//         document.body.removeChild(a); 
//         window.URL.revokeObjectURL(url); 
//       }, 100);
      
//       toast.success('Products PDF downloaded successfully!');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.status === 404 ? 'Products not found for this challan' : 'Products PDF download failed: ' + err.message);
//     } finally { 
//       setDownloadingProductsPDF(false); 
//     }
//   };

//   // ✅ UPDATED SUBMIT HANDLER - NO NAVIGATION
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);

//     try {
//       if (!formData.partyName || !formData.station || !formData.transport) {
//         throw new Error('Please fill all required fields');
//       }

//       for (let item of formData.items) {
//         if (!item.article || !item.size || !item.color || !item.cartons || item.cartons === 0 || !item.rate) {
//           throw new Error('Please fill all item details');
//         }
//       }

//       const payload = {
//         ...formData,
//         items: formData.items.map(item => ({
//           article: item.article.toUpperCase(),
//           color: item.color.toUpperCase(),
//           size: item.size,
//           cartons: Number(item.cartons),
//           pairPerCarton: Number(item.pairPerCarton),
//           rate: Number(item.rate),
//           totalPair: Number(item.cartons) * Number(item.pairPerCarton),
//           amount: Number(item.cartons) * Number(item.pairPerCarton) * Number(item.rate)
//         }))
//       };

//       const response = await api.put(`/challans/${id}`, payload);

//       if (!response.data.success) {
//         throw new Error(response.data.error || 'Failed to update challan');
//       }

//       toast.success('Challan updated successfully! 🎉', {
//         autoClose: 3000,
//         position: 'top-center'
//       });
      
//       // ✅ Show success banner
//       setUpdateSuccess(true);
      
//       // ✅ Auto-hide banner after 10 seconds
//       setTimeout(() => setUpdateSuccess(false), 10000);

//       // ✅ Auto-download both PDFs after successful update
//       try {
//         await downloadChallanPDF(id, formData.invoiceNo);
//         await downloadProductsPDF(id, formData.invoiceNo);
//       } catch (err) {
//         toast.warning('Challan updated but PDF auto-download failed');
//       }

//       // ✅ NO NAVIGATION - Stay on page for further edits or downloads

//     } catch (err) {
//       toast.error(err.response?.data?.error || err.message, {
//         position: 'top-center',
//         autoClose: 5000
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totals = calculateTotals();

//   const [articleSuggestions, setArticleSuggestions] = useState({});
//   const [showArticleDropdown, setShowArticleDropdown] = useState({});
  
//   const fetchArticleSuggestions = async (search, index) => {
//     if (!search) { 
//       setArticleSuggestions(p => ({ ...p, [index]: [] })); 
//       return; 
//     }
//     try {
//       const res = await api.get(`/challans/article-suggestions?search=${search}`);
//       setArticleSuggestions(p => ({ ...p, [index]: res.data.data }));
//       setShowArticleDropdown(p => ({ ...p, [index]: true }));
//     } catch (err) { 
//       console.error(err); 
//     }
//   };

//   if (loading) {
//     return (
//       <div className="challan-wrapper min-vh-100 d-flex justify-content-center align-items-center">
//         <div className="text-center">
//           <FaSpinner className="fa-spin fs-1 text-primary mb-3" />
//           <p className="text-muted">Loading challan data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="challan-wrapper">
//       <div className="container mt-4">
//         {/* ✅ Header with PDF download buttons */}
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <div>
//             <h2 className="text-primary mb-1">
//               <FaFilePdf className="me-2" />Edit Challan
//             </h2>
//             <p className="text-muted mb-0">
//               Update challan details (Invoice: {formData.invoiceNo})
//             </p>
//           </div>

//           {/* ✅ PDF Download Buttons (Top Right) */}
//           <div className="pdf-actions">
//             <div className="btn-group" role="group">
//               <button 
//                 type="button" 
//                 className="btn btn-outline-primary" 
//                 onClick={() => downloadChallanPDF(id, formData.invoiceNo)} 
//                 disabled={downloadingPDF}
//               >
//                 {downloadingPDF ? (
//                   <><FaSpinner className="fa-spin me-1" />Downloading...</>
//                 ) : (
//                   <><FaFilePdf className="me-1" />Download Challan PDF</>
//                 )}
//               </button>
//               <button 
//                 type="button" 
//                 className="btn btn-outline-success" 
//                 onClick={() => downloadProductsPDF(id, formData.invoiceNo)} 
//                 disabled={downloadingProductsPDF}
//               >
//                 {downloadingProductsPDF ? (
//                   <><FaSpinner className="fa-spin me-1" />Downloading...</>
//                 ) : (
//                   <><FaImages className="me-1" />Download Products PDF</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit}>
//           {/* Party Information */}
//           <div className="card mb-4 shadow-sm">
//             <div className="card-header bg-light">
//               <h5 className="mb-0 text-dark">📋 Party Information</h5>
//             </div>
//             <div className="card-body">
//               <div className="row g-3">
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Party Name *</label>
//                   <input 
//                     type="text" 
//                     className="form-control" 
//                     value={formData.partyName}
//                     onChange={(e) => setFormData(p => ({ ...p, partyName: e.target.value.toUpperCase() }))}
//                     placeholder="Enter party name" 
//                     required 
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Invoice No *</label>
//                   <input 
//                     type="text" 
//                     className="form-control bg-light" 
//                     value={formData.invoiceNo} 
//                     readOnly 
//                   />
//                   <small className="text-muted">Cannot be changed</small>
//                 </div>
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Date *</label>
//                   <input 
//                     type="date" 
//                     className="form-control" 
//                     value={formData.date}
//                     onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))}
//                     required 
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product Items */}
//           <div className="card mb-4 shadow-sm">
//             <div className="card-header bg-light d-flex justify-content-between align-items-center">
//               <h5 className="mb-0 text-dark">📦 Product Items</h5>
//               <button 
//                 type="button" 
//                 className="btn btn-primary btn-sm" 
//                 onClick={addItemRow}
//               >
//                 <FaPlus className="me-1" /> Add Item
//               </button>
//             </div>
//             <div className="card-body p-0">
//               <div className="table-responsive">
//                 <table className="table table-hover mb-0">
//                   <thead className="table-dark">
//                     <tr>
//                       <th>Article *</th>
//                       <th>Size *</th>
//                       <th>Color *</th>
//                       <th>Cartons *</th>
//                       <th>Pair/Crtn</th>
//                       <th>Rate *</th>
//                       <th>Amount</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {formData.items.map((item, index) => {
//                       const variants = articleVariants[index] || [];
//                       const sizes = [...new Set(variants.map(v => v.size))];
//                       const colors = [...new Set(variants.filter(v => v.size === item.size).map(v => v.color))];
                      
//                       return (
//                         <tr key={index} className={index % 2 === 0 ? 'table-light' : ''}>
//                           <td style={{ position: "relative", minWidth: "180px" }}>
//                             <input
//                               ref={(el) => (articleInputRefs.current[index] = el)}
//                               type="text" 
//                               className="form-control form-control-sm" 
//                               value={item.article}
//                               onChange={(e) => { 
//                                 handleItemChange(index, e); 
//                                 fetchArticleSuggestions(e.target.value.toUpperCase(), index); 
//                               }}
//                               onBlur={() => setTimeout(() => setShowArticleDropdown(prev => ({ ...prev, [index]: false })), 200)}
//                               onFocus={() => { 
//                                 if (articleSuggestions[index]?.length) {
//                                   setShowArticleDropdown(prev => ({ ...prev, [index]: true })); 
//                                 }
//                               }}
//                               name="article" 
//                               placeholder="Enter article" 
//                               autoComplete="off" 
//                               required
//                             />
//                             {showArticleDropdown[index] && articleSuggestions[index]?.length > 0 && (
//                               <SuggestionPortal anchorEl={articleInputRefs.current[index]}>
//                                 <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
//                                   {articleSuggestions[index].map((art, i) => (
//                                     <li 
//                                       key={i}
//                                       onMouseDown={() => {
//                                         const ev = { target: { name: "article", value: art } };
//                                         handleItemChange(index, ev);
//                                         setShowArticleDropdown(prev => ({ ...prev, [index]: false }));
//                                         fetchArticleVariants(art, index, true);
//                                       }}
//                                       style={{ 
//                                         padding: "10px 12px", 
//                                         cursor: "pointer", 
//                                         borderBottom: i < articleSuggestions[index].length - 1 ? "1px solid #f0f0f0" : "none" 
//                                       }}
//                                       onMouseOver={e => e.currentTarget.style.background = "#f8f9fa"}
//                                       onMouseOut={e => e.currentTarget.style.background = "#fff"}
//                                     >
//                                       {art}
//                                     </li>
//                                   ))}
//                                 </ul>
//                               </SuggestionPortal>
//                             )}
//                             {loadingVariants[index] && (
//                               <small className="text-info">
//                                 <FaSpinner className="fa-spin me-1" />Loading...
//                               </small>
//                             )}
//                           </td>

//                           <td>
//                             <select 
//                               className="form-select form-select-sm" 
//                               value={item.size} 
//                               onChange={(e) => handleItemChange(index, e)} 
//                               name="size" 
//                               required 
//                               disabled={!variants.length}
//                             >
//                               <option value="">Select Size</option>
//                               {sizes.map(size => (
//                                 <option key={size} value={size}>{size}</option>
//                               ))}
//                             </select>
//                           </td>

//                           <td>
//                             <select 
//                               className="form-select form-select-sm" 
//                               value={item.color} 
//                               onChange={(e) => handleItemChange(index, e)} 
//                               name="color" 
//                               required 
//                               disabled={!item.size}
//                             >
//                               <option value="">Select Color</option>
//                               {colors.map(color => (
//                                 <option key={color} value={color}>{color}</option>
//                               ))}
//                             </select>
//                           </td>

//                           <td>
//                             <input 
//                               type="number" 
//                               className="form-control form-control-sm" 
//                               value={item.cartons} 
//                               onChange={(e) => handleItemChange(index, e)} 
//                               name="cartons" 
//                               min="0" 
//                               required 
//                               style={{ maxWidth: "80px" }} 
//                             />
//                             <small className={`text-${stockAvailability[index] > 0 ? 'success' : 'muted'}`}>
//                               Avail: {stockAvailability[index] ?? '-'}
//                             </small>
//                           </td>

//                           <td>
//                             <input 
//                               type="number" 
//                               className="form-control form-control-sm bg-light" 
//                               value={item.pairPerCarton} 
//                               readOnly 
//                               style={{ maxWidth: "80px" }} 
//                             />
//                           </td>

//                           <td>
//                             <input 
//                               type="number" 
//                               className="form-control form-control-sm" 
//                               value={item.rate} 
//                               onChange={(e) => handleItemChange(index, e)} 
//                               name="rate" 
//                               step="0.01" 
//                               min="0" 
//                               required 
//                               style={{ maxWidth: "100px" }} 
//                             />
//                           </td>

//                           <td>
//                             <input 
//                               type="text" 
//                               className="form-control form-control-sm bg-light fw-bold" 
//                               value={`₹${item.amount.toFixed(2)}`} 
//                               readOnly 
//                               style={{ maxWidth: "120px" }} 
//                             />
//                           </td>

//                           <td>
//                             <button 
//                               type="button" 
//                               className="btn btn-danger btn-sm" 
//                               onClick={() => removeItemRow(index)} 
//                               disabled={formData.items.length === 1}
//                               title="Remove item"
//                             >
//                               <FaTrash />
//                             </button>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Transport Details */}
//           <div className="card mb-4 shadow-sm">
//             <div className="card-header bg-light">
//               <h5 className="mb-0 text-dark">🚛 Transport Details</h5>
//             </div>
//             <div className="card-body">
//               <div className="row g-3">
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Station *</label>
//                   <input 
//                     type="text" 
//                     className="form-control" 
//                     value={formData.station} 
//                     onChange={(e) => setFormData(p => ({ ...p, station: e.target.value }))} 
//                     placeholder="Enter station" 
//                     required 
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Transport *</label>
//                   <input 
//                     type="text" 
//                     className="form-control" 
//                     value={formData.transport} 
//                     onChange={(e) => setFormData(p => ({ ...p, transport: e.target.value }))} 
//                     placeholder="Enter transport name" 
//                     required 
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <label className="form-label fw-bold">Marka</label>
//                   <input 
//                     type="text" 
//                     className="form-control" 
//                     value={formData.marka} 
//                     onChange={(e) => setFormData(p => ({ ...p, marka: e.target.value }))} 
//                     placeholder="Enter marka (optional)" 
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Updated Summary */}
//           <div className="card mb-4 shadow-sm border-primary">
//             <div className="card-header bg-primary text-white">
//               <h5 className="mb-0">📊 Updated Summary</h5>
//             </div>
//             <div className="card-body">
//               <div className="row text-center">
//                 <div className="col-md-4">
//                   <h3 className="text-primary mb-1">{totals.totalCartons}</h3>
//                   <p className="text-muted mb-0">Total Cartons</p>
//                 </div>
//                 <div className="col-md-4">
//                   <h3 className="text-info mb-1">{totals.totalPairs}</h3>
//                   <p className="text-muted mb-0">Total Pairs</p>
//                 </div>
//                 <div className="col-md-4">
//                   <h3 className="text-success mb-1">₹{totals.totalAmount.toFixed(2)}</h3>
//                   <p className="text-muted mb-0">Total Amount</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ✅ Action Buttons */}
//           <div className="d-flex justify-content-between align-items-center">
//             <button 
//               type="button" 
//               className="btn btn-outline-secondary btn-lg" 
//               onClick={() => navigate('/history')} 
//               disabled={saving}
//             >
//               <FaTimes className="me-2" /> Cancel
//             </button>
            
//             <div className="d-flex gap-2">
//               {/* ✅ Manual PDF download buttons */}
//               {!saving && (
//                 <>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline-primary" 
//                     onClick={() => downloadChallanPDF(id, formData.invoiceNo)} 
//                     disabled={downloadingPDF}
//                   >
//                     {downloadingPDF ? (
//                       <><FaSpinner className="fa-spin me-1" />Downloading...</>
//                     ) : (
//                       <><FaFilePdf className="me-1" />Download Challan</>
//                     )}
//                   </button>
//                   <button 
//                     type="button" 
//                     className="btn btn-outline-success" 
//                     onClick={() => downloadProductsPDF(id, formData.invoiceNo)} 
//                     disabled={downloadingProductsPDF}
//                   >
//                     {downloadingProductsPDF ? (
//                       <><FaSpinner className="fa-spin me-1" />Downloading...</>
//                     ) : (
//                       <><FaImages className="me-1" />Download Products</>
//                     )}
//                   </button>
//                 </>
//               )}

//               <button 
//                 type="submit" 
//                 className="btn btn-primary btn-lg px-4" 
//                 disabled={saving}
//               >
//                 {saving ? (
//                   <><FaSpinner className="fa-spin me-2" />Updating...</>
//                 ) : (
//                   <><FaSave className="me-2" />Update Challan</>
//                 )}
//               </button>
//             </div>
//           </div>
//         </form>

//         {/* ✅ Success Banner */}
//         {updateSuccess && (
//           <div className="alert alert-success mt-4 shadow-lg" role="alert">
//             <div className="d-flex justify-content-between align-items-center">
//               <div className="d-flex align-items-center">
//                 <div className="me-3">
//                   <i className="fas fa-check-circle fa-2x text-success"></i>
//                 </div>
//                 <div>
//                   <h6 className="alert-heading mb-1 fw-bold">
//                     ✅ Challan Updated Successfully!
//                   </h6>
//                   <p className="mb-0">
//                     Invoice <strong className="text-primary">#{formData.invoiceNo}</strong> has been updated successfully. 
//                     Both PDFs have been downloaded automatically. You can download them again using the buttons above or continue editing.
//                   </p>
//                 </div>
//               </div>
//               <button 
//                 type="button" 
//                 className="btn-close" 
//                 onClick={() => setUpdateSuccess(false)}
//                 aria-label="Close"
//               ></button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EditChallan;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaTimes,
  FaSpinner,
  FaFilePdf,
  FaImages,
 // FaExclamationTriangle,
} from 'react-icons/fa';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import './ChallanForm.css';

// Local helper for suggestions
function SuggestionPortal({ anchorEl, children }) {
  if (!anchorEl) return null;
  const rect = anchorEl.getBoundingClientRect();
  const style = {
    position: 'absolute',
    top: rect.bottom + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    maxHeight: 240,
    overflowY: 'auto',
    zIndex: 10000,
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 8,
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
  };
  return createPortal(<div style={style}>{children}</div>, document.body);
}

const EditChallan = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingProductsPDF, setDownloadingProductsPDF] = useState(false);
  const [articleVariants, setArticleVariants] = useState({});
  const [loadingVariants, setLoadingVariants] = useState({});
  const [stockAvailability, setStockAvailability] = useState({});
  const [originalCartons, setOriginalCartons] = useState({}); // Track original cartons

  const articleInputRefs = useRef({});

  const [formData, setFormData] = useState({
    partyName: '',
    date: '',
    invoiceNo: '',
    station: '',
    transport: '',
    marka: '',
    items: [],
  });

  // Fetch existing challan data
  useEffect(() => {
    const fetchChallan = async () => {
      try {
        const res = await api.get(`/challans/${id}`);

        if (res.data.success) {
          const challan = res.data.data;
          const itemsWithOriginal = challan.items.map((item) => ({
            article: item.article || '',
            size: item.size || '',
            color: item.color || '',
            cartons: item.cartons || 0,
            pairPerCarton: item.pairPerCarton || 0,
            rate: item.rate || 0,
            totalPair: item.totalPair || 0,
            amount: item.amount || 0,
          }));

          setFormData({
            partyName: challan.partyName || '',
            date: challan.date
              ? new Date(challan.date).toISOString().split('T')[0]
              : '',
            invoiceNo: challan.invoiceNo || '',
            station: challan.station || '',
            transport: challan.transport || '',
            marka: challan.marka || '',
            items: itemsWithOriginal,
          });

          // Store original cartons for each item
          const original = {};
          challan.items.forEach((item, index) => {
            original[index] = item.cartons || 0;
            if (item.article) {
              fetchArticleVariants(item.article, index, false);
              fetchStockAvailability(item.article, item.size, item.color, index);
            }
          });
          setOriginalCartons(original);
        } else {
          toast.error('Challan not found');
          navigate('/history');
        }
      } catch (err) {
        console.error('Fetch challan error:', err);
        toast.error(err.response?.data?.error || 'Failed to load challan');
        navigate('/history');
      } finally {
        setLoading(false);
      }
    };

    fetchChallan();
  }, [id, navigate]);
// ⌨️ Keyboard Shortcuts (Update + Products PDF)
useEffect(() => {
  const handleShortcutKeys = (e) => {
    // CTRL + S → Update Challan
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();

      if (saving) return;

      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }

      toast.info('💾 Challan update ho raha hai (Ctrl + S)', {
        position: 'top-center',
        autoClose: 1500
      });
    }

    // CTRL + P → Download Products PDF
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();

      if (downloadingProductsPDF) return;

      downloadProductsPDF(id, formData.invoiceNo);
    }
  };

  document.addEventListener('keydown', handleShortcutKeys);
  return () => document.removeEventListener('keydown', handleShortcutKeys);
}, [saving, downloadingProductsPDF, id, formData.invoiceNo]);

  const debounce = (func, delay) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => func(...args), delay);
    };
  };

  const fetchArticleVariants = async (article, index, isBlur = false) => {
    if (!article.trim()) {
      setArticleVariants((p) => ({ ...p, [index]: [] }));
      return;
    }
    setLoadingVariants((p) => ({ ...p, [index]: true }));
    try {
      const response = await api.get(`/challans/article/${article}/variants`);
      setArticleVariants((p) => ({ ...p, [index]: response.data.data }));
      if (response.data.data.length === 0 && isBlur) {
        toast.warning(`"${article}" article not found in database`, {
          autoClose: 3000,
          position: 'top-center',
        });
      }
    } catch (err) {
      if (isBlur) {
        toast.error(err.response?.data?.error || `"${article}" not found`, {
          autoClose: 3000,
          position: 'top-center',
        });
      }
      setArticleVariants((p) => ({ ...p, [index]: [] }));
    } finally {
      setLoadingVariants((p) => ({ ...p, [index]: false }));
    }
  };

  const debouncedFetch = debounce(fetchArticleVariants, 500);

  const fetchStockAvailability = async (article, size, color, index) => {
    if (!article || !size || !color) return;
    try {
      const res = await api.get('/challans/stock-available', {
        params: {
          article: article.trim().toUpperCase(),
          size: size.trim(),
          color: color.trim().toUpperCase(),
        },
      });
      // setStockAvailability((p) => ({
      //   ...p,
      //   [index]: res.data.availableCartons || 0,
      // }));
      setStockAvailability((p) => ({
  ...p,
  [index]: res.data.availableCartons,
}));

if (res.data.warning) {
  toast.warning(res.data.warningMessage, {
    position: 'top-center',
    autoClose: 2500,
  });
}

    } catch {
      //setStockAvailability((p) => ({ ...p, [index]: 0 }));
      setStockAvailability((p) => ({ ...p, [index]: null }));

    }
  };

  // Enhanced cartons validation
  // const validateCartonsChange = (index, newCartons, originalValue) => {
  //   const available = stockAvailability[index] ?? 0;
  //   const currentCartons = parseInt(newCartons, 10) || 0;

  //   // Negative check
  //   if (currentCartons < 0) {
  //     toast.warning('❌ Cartons negative नहीं हो सकते!', {
  //       position: 'top-center',
  //       autoClose: 3000,
  //     });
  //     return false;
  //   }

  //   // Zero stock handling
  //   if (available === 0) {
  //     // Existing item: allow same or less
  //     if (originalValue > 0) {
  //       if (currentCartons > originalValue) {
  //         toast.warning(
  //           `⚠️ Stock 0 hai! Originally ${originalValue} cartons the, usse zyada nahi badha sakte`,
  //           { position: 'top-center', autoClose: 4000 },
  //         );
  //         return false;
  //       }
  //       toast.info(
  //         `ℹ️ Stock ab 0 hai but originally ${originalValue} cartons the, same ya kam kar sakte ho`,
  //         { position: 'top-center', autoClose: 4000 },
  //       );
  //       return true;
  //     }

  //     // New item or originally 0
  //     toast.warning(`❌ Stock Available: 0 | Koi cartons nahi daal sakte!`, {
  //       position: 'top-center',
  //       autoClose: 4000,
  //       icon: <FaExclamationTriangle />,
  //     });
  //     return false;
  //   }

  //   // Normal stock check
  //   if (available > 0 && currentCartons > available) {
  //     toast.warning(
  //       `❌ Available (${available}) se zyada (${currentCartons}) cartons nahi daal sakte!`,
  //       { position: 'top-center', autoClose: 4000 },
  //     );
  //     return false;
  //   }

  //   return true;
  // };
  const validateCartonsChange = (index, newCartons, originalValue) => {
  const available = stockAvailability[index];
  const currentCartons = parseInt(newCartons, 10) || 0;

  if (currentCartons < 0) {
    toast.warning('❌ Cartons negative नहीं हो सकते!', {
      position: 'top-center',
      autoClose: 3000,
    });
    return false; // ❗ negative truly invalid
  }

  if (available === 0 && currentCartons > originalValue) {
    toast.warning(
      `⚠️ Stock 0 hai. Originally ${originalValue} cartons the, stock negative ho jayega`,
      { position: 'top-center', autoClose: 3500 }
    );
    return true;
  }

  if (available < 0) {
    toast.warning(
      `⚠️ Stock already negative hai (${available})`,
      { position: 'top-center', autoClose: 3000 }
    );
    return true;
  }

  if (available >= 0 && currentCartons > available) {
    toast.warning(
      `⚠️ Available ${available} hai, stock negative ho jayega`,
      { position: 'top-center', autoClose: 3000 }
    );
    return true;
  }

  return true;
};


  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    if (name === 'article' || name === 'color') {
      newItems[index][name] = value.toUpperCase();
    } else {
      newItems[index][name] =
        name === 'cartons' || name === 'rate' ? parseFloat(value) || 0 : value;
    }

    if (name === 'article') {
      debouncedFetch(value, index);
      newItems[index].size = '';
      newItems[index].color = '';
      newItems[index].pairPerCarton = 0;
      newItems[index].rate = 0;
    }

    if (name === 'size') {
      newItems[index].color = '';
      const variants = articleVariants[index] || [];
      const sizeVariants = variants.filter((v) => v.size === value);
      if (sizeVariants.length === 1) {
        newItems[index].color = sizeVariants[0].color;
        newItems[index].pairPerCarton = sizeVariants[0].pairPerCarton;
        newItems[index].rate = sizeVariants[0].rate;
      }
    }

    if (name === 'color') {
      const variants = articleVariants[index] || [];
      const selectedVariant = variants.find(
        (v) => v.size === newItems[index].size && v.color === value,
      );
      if (selectedVariant) {
        newItems[index].pairPerCarton = selectedVariant.pairPerCarton;
        newItems[index].rate = selectedVariant.rate;
      }
    }

    if (name === 'article' || name === 'size' || name === 'color') {
      const { article, size, color } = newItems[index];
      fetchStockAvailability(
        (article || '').trim().toUpperCase(),
        (size || '').trim(),
        (color || '').trim().toUpperCase(),
        index,
      );
    }

    // Cartons validation
    if (name === 'cartons') {
      const cartonsVal = parseInt(value, 10) || 0;
      const originalVal = originalCartons[index] || 0;

      if (!validateCartonsChange(index, cartonsVal, originalVal)) {
        return;
      }

      newItems[index].cartons = cartonsVal;
    }

    newItems[index].totalPair =
      newItems[index].cartons * newItems[index].pairPerCarton;
    newItems[index].amount =
      newItems[index].totalPair * newItems[index].rate;

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          article: '',
          size: '',
          color: '',
          cartons: '',
          pairPerCarton: 0,
          rate: 0,
          totalPair: 0,
          amount: 0,
        },
      ],
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, items: newItems }));

      const nv = { ...articleVariants };
      delete nv[index];
      setArticleVariants(nv);

      const ns = { ...stockAvailability };
      delete ns[index];
      setStockAvailability(ns);

      const no = { ...originalCartons };
      delete no[index];
      setOriginalCartons(no);
    }
  };

  const calculateTotals = () =>
    formData.items.reduce(
      (acc, item) => ({
        totalCartons: acc.totalCartons + (parseInt(item.cartons, 10) || 0),
        totalPairs: acc.totalPairs + (item.totalPair || 0),
        totalAmount: acc.totalAmount + (item.amount || 0),
      }),
      { totalCartons: 0, totalPairs: 0, totalAmount: 0 },
    );

  // PDF download functions
  const downloadChallanPDF = async (challanId, invoiceNo) => {
    setDownloadingPDF(true);
    try {
      const pdfResponse = await api.get(`/challan-pdf/${challanId}`, {
        responseType: 'blob',
        timeout: 45000,
        headers: { Accept: 'application/pdf' },
      });

      if (!pdfResponse.data || pdfResponse.data.size < 1024) {
        throw new Error('Invalid PDF received from server');
      }

      const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `challan-${safeInvoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Challan PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.status === 404
          ? 'PDF generation service unavailable'
          : 'Challan PDF download failed: ' + err.message,
      );
    } finally {
      setDownloadingPDF(false);
    }
  };

  const downloadProductsPDF = async (challanId, invoiceNo) => {
    setDownloadingProductsPDF(true);
    try {
      const pdfResponse = await api.get(
        `/challan-pdf/${challanId}/products`,
        {
          responseType: 'blob',
          timeout: 60000,
          headers: { Accept: 'application/pdf' },
        },
      );

      if (!pdfResponse.data || pdfResponse.data.size < 1024) {
        throw new Error('Invalid products PDF received from server');
      }

      const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `challan-products-${safeInvoiceNo}.pdf`;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Products PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.status === 404
          ? 'Products not found for this challan'
          : 'Products PDF download failed: ' + err.message,
      );
    } finally {
      setDownloadingProductsPDF(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (!formData.partyName || !formData.station || !formData.transport) {
        throw new Error('Please fill all required fields');
      }

      for (const item of formData.items) {
        if (
          !item.article ||
          !item.size ||
          !item.color ||
          !item.cartons ||
          item.cartons === 0 ||
          !item.rate
        ) {
          throw new Error('Please fill all item details');
        }
      }
      const hasNegativeStock = Object.values(stockAvailability).some(v => v < 0);

if (hasNegativeStock) {
  toast.warning(
    '⚠️ Kuch items me stock negative ho raha hai, challan update phir bhi ho raha hai',
    { position: 'top-center', autoClose: 3500 }
  );
}


      const payload = {
        ...formData,
        items: formData.items.map((item) => ({
          article: item.article.toUpperCase(),
          color: item.color.toUpperCase(),
          size: item.size,
          cartons: Number(item.cartons),
          pairPerCarton: Number(item.pairPerCarton),
          rate: Number(item.rate),
          totalPair: Number(item.cartons) * Number(item.pairPerCarton),
          amount:
            Number(item.cartons) *
            Number(item.pairPerCarton) *
            Number(item.rate),
        })),
      };

      const response = await api.put(`/challans/${id}`, payload);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update challan');
      }

      toast.success('Challan updated successfully! 🎉', {
        autoClose: 3000,
        position: 'top-center',
      });

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 10000);

      try {
        await downloadChallanPDF(id, formData.invoiceNo);
        await downloadProductsPDF(id, formData.invoiceNo);
      } catch (err) {
        toast.warning('Challan updated but PDF auto-download failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message, {
        position: 'top-center',
        autoClose: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotals();
  const [articleSuggestions, setArticleSuggestions] = useState({});
  const [showArticleDropdown, setShowArticleDropdown] = useState({});

  const fetchArticleSuggestions = async (search, index) => {
    if (!search) {
      setArticleSuggestions((p) => ({ ...p, [index]: [] }));
      return;
    }
    try {
      const res = await api.get(
        `/challans/article-suggestions?search=${search}`,
      );
      setArticleSuggestions((p) => ({ ...p, [index]: res.data.data }));
      setShowArticleDropdown((p) => ({ ...p, [index]: true }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="challan-wrapper min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <FaSpinner className="fa-spin fs-1 text-primary mb-3" />
          <p className="text-muted">Loading challan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="challan-wrapper">
      <div className="container mt-4">
        {/* Header with PDF download buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-primary mb-1">
              <FaFilePdf className="me-2" />
              Edit Challan
            </h2>
            <p className="text-muted mb-0">
              Update challan details (Invoice: {formData.invoiceNo})
            </p>
          </div>

          <div className="pdf-actions">
            <div className="btn-group" role="group">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => downloadChallanPDF(id, formData.invoiceNo)}
                disabled={downloadingPDF}
              >
                {downloadingPDF ? (
                  <>
                    <FaSpinner className="fa-spin me-1" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaFilePdf className="me-1" />
                    Download Challan PDF
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-outline-success"
                onClick={() => downloadProductsPDF(id, formData.invoiceNo)}
                disabled={downloadingProductsPDF}
              >
                {downloadingProductsPDF ? (
                  <>
                    <FaSpinner className="fa-spin me-1" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FaImages className="me-1" />
                    Download Products PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Party Information */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0 text-dark">📋 Party Information</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Party Name *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.partyName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        partyName: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="Enter party name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Invoice No *</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={formData.invoiceNo}
                    readOnly
                  />
                  <small className="text-muted">Cannot be changed</small>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Items */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark">📦 Product Items</h5>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={addItemRow}
              >
                <FaPlus className="me-1" />
                Add Item
              </button>
            </div>
            <div className="challan-items-scroll">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th>Article *</th>
                      <th>Size *</th>
                      <th>Color *</th>
                      <th>Cartons *</th>
                      <th>Pair/Crtn</th>
                      <th>Rate *</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => {
                      const variants = articleVariants[index] || [];
                      const sizes = [...new Set(variants.map((v) => v.size))];
                      const colors = [
                        ...new Set(
                          variants
                            .filter((v) => v.size === item.size)
                            .map((v) => v.color),
                        ),
                      ];
                      const available = stockAvailability[index] ?? 0;

                      return (
                        <tr
                          key={index}
                          className={index % 2 === 0 ? 'table-light' : ''}
                        >
                          <td style={{ position: 'relative', minWidth: '180px' }}>
                            <input
                              ref={(el) =>
                                (articleInputRefs.current[index] = el)
                              }
                              type="text"
                              className="form-control form-control-sm"
                              value={item.article}
                              onChange={(e) => {
                                handleItemChange(index, e);
                                fetchArticleSuggestions(
                                  e.target.value.toUpperCase(),
                                  index,
                                );
                              }}
                              onBlur={() =>
                                setTimeout(
                                  () =>
                                    setShowArticleDropdown((prev) => ({
                                      ...prev,
                                      [index]: false,
                                    })),
                                  200,
                                )
                              }
                              onFocus={() => {
                                if (articleSuggestions[index]?.length) {
                                  setShowArticleDropdown((prev) => ({
                                    ...prev,
                                    [index]: true,
                                  }));
                                }
                              }}
                              name="article"
                              placeholder="Enter article"
                              autoComplete="off"
                              required
                            />
                            {showArticleDropdown[index] &&
                              articleSuggestions[index]?.length > 0 && (
                                <SuggestionPortal
                                  anchorEl={articleInputRefs.current[index]}
                                >
                                  <ul
                                    style={{
                                      listStyle: 'none',
                                      margin: 0,
                                      padding: 0,
                                    }}
                                  >
                                    {articleSuggestions[index].map(
                                      (art, i) => (
                                        <li
                                          key={i}
                                          onMouseDown={() => {
                                            const ev = {
                                              target: {
                                                name: 'article',
                                                value: art,
                                              },
                                            };
                                            handleItemChange(index, ev);
                                            setShowArticleDropdown((prev) => ({
                                              ...prev,
                                              [index]: false,
                                            }));
                                            fetchArticleVariants(
                                              art,
                                              index,
                                              true,
                                            );
                                          }}
                                          style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            borderBottom:
                                              i <
                                              articleSuggestions[index].length -
                                                1
                                                ? '1px solid #f0f0f0'
                                                : 'none',
                                          }}
                                          onMouseOver={(e) => {
                                            e.currentTarget.style.background =
                                              '#f8f9fa';
                                          }}
                                          onMouseOut={(e) => {
                                            e.currentTarget.style.background =
                                              '#fff';
                                          }}
                                        >
                                          {art}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </SuggestionPortal>
                              )}
                            {loadingVariants[index] && (
                              <small className="text-info">
                                <FaSpinner className="fa-spin me-1" />
                                Loading...
                              </small>
                            )}
                          </td>

                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={item.size}
                              onChange={(e) => handleItemChange(index, e)}
                              name="size"
                              required
                              disabled={!variants.length}
                            >
                              <option value="">Select Size</option>
                              {sizes.map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={item.color}
                              onChange={(e) => handleItemChange(index, e)}
                              name="color"
                              required
                              disabled={!item.size}
                            >
                              <option value="">Select Color</option>
                              {colors.map((color) => (
                                <option key={color} value={color}>
                                  {color}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <input
                              type="number"
                              className={`form-control form-control-sm ${
                                available === 0 &&
                                originalCartons[index] === 0
                                  ? 'border-danger'
                                  : ''
                              }`}
                              value={item.cartons}
                              onChange={(e) => handleItemChange(index, e)}
                              name="cartons"
                              min="0"
                              required
                              style={{ maxWidth: '80px' }}
                              title={
                                available === 0
                                  ? 'Stock 0 hai!'
                                  : `Available: ${available}`
                              }
                            />
                            <div className="mt-1">
                              {available > 0 ? (
                                <small className="text-success fw-bold">
                                  ✓ Avail:{' '}
                                  <span className="badge bg-success">
                                    {available}
                                  </span>
                                </small>
                              ) : originalCartons[index] > 0 ? (
                                <small className="text-warning fw-bold">
                                  ⚠️ Orig:{' '}
                                  <span className="badge bg-warning">
                                    {originalCartons[index]}
                                  </span>{' '}
                                  | Now: 0
                                </small>
                              ) : (
                                <small className="text-danger fw-bold">
                                  ❌ <span className="badge bg-danger">0</span>
                                </small>
                              )}
                            </div>
                          </td>

                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm bg-light"
                              value={item.pairPerCarton}
                              readOnly
                              style={{ maxWidth: '80px' }}
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, e)}
                              name="rate"
                              step="0.01"
                              min="0"
                              required
                              style={{ maxWidth: '100px' }}
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm bg-light fw-bold"
                              value={`₹${item.amount.toFixed(2)}`}
                              readOnly
                              style={{ maxWidth: '120px' }}
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeItemRow(index)}
                              disabled={formData.items.length === 1}
                              title="Remove item"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Transport Details */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0 text-dark">🚛 Transport Details</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Station *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.station}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        station: e.target.value,
                      }))
                    }
                    placeholder="Enter station"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Transport *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.transport}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        transport: e.target.value,
                      }))
                    }
                    placeholder="Enter transport name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Marka</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.marka}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, marka: e.target.value }))
                    }
                    placeholder="Enter marka (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card mb-4 shadow-sm border-primary">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📊 Updated Summary</h5>
            </div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4">
                  <h3 className="text-primary mb-1">{totals.totalCartons}</h3>
                  <p className="text-muted mb-0">Total Cartons</p>
                </div>
                <div className="col-md-4">
                  <h3 className="text-info mb-1">{totals.totalPairs}</h3>
                  <p className="text-muted mb-0">Total Pairs</p>
                </div>
                <div className="col-md-4">
                  <h3 className="text-success mb-1">
                    ₹{totals.totalAmount.toFixed(2)}
                  </h3>
                  <p className="text-muted mb-0">Total Amount</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary btn-lg"
              onClick={() => navigate('/history')}
              disabled={saving}
            >
              <FaTimes className="me-2" />
              Cancel
            </button>

            <div className="d-flex gap-2">
              {!saving && (
                <>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => downloadChallanPDF(id, formData.invoiceNo)}
                    disabled={downloadingPDF}
                  >
                    {downloadingPDF ? (
                      <>
                        <FaSpinner className="fa-spin me-1" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="me-1" />
                        Download Challan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() =>
                      downloadProductsPDF(id, formData.invoiceNo)
                    }
                    disabled={downloadingProductsPDF}
                  >
                    {downloadingProductsPDF ? (
                      <>
                        <FaSpinner className="fa-spin me-1" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FaImages className="me-1" />
                        Download Products
                      </>
                    )}
                  </button>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg px-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="fa-spin me-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Update Challan
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Success Banner */}
        {updateSuccess && (
          <div className="alert alert-success mt-4 shadow-lg" role="alert">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <i className="fas fa-check-circle fa-2x text-success" />
                </div>
                <div>
                  <h6 className="alert-heading mb-1 fw-bold">
                    ✅ Challan Updated Successfully!
                  </h6>
                  <p className="mb-0">
                    Invoice{' '}
                    <strong className="text-primary">
                      #{formData.invoiceNo}
                    </strong>{' '}
                    has been updated successfully. Both PDFs have been
                    downloaded automatically. You can download them again using
                    the buttons above or continue editing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setUpdateSuccess(false)}
                aria-label="Close"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditChallan;
