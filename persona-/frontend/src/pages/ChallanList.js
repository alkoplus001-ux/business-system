import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ChallanList = () => {
  const [challans, setChallans] = useState([]);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchChallans = async () => {
      try {
        const response = await api.get('/challans');
        setChallans(response.data.data || []);
      } catch (err) {
        toast.error('Failed to load challans');
      }
    };
    fetchChallans();
  }, []);

  const downloadPdf = async (challanId, invoiceNo) => {
    if (!challanId) return;
    setDownloading(challanId);
    try {
      const pdfResponse = await api.get(`/challan-pdf/${challanId}`, {
        responseType: 'blob',
        timeout: 30000,
      });
      if (!pdfResponse.data || pdfResponse.data.size === 0)
        throw new Error('Empty PDF received from server');

      const safeInvoiceNo = invoiceNo.replace(/\//g, '-');
      const blob = new Blob([pdfResponse.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `challan-${safeInvoiceNo}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'PDF download failed');
    } finally {
      setDownloading(null);
    }
  };

  const filtered = challans.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.invoiceNo?.toLowerCase().includes(q) ||
      c.partyName?.toLowerCase().includes(q) ||
      c.station?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="cl-page">
      {/* ── Header ── */}
      <div className="cl-header">
        <div className="container">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div>
              <h1 className="cl-title">All Challans</h1>
              <p className="cl-sub">{challans.length} total records</p>
            </div>
            <Link to="/challans/add" className="btn-nav-success" style={{ fontSize: '0.875rem', padding: '10px 20px', borderRadius: 12 }}>
              + New Challan
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="cl-body">
        <div className="container">
          <div className="cl-card">
            {/* Toolbar */}
            <div className="cl-toolbar">
              <input
                className="cl-search"
                placeholder="Search by invoice no, party name, station..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                {filtered.length} of {challans.length} challans
              </span>
            </div>

            {/* Table */}
            <div className="cl-table-wrap">
              <table className="cl-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Invoice No</th>
                    <th>Party Name</th>
                    <th>Date</th>
                    <th>Station</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="cl-empty">
                        <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: 12, opacity: 0.35 }}>📋</span>
                        {search ? 'No challans match your search' : 'No challans found'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((challan, idx) => {
                      const challanId = challan._id || challan.id;
                      return (
                        <tr key={challanId}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>
                            {idx + 1}
                          </td>
                          <td>
                            <span className="cl-invoice-no">{challan.invoiceNo}</span>
                          </td>
                          <td style={{ fontWeight: 500 }}>{challan.partyName}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>
                            {new Date(challan.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td>{challan.station || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              <Link
                                to={`/challan-out/edit/${challanId}`}
                                className="cl-btn-edit"
                              >
                                ✏ Edit
                              </Link>
                              <button
                                className="cl-btn-pdf"
                                onClick={() => downloadPdf(challanId, challan.invoiceNo)}
                                disabled={!challanId || downloading === challanId}
                              >
                                {downloading === challanId ? '⏳' : '⬇'} PDF
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallanList;
