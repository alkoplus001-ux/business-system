

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { FaPlus, FaTrash, FaSave, FaTimes, FaSpinner, FaFilePdf, FaImages } from 'react-icons/fa';
// import { createPortal } from 'react-dom';
// import api from '../utils/api';
// import './ChallanForm.css';

// // Local helper, NOT exported separately
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

// const ChallanForm = () => {
//   const navigate = useNavigate();
//   const [saving, setSaving] = useState(false);
//   const [downloadingPDF, setDownloadingPDF] = useState(false);
//   const [downloadingProductsPDF, setDownloadingProductsPDF] = useState(false);
//   const [articleVariants, setArticleVariants] = useState({});
//   const [loadingVariants, setLoadingVariants] = useState({});
//   const [stockAvailability, setStockAvailability] = useState({});
//   const [lastCreatedChallanId, setLastCreatedChallanId] = useState(null);

//   const articleInputRefs = useRef({});

//   const [formData, setFormData] = useState({
//     partyName: '',
//     date: new Date().toISOString().split('T')[0],
//     invoiceNo: '',
//     station: '',
//     transport: '',
//     marka: '',
//     items: [{
//       article: '',
//       size: '',
//       color: '',
//       cartons: '',
//       pairPerCarton: 0,
//       rate: 0,
//       totalPair: 0,
//       amount: 0
//     }]
//   });

//   useEffect(() => {
//     const fetchLatestInvoice = async () => {
//       try {
//         const res = await api.get('/challans/latest-invoice');
//         const nextNumber = (res.data.invoice || 0) + 1;
//         setFormData(prev => ({ ...prev, invoiceNo: `${nextNumber}/${new Date().getFullYear()}` }));
//       } catch {
//         setFormData(prev => ({ ...prev, invoiceNo: `1/${new Date().getFullYear()}` }));
//       }
//     };
//     fetchLatestInvoice();
//   }, []);

//   const debounce = (func, delay) => {
//     let t;
//     return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), delay); };
//   };

//   const fetchArticleVariants = async (article, index, isBlur = false) => {
//     if (!article.trim()) { setArticleVariants(p => ({ ...p, [index]: [] })); return; }
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
//         params: { article: article.trim().toUpperCase(), size: size.trim(), color: color.trim().toUpperCase() }
//       });
//       setStockAvailability(p => ({ ...p, [index]: res.data.availableCartons || 0 }));
//     } catch {
//       setStockAvailability(p => ({ ...p, [index]: 0 }));
//     }
//   };

//   const handleItemChange = (index, e) => {
//     const { name, value } = e.target;
//     const newItems = [...formData.items];

//     if (name === 'article' || name === 'partyName' || name === 'station' || name === 'transport' || name === 'marka') {
//       newItems[index][name] = value.toUpperCase();
//     } else {
//       newItems[index][name] = name === 'cartons' || name === 'rate' ? parseFloat(value) || 0 : value;
//     }

//     if (name === 'article') {
//       debouncedFetch(value, index);
//       newItems[index].size = '';
//       newItems[index].color = '';
//       newItems[index].pairPerCarton = 0;
//       newItems[index].rate = 0;
//     }

//     if (name === 'size') {
//       newItems[index].color = '';
//       const variants = articleVariants[index] || [];
//       const sizeVariants = variants.filter(v => v.size === value);
//       if (sizeVariants.length === 1) {
//         newItems[index].color = sizeVariants[0].color;
//         newItems[index].pairPerCarton = sizeVariants[0].pairPerCarton;
//         newItems[index].rate = sizeVariants[0].rate;
//       }
//     }

//     if (name === 'color') {
//       const variants = articleVariants[index] || [];
//       const selectedVariant = variants.find(v => v.size === newItems[index].size && v.color === value);
//       if (selectedVariant) {
//         newItems[index].pairPerCarton = selectedVariant.pairPerCarton;
//         newItems[index].rate = selectedVariant.rate;
//       }
//     }

//     if (name === 'article' || name === 'size' || name === 'color') {
//       const { article, size, color } = newItems[index];
//       fetchStockAvailability((article || '').trim().toUpperCase(), (size || '').trim(), (color || '').trim().toUpperCase(), index);
//     }

//     if (name === 'cartons') {
//       const cartonsVal = parseInt(value) || 0;
//       const available = stockAvailability[index] ?? 0;
//       if (cartonsVal < 0) { toast.warning('Cartons negative नहीं हो सकते', { position: 'top-center' }); return; }
//       if (cartonsVal > available && available > 0) { toast.warning(`Available से ज्यादा cartons नहीं डाल सकते! Available: ${available}`); return; }
//       newItems[index].cartons = cartonsVal;
//     }

