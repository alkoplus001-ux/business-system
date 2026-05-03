import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ProductImport = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleImport = async e => {
    e.preventDefault();
    if (!file) return toast.error('Please select an Excel file');
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(`Imported ${res.data.importedCount} products`);
      } else {
        toast.error(res.data.error || 'Import failed');
      }
    } catch (err) {
      toast.error('Import failed');
    }
    setImporting(false);
  };

  return (
    <div className="container py-3">
      <h2 className="mb-4">Import Products from Excel</h2>
      <form onSubmit={handleImport} className="card p-4">
        <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="form-control mb-3" />
        <button className="btn btn-success" disabled={importing}>
          {importing ? 'Importing...' : 'Import'}
        </button>
      </form>
    </div>
  );
};

export default ProductImport;
