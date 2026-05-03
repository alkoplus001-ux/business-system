import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const actionColors = {
  ADD:          { bg: '#d1fae5', color: '#065f46', label: 'Added' },
  UPDATE:       { bg: '#dbeafe', color: '#1e40af', label: 'Updated' },
  DELETE:       { bg: '#fee2e2', color: '#991b1b', label: 'Deleted' },
  IMPORT:       { bg: '#f3e8ff', color: '#6b21a8', label: 'Imported' },
  CHALLAN_OUT:  { bg: '#fef3c7', color: '#92400e', label: 'Challan Out' },
  CHALLAN_IN:   { bg: '#d1fae5', color: '#065f46', label: 'Challan In' },
};

const StockHistory = () => {
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/products/history');
        setHistory(res.data.data || []);
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = history.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.product?.toLowerCase().includes(q) ||
      h.action?.toLowerCase().includes(q) ||
      h.user?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="hist-page">
      {/* Header */}
      <div className="hist-header">
        <div className="container">
          <div className="hist-header-inner">
            <div>
              <h1 className="hist-title">Stock History</h1>
              <p className="hist-sub">{history.length} total records</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="hist-body">
        <div className="container">
          {loading ? (
            <div className="hist-loading">
              <div className="hist-loader-ring"></div>
              <span>Loading stock history...</span>
            </div>
          ) : (
            <div className="hist-card">
              {/* Toolbar */}
              <div className="hist-toolbar">
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    className="hist-search"
                    placeholder="Search by product, action, user..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {filtered.length} of {history.length}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="hist-table-wrap">
                <table className="hist-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Action</th>
                      <th>User</th>
                      <th>Changes</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-secondary)' }}>
                          <span style={{ fontSize: '2.2rem', display: 'block', marginBottom: 10, opacity: 0.35 }}>📦</span>
                          {search ? 'No records match your search' : 'No stock history found'}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((h, idx) => {
                        const ac = actionColors[h.action] || { bg: '#f1f5f9', color: '#475569', label: h.action };
                        return (
                          <tr key={idx}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{idx + 1}</td>
                            <td style={{ fontWeight: 600 }}>{h.product || '—'}</td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 9px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', background: ac.bg, color: ac.color }}>
                                {ac.label}
                              </span>
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{h.user || '—'}</td>
                            <td>
                              <pre style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)', background: 'var(--bg-muted)', borderRadius: 6, padding: '4px 8px', maxWidth: 280, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {JSON.stringify(h.changes, null, 2)}
                              </pre>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                              {new Date(h.timestamp).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
