
// import React, { useState, useEffect, useRef } from 'react';
// import api from '../../utils/api';
// import { toast } from 'react-toastify';

// const genderOptions = [
//   { value: 'gents', label: 'Gents' },
//   { value: 'ladies', label: 'Ladies' },
//   { value: 'kids_gents', label: 'Kids Gents' },
//   { value: 'kids_ladies', label: 'Kids Ladies' },
// ];

// const stockTypeOptions = [
//   { value: 'pu', label: 'PU' },
//   { value: 'eva', label: 'EVA' },
//   { value: 'new', label: 'New' },
// ];

// const initialForm = {
//   article: '',
//   image: null,
//   stockType: '',
//   gender: '',
//   mrp: '',
//   rate: '',
//   pairPerCarton: '',
//   series: '',
//   size: '',
//   color: '',
//   createdBy: localStorage.getItem('userName') || '',
//   cartons: '',
// };

// const ProductForm = () => {
//   const articleRef = useRef(null);
//   const manualRef = useRef();
//   const fileInputRef = useRef();
//   const [form, setForm] = useState(initialForm);
//   const [manualSize, setManualSize] = useState(false);
//   const [manualColor, setManualColor] = useState(false);
//   const [freeze, setFreeze] = useState({
//     stockType: false,
//     image: false,
//     series: false,
//     pairPerCarton: false,
//     mrp: false,
//     rate: false,
//   });
//   const [articleSizes, setArticleSizes] = useState([]);
//   const [articleColors, setArticleColors] = useState([]);
//   const [allSizes, setAllSizes] = useState([]);
//   const [allColors, setAllColors] = useState([]);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [allowedGenders, setAllowedGenders] = useState(genderOptions);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [articleSuggestions, setArticleSuggestions] = useState([]);
//   const [showArticleSuggestions, setShowArticleSuggestions] = useState(true);

//   // ---- Article Suggestions autocomplete
//   useEffect(() => {
//     if (form.article.trim()) {
//       api
//         .get(`/products/articles-suggestions?search=${form.article.trim()}`)
//         .then(res => {
//           let seen = new Set();
//           let arr = (res.data.data || []).filter(a => {
//             const upper = a.toUpperCase();
//             if (upper === form.article.toUpperCase()) return false;
//             if (seen.has(upper)) return false;
//             seen.add(upper); return true;
//           });
//           setArticleSuggestions(arr);
//         })
//         .catch(() => setArticleSuggestions([]));
//     } else {
//       setArticleSuggestions([]);
//     }
//     setShowArticleSuggestions(true);
//   }, [form.article]);

//   // ---- Image preview
//   useEffect(() => {
//     if (form.image instanceof File) {
//       setImagePreview(URL.createObjectURL(form.image));
//     } else if (typeof form.image === 'string' && form.image.trim()) {
//       if (form.image.startsWith('http') || form.image.startsWith('https')) {
//         setImagePreview(form.image);
//       } else {
//         setImagePreview(`http://localhost:5000${form.image}`);
//       }
//     } else {
//       setImagePreview(null);
//     }
//   }, [form.image]);

//   // ---- StockType freeze, Gender, Sizes, Colors, Allowed genders
//   useEffect(() => {
//     if (form.article) {
//       api.get(`/products/smart-article-info?article=${form.article}`)
//         .then(res => {
//           const data = res.data.data || {};
//           setForm(f => ({ ...f, stockType: data.stockType || '' }));
//           setFreeze(f => ({ ...f, stockType: !!data.stockType }));
//         })
//         .catch(() => {
//           setFreeze(f => ({ ...f, stockType: false }));
//           setForm(f => ({ ...f, stockType: '' }));
//         });
//       api.get(`/products/article-options?article=${form.article}`)
//         .then(res => {
//           setArticleSizes(res.data.sizes || []);
//           setArticleColors(res.data.colors || []);
//         });
//       api.get(`/products/suggestions?field=size`).then(res => setAllSizes(res.data.data || []));
//       api.get(`/products/suggestions?field=color`).then(res => setAllColors(res.data.data || []));
//       api.get(`/products/allowed-genders?article=${form.article}`)
//         .then(res => {
//           if (res.data.success && Array.isArray(res.data.allowedGenders)) {
//             const allowedSet = new Set(res.data.allowedGenders.map(x => x.toLowerCase()));
//             const options = genderOptions.filter(opt => allowedSet.has(opt.value));
//             setAllowedGenders(options);
//           } else setAllowedGenders(genderOptions);
//         })
//         .catch(() => setAllowedGenders(genderOptions));
//     } else {
//       setForm(f => ({ ...f, stockType: '' }));
//       setFreeze(f => ({ ...f, stockType: false }));
//       setArticleSizes([]); setArticleColors([]); setAllSizes([]); setAllColors([]);
//     }
//   }, [form.article]);

//   useEffect(() => {
//     if (form.article && form.gender) {
//       api.get(`/products/article-gender-info?article=${form.article}&gender=${form.gender}`)
//         .then(res => {
//           if (!res.data.success || !res.data.data) {
//             setForm(f => ({ ...f, image: null }));
//             setFreeze(f => ({ ...f, image: false }));
//             return;
//           }
//           const data = res.data.data;
//           setForm(f => ({ ...f, image: data.image ?? null }));
//           setFreeze(f => ({
//             ...f,
//             image: !!data.image,
//             pairPerCarton: false,
//             series: false
//           }));
//         })
//         .catch(() => {
//           setForm(f => ({ ...f, image: null }));
//           setFreeze(f => ({ ...f, image: false }));
//         });
//     }
//   }, [form.article, form.gender]);

//   useEffect(() => {
//     if (form.article && form.gender && form.size) {
//       api.get(`/products/article-gender-size-info?article=${form.article}&gender=${form.gender}&size=${form.size}`)
//         .then(res => {
//           const data = res.data.data;
//           if (!res.data.success || !data) {
//             setForm(f => ({
//               ...f,
//               mrp: '',
//               rate: '',
//               pairPerCarton: '',
//               series: ''
//             }));
//             setFreeze(f => ({
//               ...f,
//               mrp: false,
//               rate: false,
//               pairPerCarton: false,
//               series: false
//             }));
//             return;
//           }
//           setForm(f => ({
//             ...f,
//             mrp: data.mrp || '',
//             rate: data.rate || '',
//             pairPerCarton: data.pairPerCarton || '',
//             series: data.series || ''
//           }));
//           setFreeze(f => ({
//             ...f,
//             mrp: !!data.mrp,
//             rate: !!data.rate,
//             pairPerCarton: data.pairPerCarton !== undefined && data.pairPerCarton !== '',
//             series: data.series !== undefined && data.series !== ''
//           }));
//         })
//         .catch(() => {
//           setForm(f => ({
//             ...f,
//             mrp: '',
//             rate: '',
//             pairPerCarton: '',
//             series: ''
//           }));
//           setFreeze(f => ({
//             ...f,
//             mrp: false,
//             rate: false,
//             pairPerCarton: false,
//             series: false
//           }));
//         });
//     }
//   }, [form.article, form.gender, form.size]);