//     newItems[index].totalPair = newItems[index].cartons * newItems[index].pairPerCarton;
//     newItems[index].amount = newItems[index].totalPair * newItems[index].rate;

//     setFormData(prev => ({ ...prev, items: newItems }));
//   };

//   const addItemRow = () => {
//     setFormData(prev => ({
//       ...prev,
//       items: [...prev.items, { article: '', size: '', color: '', cartons: '', pairPerCarton: 0, rate: 0, totalPair: 0, amount: 0 }]
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

//   const downloadChallanPDF = async (challanId, invoiceNo) => {
//     setDownloadingPDF(true);
//     try {
//       const pdfResponse = await api.get(`/challan-pdf/${challanId}`, { responseType: 'blob', timeout: 45000, headers: { 'Accept': 'application/pdf' } });
//       if (!pdfResponse.data || pdfResponse.data.size < 1024) throw new Error('Invalid PDF received from server');
//       const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
//       const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url; a.download = `challan-${safeInvoiceNo}.pdf`;
//       document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
//       toast.success('Challan PDF downloaded successfully!');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.status === 404 ? 'PDF generation service unavailable' : 'Challan PDF download failed: ' + err.message);
//     } finally { setDownloadingPDF(false); }
//   };

//   const downloadProductsPDF = async (challanId, invoiceNo) => {
//     setDownloadingProductsPDF(true);
//     try {
//       const pdfResponse = await api.get(`/challan-pdf/${challanId}/products`, { responseType: 'blob', timeout: 60000, headers: { 'Accept': 'application/pdf' } });
//       if (!pdfResponse.data || pdfResponse.data.size < 1024) throw new Error('Invalid products PDF received from server');
//       const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
//       const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url; a.download = `challan-products-${safeInvoiceNo}.pdf`;
//       document.body.appendChild(a); a.click();
//       setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
//       toast.success('Products PDF downloaded successfully!');
//     } catch (err) {
//       console.error(err);
//       toast.error(err.response?.status === 404 ? 'Products not found for this challan' : 'Products PDF download failed: ' + err.message);
//     } finally { setDownloadingProductsPDF(false); }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     let challanCreated = false;
//     try {
//       if (!formData.partyName || !formData.station || !formData.transport) throw new Error('Please fill all required fields');
//       for (let item of formData.items) {
//         if (!item.article || !item.size || !item.color || !item.cartons || item.cartons === 0 || !item.rate) {
//           throw new Error('Please fill all item details');
//         }
//       }

//       const stockCheckPayload = formData.items.map(item => ({
//         article: item.article.trim().toUpperCase(),
//         size: item.size.trim(),
//         color: item.color.trim().toUpperCase(),
//         requiredCartons: item.cartons
//       }));

//       const stockResponse = await api.post('/challans/stock-check', stockCheckPayload);
//       if (stockResponse.data.hasErrors) {
//         stockResponse.data.errors.forEach(error => toast.error(`Stock Issue: ${error.message}`, { autoClose: 10000, position: 'top-center' }));
//         throw new Error('Cannot create challan due to stock issues');
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

//       const response = await api.post('/challans', payload);
//       if (!response.data.success) throw new Error(response.data.error || 'Failed to create challan');

//       challanCreated = true;
//       const challanId = response.data.data?._id || response.data.data?.id || response.data._id || response.data.id;
//       if (!challanId) throw new Error('Challan ID not found in response');

//       setLastCreatedChallanId(challanId);
//       toast.success('Challan created successfully! 🎉');

//       try { await downloadChallanPDF(challanId, formData.invoiceNo); }
//       catch { toast.warning('Challan created but auto PDF download failed'); }

//       try {
//         const newInvoiceRes = await api.get('/challans/latest-invoice');
//         const nextNumber = (newInvoiceRes.data.invoice || 0) + 1;
//         setFormData({
//           partyName: '',
//           date: new Date().toISOString().split('T')[0],
//           invoiceNo: `${nextNumber}/${new Date().getFullYear()}`,
//           station: '',
//           transport: '',
//           marka: '',
//           items: [{ article: '', size: '', color: '', cartons: '', pairPerCarton: 0, rate: 0, totalPair: 0, amount: 0 }]
//         });
//         setStockAvailability({}); setArticleVariants({});
//       } catch { toast.warning('Invoice number reset failed'); }

//       toast.success(
//         <div>
//           <strong>Challan Created Successfully!</strong>
//           <br />
//           <small>You can now download products PDF from the buttons below.</small>
//         </div>,
//         { autoClose: 5000 }
//       );
//     } catch (err) {
//       toast.error(challanCreated ? 'Challan created but post-creation actions failed' : (err.response?.data?.error || err.message), {
//         position: 'top-center', autoClose: 5000
//       });
//     } finally { setSaving(false); }
//   };

