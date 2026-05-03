import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';
const triggerDownload = (blob, filename) => {
  if (window.navigator?.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, filename);
  } else {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 800);
  }
};
const PDFGenerator = () => {
  const [includeImages, setIncludeImages] = useState(false);
  const [filters, setFilters] = useState({
    article: '',
    gender: '',
    stockType: '',
    color: '',
    size: ''
  });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (prop, value) => {
    setFilters(prev => ({ ...prev, [prop]: value }));
  };

  // const handleGeneratePDF = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const response = await api.post('/pdf/generate-pdf', {
  //       includeImages,
  //       filters
  //     }, { responseType: 'blob' });

  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.setAttribute('download', 'products-report.pdf');
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     toast.success('PDF generated successfully!');
  //   } catch (err) {
  //     toast.error('Failed to generate PDF');
  //     console.error(err);
  //   }
  //   setLoading(false);
  // };
  const handleGeneratePDF = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const response = await api.post('/pdf/generate-pdf', {
      includeImages,
      filters
    }, { responseType: 'blob' });

    triggerDownload(
      new Blob([response.data], { type: 'application/pdf' }),
      'products-report.pdf'
    );
    toast.success('PDF generated successfully!');
  } catch (err) {
    toast.error('Failed to generate PDF');
    console.error(err);
  }
  setLoading(false);
};


  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Generate Product Report</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleGeneratePDF}>
            <div className="mb-3">
              <h5 className="fw-bold">Filter Products</h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Article</label>
                  <input
                    type="text"
                    className="form-control"
                    value={filters.article}
                    onChange={e => handleFilterChange('article', e.target.value)}
                    placeholder="Filter by article"
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Stock Type</label>
                  <select
                    className="form-select"
                    value={filters.stockType}
                    onChange={e => handleFilterChange('stockType', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="pu">PU</option>
                    <option value="eva">EVA</option>
                    <option value="new">NEW</option>
                  </select>
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={filters.gender}
                    onChange={e => handleFilterChange('gender', e.target.value)}
                  >
                    <option value="">All</option>
                    <option value="gents">Gents</option>
                    <option value="ladies">Ladies</option>
                    <option value="kids_male">Kids Male</option>
                    <option value="kids_female">Kids Female</option>
                  </select>
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    value={filters.color}
                    onChange={e => handleFilterChange('color', e.target.value)}
                    placeholder="Filter by color"
                  />
                </div>
                
                <div className="col-md-4 mb-3">
                  <label className="form-label">Size</label>
                  <input
                    type="text"
                    className="form-control"
                    value={filters.size}
                    onChange={e => handleFilterChange('size', e.target.value)}
                    placeholder="Filter by size"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="includeImages"
                  checked={includeImages}
                  onChange={e => setIncludeImages(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeImages">
                  Include Product Images
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate PDF'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PDFGenerator;