//   // -- All Validation
//   const checkFieldValid = (name, value) => {
//     if ((name === "cartons" || name === "pairPerCarton") && value !== "") {
//       if (!/^\d+$/.test(value)) return "Digits only";
//       if (parseInt(value) <= 0) return "Must be positive";
//     }
//     if (name === "mrp" && value !== "") {
//       if (isNaN(Number(value))) return "Enter valid number";
//       if (Number(value) < 3) return "Min 3";
//       if (Number(value) > 10000) return "Max 10000";
//     }
//     if (name === "rate" && value !== "") {
//       if (!/^\d*\.?\d{0,2}$/.test(value)) return "Max 2 decimals";
//       if (Number(value) > 10000) return "Max 10000";
//     }
//     // if (name === "size" && manualSize && value !== "") {
//     //   if (!/^\d+[Xx]\d+$/.test(value)) return "Size must be like 5X8";
//     //   const [w, h] = value.toUpperCase().split("X").map(Number);
//     //   if (w < 1 || w > 20 || h < 1 || h > 20) return "Width/Height 1-20 only";
//     // }
//     if (name === "size" && manualSize && value !== "") {
//   const trimmed = value.trim().toUpperCase();
  
//   // Numeric format (5X8)
//   const numericMatch = trimmed.match(/^(\d+)[Xx](\d+)$/);
//   if (numericMatch) {
//     const [, w, h] = numericMatch;
//     const wNum = parseInt(w, 10);
//     const hNum = parseInt(h, 10);
//     if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
//       return "Width/Height 1-20 only";
//     }
//   }
//   // Pure alphabets
//   else if (!/^[A-Z]+$/.test(trimmed)) {
//     return "Only 5X8 or letters allowed";
//   }
// }


//     return "";
//   };

//   // -- Universal Handler
//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     let err = checkFieldValid(name, value);
    
//     if (name === "image") {
//       setForm((f) => ({ ...f, image: files[0] }));
//     } else if (name === "mrp") {
//       const mrpValue = parseFloat(value);
//       setForm((f) => ({
//         ...f,
//         mrp: value,
//         rate: freeze.rate ? f.rate : (!isNaN(mrpValue) ? (mrpValue / 3).toFixed(2) : f.rate)
//       }));
//     } else if (name === 'color') {
//       const val = value.replace(/[^a-zA-Z0-9 _/.,-]/g, '').toUpperCase();
//       setForm((f) => ({ ...f, color: val }));
//     // } else if (name === "size") {
//     //   const val = value.replace(/x/g, "X");
//     //   setForm((f) => ({ ...f, size: val }));
//     } else if (name === "size") {
//   // ✅ Convert to uppercase, replace x with X
//   const val = value.replace(/x/g, "X").toUpperCase();
//   setForm((f) => ({ ...f, size: val }));


//     } else if (name === "article") {
//       setForm(f => ({ ...f, article: value.toUpperCase() }));
//     } else {
//       setForm(f => ({ ...f, [name]: value }));
//     }
//     setFieldErrors(f => ({ ...f, [name]: err }));

//     if (name === "article") setShowArticleSuggestions(true);
//   };

//   // -- Autocomplete choose
//   const handleArticleChoose = (val) => {
//     setForm(f => ({ ...f, article: val }));
//     setArticleSuggestions([]);
//     setShowArticleSuggestions(false);
//     setTimeout(() => {
//       document.activeElement.blur();
//     }, 100);
//   };

//   // -- Dropdown + Manual
//   const handleSizeChange = (e) => {
//     if (e.target.value === '__manual') {
//       setManualSize(true);
//       setForm((f) => ({ ...f, size: "" }));
//       setTimeout(() => manualRef.current?.focus(), 0);
//     } else {
//       setManualSize(false);
//       setForm((f) => ({ ...f, size: e.target.value }));
//     }
//   };

//   const handleColorChange = (e) => {
//     if (e.target.value === '__manual') {
//       setManualColor(true);
//       setForm((f) => ({ ...f, color: "" }));
//       setTimeout(() => manualRef.current?.focus(), 0);
//     } else {
//       setManualColor(false);
//       setForm((f) => ({ ...f, color: e.target.value }));
//     }
//   };

//   // -- Focus lock on error
//   const handleBlur = (name, value) => {
//     const err = checkFieldValid(name, value);
//     setFieldErrors(f => ({ ...f, [name]: err }));
//     if (err && value !== "") {
//       setTimeout(() => document.getElementsByName(name)[0]?.focus(), 0);
//     }
//   };

//   const renderDropdown = (name, articleOptions, allOptions, handleDropdownChange) => {
//     const articleUnique = articleOptions.filter(Boolean);
//     const dbOthers = allOptions.filter(
//       opt => Boolean(opt) && !articleUnique.includes(opt)
//     );

//     return (
//       <select
//         className="form-select form-select-modern"
//         name={name}
//         value={form[name]}
//         onChange={handleDropdownChange}
//         required
//       >
//         <option value="">
//           Select {name.charAt(0).toUpperCase() + name.slice(1)}
//         </option>

//         {articleUnique.map(opt => (
//           <option key={`art-${opt}`} value={opt}>
//             {opt}
//           </option>
//         ))}

//         <option value="__manual">Other (Manual Entry)</option>

//         {dbOthers.map(opt => (
//           <option key={`db-${opt}`} value={opt}>
//             {opt}
//           </option>
//         ))}
//       </select>
//     );
//   };

//   // -- Form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (Object.entries(fieldErrors).some(([key, val]) => val && form[key] !== "")) {
//       toast.error("Fix field errors before submitting!");
//       return;
//     }

//     if (!form.size) {
//       toast.error("Size is required");
//       return;
//     }
//     if (!form.cartons) {
//       toast.error("Cartons is required");
//       return;
//     }
//     if (!form.pairPerCarton) {
//       toast.error("Pair/Carton is required");
//       return;
//     }

//     // if (manualSize) {
//     //   const size = form.size.trim().toUpperCase();
//     //   const match = size.match(/^(\d+)[Xx](\d+)$/);
//     //   if (!match) {
//     //     toast.error("Size must be in format like 5X8");
//     //     return;
//     //   }

//     //   const [, w, h] = match;
//     //   const wNum = parseInt(w, 10);
//     //   const hNum = parseInt(h, 10);

//     //   if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
//     //     toast.error("Width and Height must each be between 1 and 20");
//     //     return;
//     //   }

//     //   form.size = `${wNum}X${hNum}`;
//    // }
//    if (manualSize) {
//   const size = form.size.trim().toUpperCase();
  
//   // Numeric format (5X8)
//   const numericMatch = size.match(/^(\d+)[Xx](\d+)$/);
//   if (numericMatch) {
//     const [, w, h] = numericMatch;
//     const wNum = parseInt(w, 10);
//     const hNum = parseInt(h, 10);
//     if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
//       toast.error("Width and Height must be between 1 and 20");
//       return;
//     }
//     form.size = `${wNum}X${hNum}`;
//   }
//   // Pure alphabets - no max limit
//   else if (/^[A-Z]+$/.test(size)) {
//     form.size = size;
//   }
//   else {
//     toast.error("Size must be 5X8 or letters only (S/M/L/XL)");
//     return;
//   }
// }

//     if (manualColor && !form.color.trim()) {
//       toast.error("Color is required");
//       return;
//     }