//   const totals = calculateTotals();

//   const [partySuggestions, setPartySuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const fetchPartyNames = async (search) => {
//     if (!search) { setPartySuggestions([]); setShowSuggestions(false); return; }
//     try {
//       const res = await api.get(`/challans/party-names?search=${search}`);
//       setPartySuggestions(res.data.data); setShowSuggestions(true);
//     } catch (err) { console.error(err); }
//   };

//   const [articleSuggestions, setArticleSuggestions] = useState({});
//   const [showArticleDropdown, setShowArticleDropdown] = useState({});
//   const fetchArticleSuggestions = async (search, index) => {
//     if (!search) { setArticleSuggestions(p => ({ ...p, [index]: [] })); return; }
//     try {
//       const res = await api.get(`/challans/article-suggestions?search=${search}`);
//       setArticleSuggestions(p => ({ ...p, [index]: res.data.data }));
//       setShowArticleDropdown(p => ({ ...p, [index]: true }));
//     } catch (err) { console.error(err); }
//   };
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaSave, FaTimes, FaSpinner, FaFilePdf, FaImages } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import api from '../utils/api';
import './ChallanForm.css';

// Local helper, NOT exported separately
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
    boxShadow: '0 8px 20px rgba(0,0,0,.15)'
  };
  return createPortal(<div style={style}>{children}</div>, document.body);
}

const ChallanForm = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingProductsPDF, setDownloadingProductsPDF] = useState(false);
  const [articleVariants, setArticleVariants] = useState({});
  const [loadingVariants, setLoadingVariants] = useState({});
  const [stockAvailability, setStockAvailability] = useState({});
  const [lastCreatedChallanId, setLastCreatedChallanId] = useState(null);

  const articleInputRefs = useRef({});

  const [formData, setFormData] = useState({
    partyName: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNo: '',
    station: '',
    transport: '',
    marka: '',
    isInterState: false,
    gstPercent: 0,
    items: [{
      article: '',
      size: '',
      color: '',
      cartons: '',
      pairPerCarton: 0,
      rate: 0,
      totalPair: 0,
      amount: 0
    }]
  });

  useEffect(() => {
    const fetchLatestInvoice = async () => {
      try {
        const res = await api.get('/challans/latest-invoice');
        const nextNumber = (res.data.invoice || 0) + 1;
        setFormData(prev => ({ ...prev, invoiceNo: `${nextNumber}/${new Date().getFullYear()}` }));
      } catch {
        setFormData(prev => ({ ...prev, invoiceNo: `1/${new Date().getFullYear()}` }));
      }
    };
    fetchLatestInvoice();
  }, []);

  const debounce = (func, delay) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => func(...args), delay); };
  };

  const fetchArticleVariants = async (article, index, isBlur = false) => {
    if (!article.trim()) { setArticleVariants(p => ({ ...p, [index]: [] })); return; }
    setLoadingVariants(p => ({ ...p, [index]: true }));
    try {
      const response = await api.get(`/challans/article/${article}/variants`);
      setArticleVariants(p => ({ ...p, [index]: response.data.data }));
      if (response.data.data.length === 0 && isBlur) {
        toast.warning(`"${article}" article not found in database`, { autoClose: 3000, position: 'top-center' });
      }
    } catch (err) {
      if (isBlur) toast.error(err.response?.data?.error || `"${article}" not found`, { autoClose: 3000, position: 'top-center' });
      setArticleVariants(p => ({ ...p, [index]: [] }));
    } finally {
      setLoadingVariants(p => ({ ...p, [index]: false }));
    }
  };
  const debouncedFetch = debounce(fetchArticleVariants, 500);

  const fetchStockAvailability = async (article, size, color, index) => {
    if (!article || !size || !color) return;
    try {
      const res = await api.get('/challans/stock-available', {
        params: { article: article.trim().toUpperCase(), size: size.trim(), color: color.trim().toUpperCase() }
      });
      //setStockAvailability(p => ({ ...p, [index]: res.data.availableCartons || 0 }));
      setStockAvailability(p => ({
  ...p,
  [index]: res.data.availableCartons
}));

if (res.data.warning) {
  toast.warning(res.data.warningMessage, {
    position: 'top-center',
    autoClose: 2500
  });
}

    } catch {
     // setStockAvailability(p => ({ ...p, [index]: 0 }));
     
  setStockAvailability(p => ({ ...p, [index]: null }));


    }
  };
// ⌨️ Keyboard Shortcuts (Submit + Products PDF)
useEffect(() => {
  const handleShortcutKeys = (e) => {
    // CTRL + S → Submit / Create Challan
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();

      if (saving) return;

      // form submit trigger
      const form = document.querySelector('form');
      if (form) {
        form.requestSubmit();
      }

      toast.info('💾 Challan submit ho raha hai (Ctrl + S)', {
        position: 'top-center',
        autoClose: 1500
      });
    }

    // CTRL + P → Download Products PDF
    if (e.ctrlKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();

      if (downloadingProductsPDF) return;

      if (!lastCreatedChallanId) {
        toast.warning('⚠️ Pehle challan create karo', {
          position: 'top-center',
          autoClose: 2500
        });
        return;
      }

      downloadProductsPDF(lastCreatedChallanId, formData.invoiceNo);
    }
  };

  document.addEventListener('keydown', handleShortcutKeys);
  return () => document.removeEventListener('keydown', handleShortcutKeys);
}, [saving, downloadingProductsPDF, lastCreatedChallanId, formData.invoiceNo]);

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...formData.items];

    if (name === 'article' || name === 'partyName' || name === 'station' || name === 'transport' || name === 'marka') {
      newItems[index][name] = value.toUpperCase();
    } else {
         newItems[index][name] =
  name === 'rate' ? parseFloat(value) || 0 : value;

      //  newItems[index][name] = name === 'cartons' || name === 'rate' ? parseFloat(value) || 0 : value;
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
      const sizeVariants = variants.filter(v => v.size === value);
      if (sizeVariants.length === 1) {
        newItems[index].color = sizeVariants[0].color;
        newItems[index].pairPerCarton = sizeVariants[0].pairPerCarton;
        newItems[index].rate = sizeVariants[0].rate;
      }
    }

    if (name === 'color') {
      const variants = articleVariants[index] || [];
      const selectedVariant = variants.find(v => v.size === newItems[index].size && v.color === value);
      if (selectedVariant) {
        newItems[index].pairPerCarton = selectedVariant.pairPerCarton;
        newItems[index].rate = selectedVariant.rate;
      }
    }

    if (name === 'article' || name === 'size' || name === 'color') {
      const { article, size, color } = newItems[index];
      fetchStockAvailability((article || '').trim().toUpperCase(), (size || '').trim(), (color || '').trim().toUpperCase(), index);
    }

    if (name === 'cartons') {
      const cartonsVal = parseInt(value) || 0;
      const available = stockAvailability[index] ?? 0;
      if (cartonsVal < 0) { toast.warning('Cartons negative नहीं हो सकते', { position: 'top-center' }); return; }
      //if (cartonsVal > available && available > 0) { toast.warning(`Available से ज्यादा cartons नहीं डाल सकते! Available: ${available}`); return; }
      if (cartonsVal > available && available >= 0) {
  toast.warning(
    `⚠️ Stock negative ho jayega (Available: ${available})`,
    { position: 'top-center', autoClose: 3000 }
  );
  // ❌ return mat karo
}

      newItems[index].cartons = cartonsVal;
    }

    newItems[index].totalPair = newItems[index].cartons * newItems[index].pairPerCarton;
    newItems[index].amount = newItems[index].totalPair * newItems[index].rate;

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const addItemRow = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { article: '', size: '', color: '', cartons: '', pairPerCarton: 0, rate: 0, totalPair: 0, amount: 0 }]
    }));
  }, []);

  const removeItemRow = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, items: newItems }));
      const nv = { ...articleVariants }; delete nv[index]; setArticleVariants(nv);
      const ns = { ...stockAvailability }; delete ns[index]; setStockAvailability(ns);
    }
  };

  // Ctrl+Enter -> add row
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        addItemRow();
        toast.info('New item row added (Ctrl+Enter).', { autoClose: 1500 });
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addItemRow]);

  const calculateTotals = () => {
    const base = formData.items.reduce((acc, item) => ({
      totalCartons: acc.totalCartons + (parseInt(item.cartons) || 0),
      totalPairs:   acc.totalPairs   + (item.totalPair || 0),
      totalAmount:  acc.totalAmount  + (item.amount || 0)
    }), { totalCartons: 0, totalPairs: 0, totalAmount: 0 });

    const gst     = Number(formData.gstPercent) || 0;
    const half    = gst / 2;
    const cgst    = formData.isInterState ? 0 : base.totalAmount * half / 100;
    const sgst    = formData.isInterState ? 0 : base.totalAmount * half / 100;
    const igst    = formData.isInterState ? base.totalAmount * gst / 100 : 0;
    const gstAmt  = cgst + sgst + igst;
    return { ...base, gst, cgst, sgst, igst, gstAmt, grandTotal: base.totalAmount + gstAmt };
  };

  const downloadChallanPDF = async (challanId, invoiceNo) => {
    setDownloadingPDF(true);
    try {
      const pdfResponse = await api.get(`/challan-pdf/${challanId}`, { responseType: 'blob', timeout: 45000, headers: { 'Accept': 'application/pdf' } });
      if (!pdfResponse.data || pdfResponse.data.size < 1024) throw new Error('Invalid PDF received from server');
      const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `challan-${safeInvoiceNo}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
      toast.success('Challan PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.status === 404 ? 'PDF generation service unavailable' : 'Challan PDF download failed: ' + err.message);
    } finally { setDownloadingPDF(false); }
  };

  const downloadProductsPDF = async (challanId, invoiceNo) => {
    setDownloadingProductsPDF(true);
    try {
      const pdfResponse = await api.get(`/challan-pdf/${challanId}/products`, { responseType: 'blob', timeout: 60000, headers: { 'Accept': 'application/pdf' } });
      if (!pdfResponse.data || pdfResponse.data.size < 1024) throw new Error('Invalid products PDF received from server');
      const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `challan-products-${safeInvoiceNo}.pdf`;
      document.body.appendChild(a); a.click();
      setTimeout(() => { document.body.removeChild(a); window.URL.revokeObjectURL(url); }, 100);
      toast.success('Products PDF downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.status === 404 ? 'Products not found for this challan' : 'Products PDF download failed: ' + err.message);
    } finally { setDownloadingProductsPDF(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    let challanCreated = false;
    try {
      if (!formData.partyName || !formData.station || !formData.transport) throw new Error('Please fill all required fields');
      for (let item of formData.items) {
        if (!item.article || !item.size || !item.color || !item.cartons || item.cartons === 0 || !item.rate) {
          throw new Error('Please fill all item details');
        }
      }
      // ⚠️ FINAL WARNING BEFORE SUBMIT (negative stock allowed)
const hasNegativeStock = Object.values(stockAvailability).some(v => v < 0);

if (hasNegativeStock) {
  toast.warning(
    '⚠️ Kuch items me stock negative ho raha hai, challan phir bhi create hoga',
    { position: 'top-center', autoClose: 3500 }
  );
}


      // const stockCheckPayload = formData.items.map(item => ({
      //   article: item.article.trim().toUpperCase(),
      //   size: item.size.trim(),
      //   color: item.color.trim().toUpperCase(),
      //   requiredCartons: item.cartons
      // }));

    //  const stockResponse = await api.post('/challans/stock-check', stockCheckPayload);
    //   if (stockResponse.data.hasErrors) {
    //      stockResponse.data.errors.forEach(error => toast.error(`Stock Issue: ${error.message}`, { autoClose: 10000, position: 'top-center' }));
    //     throw new Error('Cannot create challan due to stock issues');
    //   }

      const t = calculateTotals();
      const payload = {
        ...formData,
        gstPercent:         Number(formData.gstPercent) || 0,
        isInterState:       formData.isInterState || false,
        cgst:               t.cgst,
        sgst:               t.sgst,
        igst:               t.igst,
        totalAmountWithGST: t.grandTotal,
        items: formData.items.map(item => ({
          article:      item.article.toUpperCase(),
          color:        item.color.toUpperCase(),
          size:         item.size,
          cartons:      Number(item.cartons),
          pairPerCarton: Number(item.pairPerCarton),
          rate:         Number(item.rate),
          totalPair:    Number(item.cartons) * Number(item.pairPerCarton),
          amount:       Number(item.cartons) * Number(item.pairPerCarton) * Number(item.rate)
        }))
      };

      const response = await api.post('/challans', payload);
      if (!response.data.success) throw new Error(response.data.error || 'Failed to create challan');

      challanCreated = true;
      const challanId = response.data.data?._id || response.data.data?.id || response.data._id || response.data.id;
      if (!challanId) throw new Error('Challan ID not found in response');

      setLastCreatedChallanId(challanId);
      toast.success('Challan created successfully! 🎉');

      try { await downloadChallanPDF(challanId, formData.invoiceNo); }
      catch { toast.warning('Challan created but auto PDF download failed'); }

      try {
        const newInvoiceRes = await api.get('/challans/latest-invoice');
        const nextNumber = (newInvoiceRes.data.invoice || 0) + 1;
        setFormData({
          partyName: '',
          date: new Date().toISOString().split('T')[0],
          invoiceNo: `${nextNumber}/${new Date().getFullYear()}`,
          station: '',
          transport: '',
          marka: '',
          isInterState: false,
          gstPercent: 0,
          items: [{ article: '', size: '', color: '', cartons: '', pairPerCarton: 0, rate: 0, totalPair: 0, amount: 0 }]
        });
        setStockAvailability({}); setArticleVariants({});
      } catch { toast.warning('Invoice number reset failed'); }

      toast.success(
        <div>
          <strong>Challan Created Successfully!</strong>
          <br />
          <small>You can now download products PDF from the buttons below.</small>
        </div>,
        { autoClose: 5000 }
      );
    } catch (err) {
      toast.error(challanCreated ? 'Challan created but post-creation actions failed' : (err.response?.data?.error || err.message), {
        position: 'top-center', autoClose: 5000
      });
    } finally { setSaving(false); }
  };

  const totals = calculateTotals();

  const [partySuggestions, setPartySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const fetchPartyNames = async (search) => {
    if (!search) { setPartySuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await api.get(`/challans/party-names?search=${search}`);
      setPartySuggestions(res.data.data); setShowSuggestions(true);
    } catch (err) { console.error(err); }
  };

  const [articleSuggestions, setArticleSuggestions] = useState({});
  const [showArticleDropdown, setShowArticleDropdown] = useState({});
  const fetchArticleSuggestions = async (search, index) => {
    if (!search) { setArticleSuggestions(p => ({ ...p, [index]: [] })); return; }
    try {
      const res = await api.get(`/challans/article-suggestions?search=${search}`);
      setArticleSuggestions(p => ({ ...p, [index]: res.data.data }));
      setShowArticleDropdown(p => ({ ...p, [index]: true }));
    } catch (err) { console.error(err); }
  };

  
  return (
    <div className="challan-wrapper">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="text-primary mb-1"><FaFilePdf className="me-2" />Create New Challan</h2>
            <p className="text-muted mb-0">Fill in the details to generate challan and products PDF</p>
          </div>

          {lastCreatedChallanId && (
            <div className="pdf-actions">
              <div className="btn-group" role="group">
                <button type="button" className="btn btn-outline-primary" onClick={() => downloadChallanPDF(lastCreatedChallanId, formData.invoiceNo)} disabled={downloadingPDF}>
                  {downloadingPDF ? (<><FaSpinner className="fa-spin me-1" />Downloading...</>) : (<><FaFilePdf className="me-1" />Download Challan PDF</>)}
                </button>
                <button type="button" className="btn btn-outline-success" onClick={() => downloadProductsPDF(lastCreatedChallanId, formData.invoiceNo)} disabled={downloadingProductsPDF}>
                  {downloadingProductsPDF ? (<><FaSpinner className="fa-spin me-1" />Downloading...</>) : (<><FaImages className="me-1" />Download Products PDF</>)}
                </button>
              </div>
              <div className="mt-2"><small className="text-muted">✅ Last created: Invoice #{formData.invoiceNo}</small></div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light"><h5 className="mb-0 text-dark">📋 Party Information</h5></div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Party Name *</label>
                  <div style={{ position: "relative" }}>
                    <input type="text" className="form-control" value={formData.partyName}
                      onChange={(e) => { const val = e.target.value.toUpperCase(); setFormData(p => ({ ...p, partyName: val })); fetchPartyNames(val); }}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onFocus={() => { if (partySuggestions.length) setShowSuggestions(true); }}
                      placeholder="Enter party name" required />
                    {showSuggestions && partySuggestions.length > 0 && (
                      <ul style={{ position: "absolute", top: "100%", left: 0, width: "100%", maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", background: "#fff", zIndex: 1000, listStyle: "none", padding: 0, margin: 0, borderRadius: "0 0 8px 8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)" }}>
                        {partySuggestions.map((name, idx) => (
                          <li key={idx} onMouseDown={() => { setFormData(p => ({ ...p, partyName: name })); setShowSuggestions(false); }}
                              style={{ padding: "12px 16px", cursor: "pointer", borderBottom: idx < partySuggestions.length - 1 ? "1px solid #f0f0f0" : "none" }}
                              onMouseOver={e => e.currentTarget.style.background = "#f8f9fa"} onMouseOut={e => e.currentTarget.style.background = "#fff"}>
                            {name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Invoice No *</label>
                  <input type="text" className="form-control bg-light" value={formData.invoiceNo} readOnly />
                  <small className="text-muted">Auto-generated</small>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Date *</label>
                  <input type="date" className="form-control bg-light" value={formData.date} readOnly />
                  <small className="text-muted">Today's date</small>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark">📦 Product Items</h5>
              <button type="button" className="btn btn-primary btn-sm" onClick={addItemRow}><FaPlus className="me-1" /> Add Item</button>
            </div>
            <div className="card-body p-0">
              <div className="challan-items-scroll">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>Article *</th><th>Size *</th><th>Color *</th><th>Cartons *</th><th>Pair/Crtn</th><th>Rate *</th><th>Amount</th><th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const variants = articleVariants[index] || [];
                        const sizes = [...new Set(variants.map(v => v.size))];
                        const colors = [...new Set(variants.filter(v => v.size === item.size).map(v => v.color))];
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'table-light' : ''}>
                            <td style={{ position: "relative", minWidth: "180px" }}>
                              <input
                                ref={(el) => (articleInputRefs.current[index] = el)}
                                type="text" className="form-control form-control-sm" value={item.article}
                                onChange={(e) => { handleItemChange(index, e); fetchArticleSuggestions(e.target.value.toUpperCase(), index); }}
                                onBlur={() => setTimeout(() => setShowArticleDropdown(prev => ({ ...prev, [index]: false })), 200)}
                                onFocus={() => { if (articleSuggestions[index]?.length) setShowArticleDropdown(prev => ({ ...prev, [index]: true })); }}
                                name="article" placeholder="Enter article" autoComplete="off" required
                              />
                              {showArticleDropdown[index] && articleSuggestions[index]?.length > 0 && (
                                <SuggestionPortal anchorEl={articleInputRefs.current[index]}>
                                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                                    {articleSuggestions[index].map((art, i) => (
                                      <li key={i}
                                          onMouseDown={() => {
                                            const ev = { target: { name: "article", value: art } };
                                            handleItemChange(index, ev);
                                            setShowArticleDropdown(prev => ({ ...prev, [index]: false }));
                                            fetchArticleVariants(art, index, true);
                                          }}
                                          style={{ padding: "10px 12px", cursor: "pointer", borderBottom: i < articleSuggestions[index].length - 1 ? "1px solid #f0f0f0" : "none" }}
                                          onMouseOver={e => e.currentTarget.style.background = "#f8f9fa"}
                                          onMouseOut={e => e.currentTarget.style.background = "#fff"}
                                      >
                                        {art}
                                      </li>
                                    ))}
                                  </ul>
                                </SuggestionPortal>
                              )}
                              {loadingVariants[index] && (<small className="text-info"><FaSpinner className="fa-spin me-1" />Loading...</small>)}
                            </td>

                            <td>
                              <select className="form-select form-select-sm" value={item.size} onChange={(e) => handleItemChange(index, e)} name="size" required disabled={!variants.length}>
                                <option value="">Select Size</option>
                                {sizes.map(size => (<option key={size} value={size}>{size}</option>))}
                              </select>
                            </td>

                            <td>
                              <select className="form-select form-select-sm" value={item.color} onChange={(e) => handleItemChange(index, e)} name="color" required disabled={!item.size}>
                                <option value="">Select Color</option>
                                {colors.map(color => (<option key={color} value={color}>{color}</option>))}
                              </select>
                            </td>

                            <td>
                              <input type="number" className="form-control form-control-sm" value={item.cartons} onChange={(e) => handleItemChange(index, e)} name="cartons" min="0" required style={{ maxWidth: "80px" }} />
                             <small
  className={
    stockAvailability[index] < 0
      ? 'text-danger fw-bold'
      : stockAvailability[index] === 0
      ? 'text-muted'
      : 'text-success'
  }
>
  Available: {stockAvailability[index] ?? '-'}
</small>

                            </td>

                            <td><input type="number" className="form-control form-control-sm bg-light" value={item.pairPerCarton} readOnly style={{ maxWidth: "80px" }} /></td>
                            <td><input type="number" className="form-control form-control-sm" value={item.rate} onChange={(e) => handleItemChange(index, e)} name="rate" step="0.01" min="0" required style={{ maxWidth: "100px" }} /></td>
                            <td><input type="text" className="form-control form-control-sm bg-light fw-bold" value={`₹${item.amount.toFixed(2)}`} readOnly style={{ maxWidth: "120px" }} /></td>

                            <td>
                              <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItemRow(index)} disabled={formData.items.length === 1} title="Remove item">
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
          </div>

          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light"><h5 className="mb-0 text-dark">🚛 Transport Details</h5></div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-bold">Station *</label>
                  <input type="text" className="form-control" value={formData.station} onChange={(e) => setFormData(p => ({ ...p, station: e.target.value }))} placeholder="Enter station" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Transport *</label>
                  <input type="text" className="form-control" value={formData.transport} onChange={(e) => setFormData(p => ({ ...p, transport: e.target.value }))} placeholder="Enter transport name" required />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-bold">Marka</label>
                  <input type="text" className="form-control" value={formData.marka} onChange={(e) => setFormData(p => ({ ...p, marka: e.target.value }))} placeholder="Enter marka (optional)" />
                </div>
              </div>
            </div>
          </div>

          {/* GST Section — Optional */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0 text-dark">🧮 GST (Optional)</h5>
              <span className="badge bg-secondary" style={{ fontSize: 11 }}>Nahi lagana toh 0% rehne do</span>
            </div>
            <div className="card-body">
              <div className="row g-3 align-items-center">
                <div className="col-md-3">
                  <label className="form-label fw-bold">GST %</label>
                  <select className="form-control" value={formData.gstPercent}
                    onChange={e => setFormData(p => ({ ...p, gstPercent: Number(e.target.value) }))}>
                    <option value={0}>0% (No GST)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-bold">State Type</label>
                  <select className="form-control" value={formData.isInterState ? 'inter' : 'intra'}
                    onChange={e => setFormData(p => ({ ...p, isInterState: e.target.value === 'inter' }))}>
                    <option value="intra">Intra-State (CGST + SGST)</option>
                    <option value="inter">Inter-State (IGST)</option>
                  </select>
                </div>
                {totals.gst > 0 && (
                  <div className="col-md-6">
                    <div className="d-flex gap-3 flex-wrap mt-2">
                      {!formData.isInterState ? (
                        <>
                          <span className="badge bg-warning text-dark fs-6">CGST ({totals.gst/2}%): ₹{totals.cgst.toFixed(2)}</span>
                          <span className="badge bg-warning text-dark fs-6">SGST ({totals.gst/2}%): ₹{totals.sgst.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="badge bg-purple fs-6" style={{ background: '#7c3aed', color: '#fff' }}>IGST ({totals.gst}%): ₹{totals.igst.toFixed(2)}</span>
                      )}
                      <span className="badge bg-danger fs-6">Total GST: ₹{totals.gstAmt.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card mb-4 shadow-sm border-primary">
            <div className="card-header bg-primary text-white"><h5 className="mb-0">📊 Order Summary</h5></div>
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-3"><div className="border-end"><h3 className="text-primary mb-1">{totals.totalCartons}</h3><p className="text-muted mb-0">Total Cartons</p></div></div>
                <div className="col-md-3"><div className="border-end"><h3 className="text-info mb-1">{totals.totalPairs}</h3><p className="text-muted mb-0">Total Pairs</p></div></div>
                <div className="col-md-3"><div className="border-end"><h3 className="text-warning mb-1">₹{totals.totalAmount.toFixed(2)}</h3><p className="text-muted mb-0">Taxable Amount</p></div></div>
                <div className="col-md-3"><h3 className="text-success mb-1">₹{(totals.grandTotal || totals.totalAmount).toFixed(2)}</h3><p className="text-muted mb-0">{totals.gst > 0 ? 'Grand Total (with GST)' : 'Total Amount'}</p></div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => navigate('/challans')} disabled={saving}><FaTimes className="me-2" /> Cancel</button>
            <div className="d-flex gap-2">
              {lastCreatedChallanId && !saving && (
                <>
                  <button type="button" className="btn btn-outline-primary" onClick={() => downloadChallanPDF(lastCreatedChallanId, formData.invoiceNo)} disabled={downloadingPDF}>
                    {downloadingPDF ? (<><FaSpinner className="fa-spin me-1" />Downloading...</>) : (<><FaFilePdf className="me-1" />Download Challan</>)}
                  </button>
                  <button type="button" className="btn btn-outline-success" onClick={() => downloadProductsPDF(lastCreatedChallanId, formData.invoiceNo)} disabled={downloadingProductsPDF}>
                    {downloadingProductsPDF ? (<><FaSpinner className="fa-spin me-1" />Downloading...</>) : (<><FaImages className="me-1" />Download Products</>)}
                  </button>
                </>
              )}
              <button type="submit" className="btn btn-primary btn-lg px-4" disabled={saving}>
                {saving ? (<><FaSpinner className="fa-spin me-2" />Creating Challan...</>) : (<><FaSave className="me-2" />Create Challan</>)}
              </button>
            </div>
          </div>

          {lastCreatedChallanId && (
            <div className="alert alert-success mt-3" role="alert">
              <div className="d-flex align-items-center">
                <div className="me-3"><i className="fas fa-check-circle fa-2x"></i></div>
                <div>
                  <h6 className="alert-heading mb-1">Challan Created Successfully!</h6>
                  <p className="mb-0">Invoice #{formData.invoiceNo} has been created. You can now download both regular challan and products PDF using the buttons above.</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChallanForm;