//     if (
//       isNaN(form.cartons) ||
//       isNaN(form.pairPerCarton) ||
//       parseInt(form.cartons, 10) <= 0 ||
//       parseInt(form.pairPerCarton, 10) <= 0
//     ) {
//       toast.error("Cartons and Pair/Carton must be positive integers");
//       return;
//     }

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => {
//       if (k === 'image' && !v) return;
//       fd.append(k, v);
//     });

//     try {
//       await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//       toast.success('Product added!');
//       setForm(initialForm);
//       setManualSize(false);
//       setManualColor(false);
//       setImagePreview(null);
//       articleRef.current?.focus();
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch {
//       toast.error('Failed to add product');
//     }
//   };

//   return (
//     <div className="dashboard-bg min-vh-100 py-4">
//       <style>{`
//         .dashboard-bg {
//           background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
//           min-height: 100vh;
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//         }
        
//         .product-form-card {
//           background: #ffffff;
//           border-radius: 20px;
//           box-shadow: 0 15px 50px 0 rgba(85,76,219,0.1), 0 4px 16px rgba(60,72,126,0.15);
//           border: none;
//           overflow: hidden;
//           max-width: 900px;
//           margin: 0 auto;
//         }
        
//         .form-header {
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           color: white;
//           padding: 2rem;
//           text-align: center;
//           position: relative;
//         }
        
//         .form-header::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: 0;
//           right: 0;
//           bottom: 0;
//           background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
//           pointer-events: none;
//         }
        
//         .header-logo-container {
//           width: 80px;
//           height: 80px;
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           margin: 0 auto 1rem;
//           backdrop-filter: blur(10px);
//           border: 3px solid rgba(255, 255, 255, 0.3);
//           padding: 10px;
//         }
        
//         .header-logo {
//           width: 100%;
//           height: 100%;
//           object-fit: contain;
//           border-radius: 50%;
//         }
        
//         .form-section {
//           padding: 2rem;
//         }
        
//         .form-label-modern {
//           font-weight: 600;
//           color: #2d3748;
//           margin-bottom: 0.5rem;
//           font-size: 0.9rem;
//           text-transform: uppercase;
//           letter-spacing: 0.5px;
//           display: flex;
//           align-items: center;
//         }
        
//         .form-label-icon {
//           margin-right: 0.5rem;
//           color: #667eea;
//         }
        
//         .form-control-modern {
//           background: #f8faff;
//           border: 2px solid #e2e8f0;
//           border-radius: 12px;
//           padding: 0.75rem 1rem;
//           transition: all 0.3s ease;
//           font-size: 1rem;
//           font-weight: 500;
//         }
        
//         .form-control-modern:focus {
//           background: #ffffff;
//           border-color: #667eea;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           outline: none;
//           transform: translateY(-1px);
//         }
        
//         .form-select-modern {
//           background: #f8faff;
//           border: 2px solid #e2e8f0;
//           border-radius: 12px;
//           padding: 0.75rem 1rem;
//           transition: all 0.3s ease;
//           font-size: 1rem;
//           font-weight: 500;
//         }
        
//         .form-select-modern:focus {
//           background: #ffffff;
//           border-color: #667eea;
//           box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
//           outline: none;
//         }
        
//         .form-control-modern:disabled,
//         .form-select-modern:disabled {
//           background: #e2e8f0;
//           color: #718096;
//           cursor: not-allowed;
//         }
        
//         .autocomplete-dropdown {
//           position: absolute;
//           top: 100%;
//           left: 0;
//           right: 0;
//           background: #ffffff;
//           border: 2px solid #e2e8f0;
//           border-top: none;
//           border-radius: 0 0 12px 12px;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
//           z-index: 1000;
//           max-height: 200px;
//           overflow-y: auto;
//         }
        
//         .autocomplete-item {
//           padding: 0.75rem 1rem;
//           cursor: pointer;
//           transition: all 0.2s ease;
//           border-bottom: 1px solid #f1f5f9;
//           font-weight: 500;
//         }
        
//         .autocomplete-item:hover {
//           background: #f8faff;
//           color: #667eea;
//         }
        
//         .autocomplete-item:last-child {
//           border-bottom: none;
//         }
        
//         .image-preview-container {
//           background: #f8faff;
//           border: 2px dashed #e2e8f0;
//           border-radius: 12px;
//           padding: 1rem;
//           text-align: center;
//           margin-bottom: 1rem;
//           transition: all 0.3s ease;
//         }
        
//         .image-preview-container:hover {
//           border-color: #667eea;
//           background: #f0f4fc;
//         }
        
//         .image-preview {
//           max-height: 120px;
//           border-radius: 8px;
//           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//         }
        
//         .btn-submit-modern {
//           background: linear-gradient(45deg, #667eea, #764ba2);
//           color: white;
//           border: none;
//           border-radius: 12px;
//           padding: 1rem 2rem;
//           font-size: 1.1rem;
//           font-weight: 700;
//           text-transform: uppercase;
//           letter-spacing: 1px;
//           transition: all 0.3s ease;
//           box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
//           position: relative;
//           overflow: hidden;
//         }
        
//         .btn-submit-modern::before {
//           content: '';
//           position: absolute;
//           top: 0;
//           left: -100%;
//           width: 100%;
//           height: 100%;
//           background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
//           transition: left 0.5s ease;
//         }
        
//         .btn-submit-modern:hover {
//           transform: translateY(-2px);
//           box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
//           color: white;
//         }
        
//         .btn-submit-modern:hover::before {
//           left: 100%;
//         }
        
//         .invalid-feedback {
//           display: block;
//           color: #e53e3e;
//           font-size: 0.875rem;
//           margin-top: 0.25rem;
//           font-weight: 500;
//         }
        
//         .is-invalid {
//           border-color: #e53e3e !important;
//           box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
//         }
        
//         .required-asterisk {
//           color: #e53e3e;
//           margin-left: 0.25rem;
//         }
        
//         .field-group {
//           margin-bottom: 1.5rem;
//         }
        
//         @media (max-width: 768px) {
//           .product-form-card { margin: 1rem; }
//           .form-header { padding: 1.5rem; }
//           .form-section { padding: 1.5rem; }
//           .header-logo-container { width: 60px; height: 60px; }
//           .btn-submit-modern { width: 100%; }
//         }
//       `}</style>

//       <div className="container-fluid">
//         <div className="row justify-content-center">
//           <div className="col-12">
//             <div className="product-form-card">
//               {/* Header */}
//               <div className="form-header">
//                 <div className="header-logo-container">
//                   <img src="/logo.png" alt="GP FAX Logo" className="header-logo" />
//                 </div>
//                 <h1 className="mb-2">Add New Product</h1>
//                 <p className="mb-0 opacity-75">Create a new product entry with detailed specifications</p>
//               </div>

//               {/* Form Body */}
//               <div className="form-section">
//                 <form onSubmit={handleSubmit} encType="multipart/form-data">
//                   <div className="row">
//                     {/* Article Name - Full Width */}
//                     <div className="col-12 field-group position-relative">
//                       <label className="form-label-modern">
//                         <i className="bi bi-tag form-label-icon"></i>
//                         Article Name<span className="required-asterisk">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         className="form-control form-control-modern"
//                         name="article"
//                         value={form.article}
//                         onChange={handleChange}
//                         autoComplete="off"
//                         ref={articleRef}
//                         required
//                         placeholder="Enter article name..."
//                         onFocus={() => setShowArticleSuggestions(true)}
//                       />
//                       {!!articleSuggestions.length && showArticleSuggestions && (
//                         <div className="autocomplete-dropdown">
//                           {articleSuggestions.map(opt => (
//                             <div
//                               key={opt}
//                               onMouseDown={() => handleArticleChoose(opt)}
//                               className="autocomplete-item"
//                             >
//                               {opt}
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>

//                     {/* Stock Type */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-layers form-label-icon"></i>
//                         Stock Type<span className="required-asterisk">*</span>
//                       </label>
//                       <select 
//                         className="form-select form-select-modern" 
//                         name="stockType" 
//                         value={form.stockType} 
//                         onChange={handleChange} 
//                         disabled={freeze.stockType} 
//                         required
//                       >
//                         <option value="">Select Stock Type</option>
//                         {stockTypeOptions.map(opt => (
//                           <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Gender */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-people form-label-icon"></i>
//                         Gender<span className="required-asterisk">*</span>
//                       </label>
//                       <select 
//                         className="form-select form-select-modern" 
//                         name="gender" 
//                         value={form.gender} 
//                         onChange={handleChange} 
//                         required
//                       >
//                         <option value="">Select Gender</option>
//                         {allowedGenders.map(opt => (
//                           <option key={opt.value} value={opt.value}>{opt.label}</option>
//                         ))}
//                       </select>
//                     </div>

//                     {/* Image Upload - Full Width */}
//                     <div className="col-12 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-image form-label-icon"></i>
//                         Product Image
//                       </label>
//                       <div className="image-preview-container">
//                         {imagePreview ? (
//                           <div className="mb-3">
//                             <img src={imagePreview} alt="Preview" className="image-preview" />
//                           </div>
//                         ) : (
//                           <div className="text-muted mb-3">
//                             <i className="bi bi-cloud-upload fs-2 d-block mb-2"></i>
//                             No image selected
//                           </div>
//                         )}
//                         <input 
//                           type="file" 
//                           className="form-control form-control-modern" 
//                           name="image" 
//                           accept="image/*"   
//                           ref={fileInputRef}  
//                           onChange={handleChange} 
//                           disabled={freeze.image} 
//                         />
//                       </div>
//                     </div>

//                     {/* Size */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-rulers form-label-icon"></i>
//                         Size<span className="required-asterisk">*</span>
//                       </label>
//                       {!manualSize ? (
//                         renderDropdown('size', articleSizes, allSizes, handleSizeChange)
//                       ) : (
//                         <>
//                           <input
//                             type="text"
//                             className={`form-control form-control-modern ${fieldErrors.size ? "is-invalid" : ""}`}
//                            placeholder="Enter Size (e.g., 5X8 or S/M/L/XL)"

//                             name="size"
//                             value={form.size}
//                             onChange={(e) => {
//                               let val = e.target.value.replace(/x/g, "X");
//                               setForm(f => ({ ...f, size: val }));
//                             }}
//                             required
//                             onBlur={(e) => {
//                               const err = checkFieldValid("size", e.target.value);
//                               setFieldErrors(f => ({ ...f, size: err }));
//                               if (err && e.target.value !== "") {
//                                 setTimeout(() => document.getElementsByName("size")[0]?.focus(), 0);
//                               }
//                             }}
//                           />
//                           {fieldErrors.size && (
//                             <div className="invalid-feedback">{fieldErrors.size}</div>
//                           )}
//                         </>
//                       )}
//                     </div>

//                     {/* Color */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-palette form-label-icon"></i>
//                         Color<span className="required-asterisk">*</span>
//                       </label>
//                       {!manualColor ? (
//                         renderDropdown('color', articleColors, allColors, handleColorChange)
//                       ) : (
//                         <input
//                           type="text"
//                           className="form-control form-control-modern"
//                           placeholder="Enter Color"
//                           name="color"
//                           value={form.color}
//                           onChange={handleChange}
//                           required
//                           onBlur={e => handleBlur("color", e.target.value)} 
//                         />
//                       )}
//                     </div>

//                     {/* Pair per Carton */}
//                     <div className="col-md-4 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-box form-label-icon"></i>
//                         Pair/Carton<span className="required-asterisk">*</span>
//                       </label>
//                       <input 
//                         type="number" 
//                         className={`form-control form-control-modern ${fieldErrors.pairPerCarton ? "is-invalid" : ""}`} 
//                         name="pairPerCarton" 
//                         value={form.pairPerCarton} 
//                         onChange={handleChange} 
//                         disabled={freeze.pairPerCarton} 
//                         required
//                         placeholder="Enter pairs per carton..."
//                         onBlur={e => handleBlur("pairPerCarton", e.target.value)}
//                       />
//                       {fieldErrors.pairPerCarton && <div className="invalid-feedback">{fieldErrors.pairPerCarton}</div>}
//                     </div>

//                     {/* Series */}
//                     <div className="col-md-4 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-collection form-label-icon"></i>
//                         Series
//                       </label>
//                       <input 
//                         type="text" 
//                         className="form-control form-control-modern" 
//                         name="series" 
//                         value={form.series} 
//                         onChange={handleChange} 
//                         disabled={freeze.series} 
//                         placeholder="Enter series..."
//                       />
//                     </div>

//                     {/* Cartons */}
//                     <div className="col-md-4 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-boxes form-label-icon"></i>
//                         No. of Cartons<span className="required-asterisk">*</span>
//                       </label>
//                       <input 
//                         type="number" 
//                         className={`form-control form-control-modern ${fieldErrors.cartons ? "is-invalid" : ""}`} 
//                         name="cartons" 
//                         value={form.cartons} 
//                         onChange={handleChange} 
//                         required
//                         placeholder="Enter number of cartons..."
//                         onBlur={e => handleBlur("cartons", e.target.value)} 
//                       />
//                       {fieldErrors.cartons && <div className="invalid-feedback">{fieldErrors.cartons}</div>}
//                     </div>

//                     {/* MRP */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-currency-rupee form-label-icon"></i>
//                         MRP<span className="required-asterisk">*</span>
//                       </label>
//                       <input 
//                         type="number" 
//                         className={`form-control form-control-modern ${fieldErrors.mrp ? "is-invalid" : ""}`} 
//                         name="mrp" 
//                         value={form.mrp} 
//                         onChange={handleChange} 
//                         disabled={freeze.mrp} 
//                         required
//                         placeholder="Enter MRP..."
//                         onBlur={e => handleBlur("mrp", e.target.value)}
//                         min="3" 
//                         max="10000"
//                       />
//                       {fieldErrors.mrp && <div className="invalid-feedback">{fieldErrors.mrp}</div>}
//                     </div>

//                     {/* Rate */}
//                     <div className="col-md-6 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-cash form-label-icon"></i>
//                         Rate<span className="required-asterisk">*</span>
//                       </label>
//                       <input 
//                         type="number"
//                         step="0.01"
//                         className={`form-control form-control-modern ${fieldErrors.rate ? "is-invalid" : ""}`}
//                         name="rate" 
//                         value={form.rate}
//                         onChange={handleChange} 
//                         disabled={freeze.rate} 
//                         required
//                         placeholder="Enter rate..."
//                         onBlur={e => handleBlur("rate", e.target.value)}
//                         max="10000"
//                       />
//                       {fieldErrors.rate && <div className="invalid-feedback">{fieldErrors.rate}</div>}
//                     </div>

//                     {/* Created By */}
//                     <div className="col-12 field-group">
//                       <label className="form-label-modern">
//                         <i className="bi bi-person-check form-label-icon"></i>
//                         Created By<span className="required-asterisk">*</span>
//                       </label>
//                       <input 
//                         type="text" 
//                         className="form-control form-control-modern" 
//                         name="createdBy" 
//                         value={form.createdBy} 
//                         onChange={handleChange} 
//                         required 
//                         placeholder="Enter creator name..."
//                       />
//                     </div>

//                     {/* Submit Button */}
//                     <div className="col-12 text-center mt-4">
//                       <button type="submit" className="btn-submit-modern">
//                         <i className="bi bi-plus-circle me-2"></i>
//                         Save Product
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductForm;

import React, { useState, useEffect, useRef } from 'react';

import api from '../../utils/api';
import { toast } from 'react-toastify';
// utils hook inside same file
const useDebounce = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};


const genderOptions = [
  { value: 'gents', label: 'Gents' },
  { value: 'ladies', label: 'Ladies' },
  { value: 'kids_gents', label: 'Kids Gents' },
  { value: 'kids_ladies', label: 'Kids Ladies' },
];

// stockTypeOptions removed — types are now fetched dynamically from the company's products

const initialForm = {
  article: '',
  image: null,
  stockType: '',
  gender: '',
  mrp: '',
  rate: '',
  pairPerCarton: '',
  series: '',
  size: '',
  color: '',
  createdBy: localStorage.getItem('userName') || '',
  cartons: '',
};

const ProductForm = () => {
  const articleRef = useRef(null);
  const manualRef = useRef();
  const fileInputRef = useRef();
  const [form, setForm] = useState(initialForm);
  const [manualSize, setManualSize] = useState(false);
  const [manualColor, setManualColor] = useState(false);
  const [freeze, setFreeze] = useState({
    stockType: false,
    image: false,
    series: false,
    pairPerCarton: false,
    mrp: false,
    rate: false,
  });
  const [articleSizes, setArticleSizes] = useState([]);
  const [articleColors, setArticleColors] = useState([]);
  const [allSizes, setAllSizes] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [allowedGenders, setAllowedGenders] = useState(genderOptions);
  const [fieldErrors, setFieldErrors] = useState({});
  const [articleSuggestions, setArticleSuggestions] = useState([]);
  const debouncedArticle = useDebounce(form.article, 400);

  const [showArticleSuggestions, setShowArticleSuggestions] = useState(true);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [stockTypeList, setStockTypeList] = useState([]);

  // Fetch company's existing stock types
  useEffect(() => {
    api.get('/products/stock-types')
      .then(res => setStockTypeList(res.data.data || []))
      .catch(() => setStockTypeList([]));
  }, []);


 

// ---- Article Suggestions autocomplete - FIXED
useEffect(() => {
  if (debouncedArticle.trim()) {
    api
      .get(`/products/articles-suggestions?search=${debouncedArticle.trim()}`)
      .then(res => {
        let seen = new Set();
        let arr = (res.data.data || []).filter(a => {
          const upper = a.toUpperCase();
          // ✅ FIXED: Exact match BHI include karo, sirf duplicates hatao
          if (seen.has(upper)) return false;
          seen.add(upper); 
          return true;  // ✅ Exact "8815" bhi dikhega
        });
        setArticleSuggestions(arr);
      })
      .catch(() => setArticleSuggestions([]));
  } else {
    setArticleSuggestions([]);
  }
  setShowArticleSuggestions(true);
}, [debouncedArticle]);

  // ---- Image preview
  useEffect(() => {
    if (form.image instanceof File) {
      setImagePreview(URL.createObjectURL(form.image));
    } else if (typeof form.image === 'string' && form.image.trim()) {
      if (form.image.startsWith('http') || form.image.startsWith('https')) {
        setImagePreview(form.image);
      } else {
        setImagePreview(`http://localhost:5000${form.image}`);
      }
    } else {
      setImagePreview(null);
    }
  }, [form.image]);

  // ---- StockType freeze, Gender, Sizes, Colors, Allowed genders
  useEffect(() => {
    if (debouncedArticle) {
      api.get(`/products/smart-article-info?article=${debouncedArticle}`)
        .then(res => {
          const data = res.data.data || {};
          setForm(f => ({ ...f, stockType: data.stockType || '' }));
          setFreeze(f => ({ ...f, stockType: !!data.stockType }));
        })
        .catch(() => {
          setFreeze(f => ({ ...f, stockType: false }));
          setForm(f => ({ ...f, stockType: '' }));
        });
      api.get(`/products/article-options?article=${debouncedArticle}`)
        .then(res => {
          setArticleSizes(res.data.sizes || []);
          setArticleColors(res.data.colors || []);
        });
      api.get(`/products/suggestions?field=size`).then(res => setAllSizes(res.data.data || []));
      api.get(`/products/suggestions?field=color`).then(res => setAllColors(res.data.data || []));
      api.get(`/products/allowed-genders?article=${debouncedArticle}`)
        .then(res => {
          if (res.data.success && Array.isArray(res.data.allowedGenders)) {
            const allowedSet = new Set(res.data.allowedGenders.map(x => x.toLowerCase()));
            const options = genderOptions.filter(opt => allowedSet.has(opt.value));
            setAllowedGenders(options);
          } else setAllowedGenders(genderOptions);
        })
        .catch(() => setAllowedGenders(genderOptions));
    } else {
      setForm(f => ({ ...f, stockType: '' }));
      setFreeze(f => ({ ...f, stockType: false }));
      setArticleSizes([]); setArticleColors([]); setAllSizes([]); setAllColors([]);
    }
  }, [debouncedArticle]);

  useEffect(() => {
    if (form.article && form.gender) {
      api.get(`/products/article-gender-info?article=${form.article}&gender=${form.gender}`)
        .then(res => {
          if (!res.data.success || !res.data.data) {
            setForm(f => ({ ...f, image: null }));
            setFreeze(f => ({ ...f, image: false }));
            return;
          }
          const data = res.data.data;
          setForm(f => ({ ...f, image: data.image ?? null }));
          setFreeze(f => ({
            ...f,
            image: !!data.image,
            pairPerCarton: false,
            series: false
          }));
        })
        .catch(() => {
          setForm(f => ({ ...f, image: null }));
          setFreeze(f => ({ ...f, image: false }));
        });
    }
  }, [form.article, form.gender]);

  useEffect(() => {
    if (form.article && form.gender && form.size) {
      api.get(`/products/article-gender-size-info?article=${form.article}&gender=${form.gender}&size=${form.size}`)
        .then(res => {
          const data = res.data.data;
          if (!res.data.success || !data) {
            setForm(f => ({
              ...f,
              mrp: '',
              rate: '',
              pairPerCarton: '',
              series: ''
            }));
            setFreeze(f => ({
              ...f,
              mrp: false,
              rate: false,
              pairPerCarton: false,
              series: false
            }));
            return;
          }
          setForm(f => ({
            ...f,
            mrp: data.mrp || '',
            rate: data.rate || '',
            pairPerCarton: data.pairPerCarton || '',
            series: data.series || ''
          }));
          setFreeze(f => ({
            ...f,
            mrp: !!data.mrp,
            rate: !!data.rate,
            pairPerCarton: data.pairPerCarton !== undefined && data.pairPerCarton !== '',
            series: data.series !== undefined && data.series !== ''
          }));
        })
        .catch(() => {
          setForm(f => ({
            ...f,
            mrp: '',
            rate: '',
            pairPerCarton: '',
            series: ''
          }));
          setFreeze(f => ({
            ...f,
            mrp: false,
            rate: false,
            pairPerCarton: false,
            series: false
          }));
        });
    }
  }, [form.article, form.gender, form.size]);
  // 🚀 NEW useEffect - YAHAN ADD KARO (line ~170 ke around)
useEffect(() => {
  setSelectedSuggestionIndex(-1);
}, [debouncedArticle]);


  // -- All Validation
  const checkFieldValid = (name, value) => {
    if ((name === "cartons" || name === "pairPerCarton") && value !== "") {
      if (!/^\d+$/.test(value)) return "Digits only";
      if (parseInt(value) <= 0) return "Must be positive";
    }
    if (name === "mrp" && value !== "") {
      if (isNaN(Number(value))) return "Enter valid number";
      if (Number(value) < 3) return "Min 3";
      if (Number(value) > 10000) return "Max 10000";
    }
    if (name === "rate" && value !== "") {
      if (!/^\d*\.?\d{0,2}$/.test(value)) return "Max 2 decimals";
      if (Number(value) > 10000) return "Max 10000";
    }
    // if (name === "size" && manualSize && value !== "") {
    //   if (!/^\d+[Xx]\d+$/.test(value)) return "Size must be like 5X8";
    //   const [w, h] = value.toUpperCase().split("X").map(Number);
    //   if (w < 1 || w > 20 || h < 1 || h > 20) return "Width/Height 1-20 only";
    // }
    if (name === "size" && manualSize && value !== "") {
  const trimmed = value.trim().toUpperCase();
  
  // Numeric format (5X8)
  const numericMatch = trimmed.match(/^(\d+)[Xx](\d+)$/);
  if (numericMatch) {
    const [, w, h] = numericMatch;
    const wNum = parseInt(w, 10);
    const hNum = parseInt(h, 10);
    if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
      return "Width/Height 1-20 only";
    }
  }
  // Pure alphabets
  else if (!/^[A-Z]+$/.test(trimmed)) {
    return "Only 5X8 or letters allowed";
  }
}


    return "";
  };

  // -- Universal Handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    let err = checkFieldValid(name, value);
    
    if (name === "image") {
      setForm((f) => ({ ...f, image: files[0] }));
    } else if (name === "mrp") {
      const mrpValue = parseFloat(value);
      setForm((f) => ({
        ...f,
        mrp: value,
        rate: freeze.rate ? f.rate : (!isNaN(mrpValue) ? (mrpValue / 3).toFixed(2) : f.rate)
      }));
    } else if (name === 'color') {
      const val = value.replace(/[^a-zA-Z0-9 _/.,-]/g, '').toUpperCase();
      setForm((f) => ({ ...f, color: val }));
    // } else if (name === "size") {
    //   const val = value.replace(/x/g, "X");
    //   setForm((f) => ({ ...f, size: val }));
    } else if (name === "size") {
  // ✅ Convert to uppercase, replace x with X
  const val = value.replace(/x/g, "X").toUpperCase();
  setForm((f) => ({ ...f, size: val }));


    } else if (name === "article") {
      setForm(f => ({ ...f, article: value.toUpperCase() }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
    setFieldErrors(f => ({ ...f, [name]: err }));

    if (name === "article") setShowArticleSuggestions(true);
  };

  // -- Autocomplete choose
  const handleArticleChoose = (val) => {
    setForm(f => ({ ...f, article: val }));
    setArticleSuggestions([]);
    setShowArticleSuggestions(false);
    setTimeout(() => {
      document.activeElement.blur();
    }, 100);
  };

  // -- Dropdown + Manual
  const handleSizeChange = (e) => {
    if (e.target.value === '__manual') {
      setManualSize(true);
      setForm((f) => ({ ...f, size: "" }));
      setTimeout(() => manualRef.current?.focus(), 0);
    } else {
      setManualSize(false);
      setForm((f) => ({ ...f, size: e.target.value }));
    }
  };

  const handleColorChange = (e) => {
    if (e.target.value === '__manual') {
      setManualColor(true);
      setForm((f) => ({ ...f, color: "" }));
      setTimeout(() => manualRef.current?.focus(), 0);
    } else {
      setManualColor(false);
      setForm((f) => ({ ...f, color: e.target.value }));
    }
  };

  // -- Focus lock on error
  const handleBlur = (name, value) => {
    const err = checkFieldValid(name, value);
    setFieldErrors(f => ({ ...f, [name]: err }));
    if (err && value !== "") {
      setTimeout(() => document.getElementsByName(name)[0]?.focus(), 0);
    }
  };

  const renderDropdown = (name, articleOptions, allOptions, handleDropdownChange) => {
    const articleUnique = articleOptions.filter(Boolean);
    const dbOthers = allOptions.filter(
      opt => Boolean(opt) && !articleUnique.includes(opt)
    );

    return (
      <select
        className="form-select form-select-modern"
        name={name}
        value={form[name]}
        onChange={handleDropdownChange}
        required
      >
        <option value="">
          Select {name.charAt(0).toUpperCase() + name.slice(1)}
        </option>

        {articleUnique.map(opt => (
          <option key={`art-${opt}`} value={opt}>
            {opt}
          </option>
        ))}

        <option value="__manual">Other (Manual Entry)</option>

        {dbOthers.map(opt => (
          <option key={`db-${opt}`} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  };
const [submitting, setSubmitting] = useState(false);

  // -- Form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (submitting) return;            // ✅ double-click guard
//   setSubmitting(true);

//     if (Object.entries(fieldErrors).some(([key, val]) => val && form[key] !== "")) {
//       toast.error("Fix field errors before submitting!");
//       return;
//     }

//     if (!form.size) {
//       toast.error("Size is required");
//       return;
//     }
//     if (!form.cartons) {
//       toast.error("Cartons is required");
//       return;
//     }
//     if (!form.pairPerCarton) {
//       toast.error("Pair/Carton is required");
//       return;
//     }

    
//    if (manualSize) {
//   const size = form.size.trim().toUpperCase();
  
//   // Numeric format (5X8)
//   const numericMatch = size.match(/^(\d+)[Xx](\d+)$/);
//   if (numericMatch) {
//     const [, w, h] = numericMatch;
//     const wNum = parseInt(w, 10);
//     const hNum = parseInt(h, 10);
//     if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
//       toast.error("Width and Height must be between 1 and 20");
//       return;
//     }
//     form.size = `${wNum}X${hNum}`;
//   }
//   // Pure alphabets - no max limit
//   else if (/^[A-Z]+$/.test(size)) {
//     form.size = size;
//   }
//   else {
//     toast.error("Size must be 5X8 or letters only (S/M/L/XL)");
//     return;
//   }
// }

//     if (manualColor && !form.color.trim()) {
//       toast.error("Color is required");
//       return;
//     }

//     if (
//       isNaN(form.cartons) ||
//       isNaN(form.pairPerCarton) ||
//       parseInt(form.cartons, 10) <= 0 ||
//       parseInt(form.pairPerCarton, 10) <= 0
//     ) {
//       toast.error("Cartons and Pair/Carton must be positive integers");
//       return;
//     }

//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => {
//       if (k === 'image' && !v) return;
//       fd.append(k, v);
//     });

//     try {
//       await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//       toast.success('Product added!');
//       setForm(initialForm);
//       setManualSize(false);
//       setManualColor(false);
//       setImagePreview(null);
//       articleRef.current?.focus();
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     } catch {
//       toast.error('Failed to add product');
//     }finally {
//     setSubmitting(false);           // ✅ re-enable after response
//   }
//   };
// -- Form submit (FULLY FIXED VERSION)
const handleSubmit = async (e) => {
  e.preventDefault();
  if (submitting) return;
  setSubmitting(true);

  if (Object.entries(fieldErrors).some(([key, val]) => val && form[key] !== "")) {
    toast.error("Fix field errors before submitting!");
    setSubmitting(false);
    return;
  }

  if (!form.size) {
    toast.error("Size is required");
    setSubmitting(false);
    return;
  }
  if (!form.cartons) {
    toast.error("Cartons is required");
    setSubmitting(false);
    return;
  }
  if (!form.pairPerCarton) {
    toast.error("Pair/Carton is required");
    setSubmitting(false);
    return;
  }

  // Size validation (tumhara code same)
  if (manualSize) {
    const size = form.size.trim().toUpperCase();
    const numericMatch = size.match(/^(\d+)[Xx](\d+)$/);
    if (numericMatch) {
      const [, w, h] = numericMatch;
      const wNum = parseInt(w, 10);
      const hNum = parseInt(h, 10);
      if (wNum < 1 || wNum > 20 || hNum < 1 || hNum > 20) {
        toast.error("Width and Height must be between 1 and 20");
        setSubmitting(false);
        return;
      }
      form.size = `${wNum}X${hNum}`;
    } else if (/^[A-Z]+$/.test(size)) {
      form.size = size;
    } else {
      toast.error("Size must be 5X8 or letters only (S/M/L/XL)");
      setSubmitting(false);
      return;
    }
  }

  if (manualColor && !form.color.trim()) {
    toast.error("Color is required");
    setSubmitting(false);
    return;
  }

  if (
    isNaN(form.cartons) ||
    isNaN(form.pairPerCarton) ||
    parseInt(form.cartons, 10) <= 0 ||
    parseInt(form.pairPerCarton, 10) <= 0
  ) {
    toast.error("Cartons and Pair/Carton must be positive integers");
    setSubmitting(false);
    return;
  }

  const fd = new FormData();
  Object.entries(form).forEach(([k, v]) => {
    if (k === 'image' && !v) return;
    fd.append(k, v);
  });

  // ✅ DEBUG LOGS
  console.log('🚀 SUBMITTING FormData:');
  for (let [key, value] of fd.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await api.post('/products', fd, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    });
    console.log('✅ SUCCESS:', response.data);
    
    toast.success('Product added!');
    setForm(initialForm);
    setManualSize(false);
    setManualColor(false);
    setImagePreview(null);
    articleRef.current?.focus();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error) {
    console.error('❌ FULL ERROR:', error);
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
    toast.error(`Failed: ${error.response?.data?.error || error.message}`);
  } finally {
    setSubmitting(false);
  }
};


  return (
    <div className="dashboard-bg min-vh-100 py-4">
      <style>{`
        .dashboard-bg {
          background: linear-gradient(135deg, #f8fbfd 0%, #e9eafc 60%, #f1f4fc 100%);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .product-form-card {
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 15px 50px 0 rgba(85,76,219,0.1), 0 4px 16px rgba(60,72,126,0.15);
          border: none;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
        }
        
        .form-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
          position: relative;
        }
        
        .form-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        
        .header-logo-container {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          backdrop-filter: blur(10px);
          border: 3px solid rgba(255, 255, 255, 0.3);
          padding: 10px;
        }
        
        .header-logo {
          width: 100%;
          height: 100%;
          object-fit: contain;
          border-radius: 50%;
        }
        
        .form-section {
          padding: 2rem;
        }
        
        .form-label-modern {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
        }
        
        .form-label-icon {
          margin-right: 0.5rem;
          color: #667eea;
        }
        
        .form-control-modern {
          background: #f8faff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .form-control-modern:focus {
          background: #ffffff;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          outline: none;
          transform: translateY(-1px);
        }
        
        .form-select-modern {
          background: #f8faff;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
          font-size: 1rem;
          font-weight: 500;
        }
        
        .form-select-modern:focus {
          background: #ffffff;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          outline: none;
        }
        
        .form-control-modern:disabled,
        .form-select-modern:disabled {
          background: #e2e8f0;
          color: #718096;
          cursor: not-allowed;
        }
        
        .autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }
        
        .autocomplete-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
          font-weight: 500;
        }
        
        .autocomplete-item:hover {
          background: #f8faff;
          color: #667eea;
        }
        
        .autocomplete-item:last-child {
          border-bottom: none;
        }
        
        .image-preview-container {
          background: #f8faff;
          border: 2px dashed #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }
        
        .image-preview-container:hover {
          border-color: #667eea;
          background: #f0f4fc;
        }
        
        .image-preview {
          max-height: 120px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .btn-submit-modern {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 1rem 2rem;
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .btn-submit-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .btn-submit-modern:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          color: white;
        }
        
        .btn-submit-modern:hover::before {
          left: 100%;
        }
        
        .invalid-feedback {
          display: block;
          color: #e53e3e;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        
        .is-invalid {
          border-color: #e53e3e !important;
          box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1) !important;
        }
        
        .required-asterisk {
          color: #e53e3e;
          margin-left: 0.25rem;
        }
        
        .field-group {
          margin-bottom: 1.5rem;
        }
        
        /* 🚀 NEW CSS - YAHAN ADD KARO (style tag ke last mein) */
.autocomplete-item.selected {
  background: #f0f8ff !important;
  color: #1e40af !important;
}

        @media (max-width: 768px) {
          .product-form-card { margin: 1rem; }
          .form-header { padding: 1.5rem; }
          .form-section { padding: 1.5rem; }
          .header-logo-container { width: 60px; height: 60px; }
          .btn-submit-modern { width: 100%; }
        }
      `}</style>

      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-12">
            <div className="product-form-card">
              {/* Header */}
              <div className="form-header">
                <div className="header-logo-container" style={{ fontSize: '36px' }}>
                  📦
                </div>
                <h1 className="mb-2">Add New Product</h1>
                <p className="mb-0 opacity-75">Create a new product entry with detailed specifications</p>
              </div>

              {/* Form Body */}
              <div className="form-section">
                <form onSubmit={handleSubmit} encType="multipart/form-data">
                  <div className="row">
                    {/* Article Name - Full Width */}
                    <div className="col-12 field-group position-relative">
                      <label className="form-label-modern">
                        <i className="bi bi-tag form-label-icon"></i>
                        Article Name<span className="required-asterisk">*</span>
                      </label>
                      <input
  type="text"
  className="form-control form-control-modern"
  name="article"
  value={form.article}
  onChange={handleChange}
  autoComplete="off"
  ref={articleRef}
  required
  placeholder="Enter article name..."
  onFocus={() => setShowArticleSuggestions(true)}
  onKeyDown={(e) => {
    if (!articleSuggestions.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => 
        prev < articleSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => 
        prev > 0 ? prev - 1 : 0
      );
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleArticleChoose(articleSuggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Enter') {
      handleSubmit(e); // Normal form submit if no selection
    }
  }}
/>

                      {!!articleSuggestions.length && showArticleSuggestions && (
                        <div className="autocomplete-dropdown">
                         {articleSuggestions.map((opt, index) => (
  <div
    key={opt}
    onMouseDown={() => handleArticleChoose(opt)}
    className={`autocomplete-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
    style={index === selectedSuggestionIndex ? { background: '#f0f8ff', color: '#1e40af' } : {}}
  >
    {opt}
  </div>
))}

                        </div>
                      )}
                    </div>

                    {/* Stock Type — dynamic, user can type their own */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-layers form-label-icon"></i>
                        Stock Type<span className="required-asterisk">*</span>
                      </label>
                      <input
                        list="stockTypeDatalist"
                        className="form-control form-select-modern"
                        name="stockType"
                        value={form.stockType}
                        onChange={handleChange}
                        disabled={freeze.stockType}
                        placeholder="Type or select (e.g. PU, EVA)"
                        required
                        autoComplete="off"
                      />
                      <datalist id="stockTypeDatalist">
                        {stockTypeList.map(t => (
                          <option key={t} value={t} />
                        ))}
                      </datalist>
                      {stockTypeList.length === 0 && (
                        <small className="text-muted">Pehli baar type karo, baad mein dropdown mein aayega</small>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-people form-label-icon"></i>
                        Gender<span className="required-asterisk">*</span>
                      </label>
                      <select 
                        className="form-select form-select-modern" 
                        name="gender" 
                        value={form.gender} 
                        onChange={handleChange} 
                        required
                      >
                        <option value="">Select Gender</option>
                        {allowedGenders.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Image Upload - Full Width */}
                    <div className="col-12 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-image form-label-icon"></i>
                        Product Image
                      </label>
                      <div className="image-preview-container">
                        {imagePreview ? (
                          <div className="mb-3">
                            <img src={imagePreview} alt="Preview" className="image-preview" />
                          </div>
                        ) : (
                          <div className="text-muted mb-3">
                            <i className="bi bi-cloud-upload fs-2 d-block mb-2"></i>
                            No image selected
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="form-control form-control-modern" 
                          name="image" 
                          accept="image/*"   
                          ref={fileInputRef}  
                          onChange={handleChange} 
                          disabled={freeze.image} 
                        />
                      </div>
                    </div>

                    {/* Size */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-rulers form-label-icon"></i>
                        Size<span className="required-asterisk">*</span>
                      </label>
                      {!manualSize ? (
                        renderDropdown('size', articleSizes, allSizes, handleSizeChange)
                      ) : (
                        <>
                          <input
                            type="text"
                            className={`form-control form-control-modern ${fieldErrors.size ? "is-invalid" : ""}`}
                           placeholder="Enter Size (e.g., 5X8 or S/M/L/XL)"

                            name="size"
                            value={form.size}
                            onChange={(e) => {
                              let val = e.target.value.replace(/x/g, "X");
                              setForm(f => ({ ...f, size: val }));
                            }}
                            required
                            onBlur={(e) => {
                              const err = checkFieldValid("size", e.target.value);
                              setFieldErrors(f => ({ ...f, size: err }));
                              if (err && e.target.value !== "") {
                                setTimeout(() => document.getElementsByName("size")[0]?.focus(), 0);
                              }
                            }}
                          />
                          {fieldErrors.size && (
                            <div className="invalid-feedback">{fieldErrors.size}</div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Color */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-palette form-label-icon"></i>
                        Color<span className="required-asterisk">*</span>
                      </label>
                      {!manualColor ? (
                        renderDropdown('color', articleColors, allColors, handleColorChange)
                      ) : (
                        <input
                          type="text"
                          className="form-control form-control-modern"
                          placeholder="Enter Color"
                          name="color"
                          value={form.color}
                          onChange={handleChange}
                          required
                          onBlur={e => handleBlur("color", e.target.value)} 
                        />
                      )}
                    </div>

                    {/* Pair per Carton */}
                    <div className="col-md-4 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-box form-label-icon"></i>
                        Pair/Carton<span className="required-asterisk">*</span>
                      </label>
                      <input 
                        type="number" 
                        className={`form-control form-control-modern ${fieldErrors.pairPerCarton ? "is-invalid" : ""}`} 
                        name="pairPerCarton" 
                        value={form.pairPerCarton} 
                        onChange={handleChange} 
                        disabled={freeze.pairPerCarton} 
                        required
                        placeholder="Enter pairs per carton..."
                        onBlur={e => handleBlur("pairPerCarton", e.target.value)}
                      />
                      {fieldErrors.pairPerCarton && <div className="invalid-feedback">{fieldErrors.pairPerCarton}</div>}
                    </div>

                    {/* Series */}
                    <div className="col-md-4 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-collection form-label-icon"></i>
                        Series
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-modern" 
                        name="series" 
                        value={form.series} 
                        onChange={handleChange} 
                        disabled={freeze.series} 
                        placeholder="Enter series..."
                      />
                    </div>

                    {/* Cartons */}
                    <div className="col-md-4 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-boxes form-label-icon"></i>
                        No. of Cartons<span className="required-asterisk">*</span>
                      </label>
                      <input 
                        type="number" 
                        className={`form-control form-control-modern ${fieldErrors.cartons ? "is-invalid" : ""}`} 
                        name="cartons" 
                        value={form.cartons} 
                        onChange={handleChange} 
                        required
                        placeholder="Enter number of cartons..."
                        onBlur={e => handleBlur("cartons", e.target.value)} 
                      />
                      {fieldErrors.cartons && <div className="invalid-feedback">{fieldErrors.cartons}</div>}
                    </div>

                    {/* MRP */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-currency-rupee form-label-icon"></i>
                        MRP<span className="required-asterisk">*</span>
                      </label>
                      <input 
                        type="number" 
                        className={`form-control form-control-modern ${fieldErrors.mrp ? "is-invalid" : ""}`} 
                        name="mrp" 
                        value={form.mrp} 
                        onChange={handleChange} 
                        disabled={freeze.mrp} 
                        required
                        placeholder="Enter MRP..."
                        onBlur={e => handleBlur("mrp", e.target.value)}
                        min="3" 
                        max="10000"
                      />
                      {fieldErrors.mrp && <div className="invalid-feedback">{fieldErrors.mrp}</div>}
                    </div>

                    {/* Rate */}
                    <div className="col-md-6 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-cash form-label-icon"></i>
                        Rate<span className="required-asterisk">*</span>
                      </label>
                      <input 
                        type="number"
                        step="0.01"
                        className={`form-control form-control-modern ${fieldErrors.rate ? "is-invalid" : ""}`}
                        name="rate" 
                        value={form.rate}
                        onChange={handleChange} 
                        disabled={freeze.rate} 
                        required
                        placeholder="Enter rate..."
                        onBlur={e => handleBlur("rate", e.target.value)}
                        max="10000"
                      />
                      {fieldErrors.rate && <div className="invalid-feedback">{fieldErrors.rate}</div>}
                    </div>

                    {/* Created By */}
                    <div className="col-12 field-group">
                      <label className="form-label-modern">
                        <i className="bi bi-person-check form-label-icon"></i>
                        Created By<span className="required-asterisk">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-modern" 
                        name="createdBy" 
                        value={form.createdBy} 
                        onChange={handleChange} 
                        required 
                        placeholder="Enter creator name..."
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 text-center mt-4">
                      <button type="submit" className="btn-submit-modern">
                        <i className="bi bi-plus-circle me-2"></i>
                        Save Product
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
