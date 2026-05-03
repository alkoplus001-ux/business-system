import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const TABS = [
  { key: 'summary',     label: '📊 Overview',            desc: 'Aaj aur mahine ka quick snapshot' },
  { key: 'pl',          label: '📈 P&L Statement',        desc: 'Sales - Cost = Profit/Loss' },
  { key: 'outstanding', label: '⏳ Outstanding',          desc: 'Parties ki pending payments' },
  { key: 'gst',         label: '🧮 GST Report',           desc: 'CGST/SGST/IGST breakup' },
  { key: 'payments',    label: '💰 Payment Book',         desc: 'Kab kab payment aayi' },
  { key: 'sales',       label: '🧾 Sales Register',       desc: 'Sari invoices — party, amount, items' },
  { key: 'purchase',    label: '📥 Purchase Register',    desc: 'Stock kab kab aaya, kisne add kiya' },
  { key: 'stock',       label: '📦 Stock Summary',        desc: 'Abhi ka pura stock + MRP/Rate value' },
  { key: 'party',       label: '🏪 Party Ledger',         desc: 'Party-wise kitna maal gaya, kitna amount' },
  { key: 'daybook',     label: '📅 Day Book',             desc: 'Kisi bhi din ki sab transactions' },
];

const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
const fmtN = n => Number(n || 0).toLocaleString('en-IN');
const today = () => new Date().toISOString().split('T')[0];
const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

// ── Reusable date filter bar ──
const DateFilter = ({ from, to, onChange, extra }) => (
  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
    <div>
      <label style={lbl}>From</label>
      <input type="date" style={inp} value={from} onChange={e => onChange('from', e.target.value)} />
    </div>
    <div>
      <label style={lbl}>To</label>
      <input type="date" style={inp} value={to} onChange={e => onChange('to', e.target.value)} />
    </div>
    {extra}
  </div>
);

// ── Stat card ──
const Card = ({ label, value, sub, color = '#6366f1' }) => (
  <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, padding: '18px 22px', boxShadow: '0 2px 12px rgba(0,0,0,.07)', borderLeft: `4px solid ${color}`, minWidth: 160, border: '1px solid var(--border, #e2e8f0)', borderLeftColor: color }}>
    <div style={{ fontSize: 11.5, color: 'var(--text-secondary, #64748b)', marginBottom: 5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
    <div style={{ fontSize: 21, fontWeight: 800, color, letterSpacing: '-0.5px' }}>{value}</div>
    {sub && <div style={{ fontSize: 11.5, color: 'var(--text-muted, #94a3b8)', marginTop: 3 }}>{sub}</div>}
  </div>
);

// ── Table wrapper ──
const Tbl = ({ heads, rows, empty = 'Koi data nahi' }) => {
  const safeRows = rows || [];
  return (
    <div className="tally-tbl-wrap">
      <table className="tally-tbl">
        <thead>
          <tr>
            {heads.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {safeRows.length === 0
            ? <tr><td colSpan={heads.length} style={{ textAlign: 'center', padding: 36, color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>{empty}</td></tr>
            : safeRows}
        </tbody>
      </table>
    </div>
  );
};

const actionLabel = a => ({
  ADD: { label: 'Stock In', color: '#16a34a' },
  UPDATE: { label: 'Updated', color: '#2563eb' },
  CHALLAN_OUT: { label: 'Challan Out', color: '#dc2626' },
  CHALLAN_IN: { label: 'Challan In', color: '#16a34a' },
  DELETE: { label: 'Deleted', color: '#dc2626' },
  BULK_DELETE: { label: 'Bulk Delete', color: '#dc2626' },
  BULK_RESTORE: { label: 'Restored', color: '#16a34a' },
  IMPORT: { label: 'Imported', color: '#7c3aed' },
}[a] || { label: a, color: '#475569' });

// ── Styles ──
const td = { padding: '11px 14px', borderBottom: '1px solid var(--border, #f1f5f9)', color: 'var(--text-primary, #1e293b)', fontSize: '0.93rem' };
const lbl = { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 4, fontWeight: 500 };
const inp = { padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fafafa', outline: 'none' };
const srchInp = { ...inp, minWidth: 200 };

// ══════════════════════════════════════════
export default function Tally() {
  const [tab, setTab] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [filters, setFilters] = useState({ from: monthStart(), to: today(), party: '', worker: '', action: '', stockType: '', gender: '', status: '' });
  const [payForm, setPayForm] = useState({ partyName: '', invoiceNo: '', amount: '', paymentDate: today(), paymentMode: 'cash', referenceNo: '', note: '' });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg, setPayMsg] = useState('');

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const [pushStatus, setPushStatus] = useState({ loading: false, msg: '', ok: null });

  // Tally company verification
  const [tallyVerify, setTallyVerify] = useState({ loading: false, configured: '', activeName: null, tallyOnline: false, matched: null });
  const [editingCompanyName, setEditingCompanyName] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState('');

  const verifyCompany = async () => {
    setTallyVerify(v => ({ ...v, loading: true }));
    try {
      const res = await api.get('/tally/verify-company');
      setTallyVerify({ loading: false, ...res.data });
      setCompanyNameInput(res.data.tallyCompanyName || '');
    } catch {
      setTallyVerify(v => ({ ...v, loading: false, tallyOnline: false, activeName: null }));
    }
  };

  const saveCompanyName = async () => {
    try {
      await api.post('/tally/set-company-name', { tallyCompanyName: companyNameInput });
      setEditingCompanyName(false);
      verifyCompany();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  useEffect(() => { verifyCompany(); }, []); // eslint-disable-line

  const downloadXML = async (endpoint, filename) => {
    try {
      const p = new URLSearchParams();
      if (filters.from) p.set('from', filters.from);
      if (filters.to) p.set('to', filters.to);
      if (filters.party) p.set('party', filters.party);
      if (filters.stockType) p.set('stockType', filters.stockType);
      if (filters.gender) p.set('gender', filters.gender);
      const res = await api.get(`${endpoint}?${p}`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/xml' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed: ' + e.message);
    }
  };

  const pushToTally = async (endpoint) => {
    setPushStatus({ loading: true, msg: '', ok: null });
    try {
      const p = new URLSearchParams();
      if (filters.from) p.set('from', filters.from);
      if (filters.to) p.set('to', filters.to);
      if (filters.party) p.set('party', filters.party);
      if (filters.stockType) p.set('stockType', filters.stockType);
      if (filters.gender) p.set('gender', filters.gender);
      const res = await api.post(`${endpoint}?${p}`);
      setPushStatus({ loading: false, msg: res.data.message, ok: true });
    } catch (e) {
      const err = e.response?.data;
      const msg = err?.hint
        ? `${err.error} — ${err.hint}`
        : err?.details
        ? `${err.error}: ${err.details}`
        : err?.error || e.message;
      setPushStatus({ loading: false, msg, ok: false });
    }
  };

  const load = useCallback(async (t = tab) => {
    setLoading(true);
    setData(null);
    try {
      const p = new URLSearchParams();
      if (filters.from) p.set('from', filters.from);
      if (filters.to) p.set('to', filters.to);
      if (filters.party) p.set('party', filters.party);
      if (filters.worker) p.set('worker', filters.worker);
      if (filters.action) p.set('action', filters.action);
      if (filters.stockType) p.set('stockType', filters.stockType);
      if (filters.gender) p.set('gender', filters.gender);

      const endpointMap = {
        summary:     '/tally/summary',
        sales:       '/tally/sales-register',
        purchase:    '/tally/purchase-register',
        stock:       '/tally/stock-summary',
        party:       '/tally/party-ledger',
        daybook:     '/tally/day-book',
        pl:          '/accounting/pl-statement',
        outstanding: '/accounting/outstanding',
        gst:         '/accounting/gst-report',
        payments:    '/accounting/payments',
      };
      const res = await api.get(`${endpointMap[t]}?${p}`);
      setData(res.data);
    } catch (e) {
      setData({ error: e.response?.data?.error || e.message });
    }
    setLoading(false);
  }, [tab, filters]);

  useEffect(() => { load(tab); }, [tab]); // eslint-disable-line

  const handleTab = t => { setTab(t); setPayMsg(''); };

  const submitPayment = async e => {
    e.preventDefault();
    setPayLoading(true); setPayMsg('');
    try {
      await api.post('/accounting/payments', payForm);
      setPayMsg('✅ Payment record ho gayi!');
      setPayForm({ partyName: '', invoiceNo: '', amount: '', paymentDate: today(), paymentMode: 'cash', referenceNo: '', note: '' });
      load('payments');
    } catch (err) {
      setPayMsg('❌ ' + (err.response?.data?.error || err.message));
    }
    setPayLoading(false);
  };

  const deletePayment = async id => {
    if (!window.confirm('Payment delete karein?')) return;
    try { await api.delete(`/accounting/payments/${id}`); load('payments'); }
    catch (err) { alert(err.response?.data?.error || err.message); }
  };

  return (
    <div className="tally-page">
      {/* ── Header ── */}
      <div className="tally-header">
        <div className="container">
          <h2 className="tally-title">Tally &amp; Accounts</h2>
          <p className="tally-sub">Financial registers — stock se connected, real-time data</p>

          {/* Sub-tabs */}
          <div className="tally-tab-bar">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => handleTab(t.key)}
                className={`tally-tab-btn${tab === t.key ? ' tally-tab-active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container tally-body">
        {/* Tally company verification bar */}
        <div className="tally-verify-bar">
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontWeight: 700, color: '#1e293b' }}>🏢 Tally Company:</span>

            {/* Status badge */}
            {tallyVerify.loading ? (
              <span style={{ color: '#94a3b8' }}>Checking...</span>
            ) : !tallyVerify.tallyOnline ? (
              <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>⚠️ Tally Offline</span>
            ) : tallyVerify.matched === true ? (
              <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>✅ Match — "{tallyVerify.activeName}"</span>
            ) : tallyVerify.matched === false ? (
              <span style={{ background: '#fef2f2', color: '#dc2626', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                ❌ Mismatch — Tally: "{tallyVerify.activeName}" | Expected: "{tallyVerify.configured}"
              </span>
            ) : tallyVerify.tallyOnline && !tallyVerify.activeName ? (
              <span style={{ background: '#fef9c3', color: '#854d0e', padding: '2px 10px', borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
                ⚠️ Tally mein company naam nahi mila — sahi XML port check karo
              </span>
            ) : null}

            {/* Edit / Set explicit Tally company name */}
            {editingCompanyName ? (
              <>
                <input
                  value={companyNameInput}
                  onChange={e => setCompanyNameInput(e.target.value)}
                  placeholder="Tally company name (exact spelling)"
                  style={{ padding: '5px 10px', border: '1.5px solid #6366f1', borderRadius: 6, fontSize: 13, outline: 'none', minWidth: 240 }}
                  onKeyDown={e => { if (e.key === 'Enter') saveCompanyName(); if (e.key === 'Escape') setEditingCompanyName(false); }}
                  autoFocus
                />
                <button onClick={saveCompanyName} style={{ padding: '5px 14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Save</button>
                <button onClick={() => setEditingCompanyName(false)} style={{ padding: '5px 10px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Cancel</button>
              </>
            ) : (
              <button onClick={() => { setCompanyNameInput(tallyVerify.tallyCompanyName || ''); setEditingCompanyName(true); }}
                style={{ padding: '4px 12px', background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                ✏️ {tallyVerify.tallyCompanyName ? 'Edit Tally Name' : 'Override Name'}
              </button>
            )}

            <button onClick={verifyCompany} disabled={tallyVerify.loading}
              style={{ padding: '4px 12px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              🔄 Verify
            </button>
          </div>

          {/* Sub-line: show which name is being used for comparison */}
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            {tallyVerify.isExplicit
              ? `🔒 Strict check: push sirf "${tallyVerify.configured}" company mein hoga`
              : `🔑 Auto-check using software name "${tallyVerify.configured}" — override karna ho to "Override Name" dabao`
            }
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
            <div className="hist-loader-ring" style={{ margin: '0 auto 16px' }}></div>
            Loading data...
          </div>
        )}
        {data?.error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 12, padding: '14px 18px', color: '#dc2626', fontWeight: 500, fontSize: '0.875rem' }}>
            ⚠ Error: {data.error}
          </div>
        )}

        {/* ── 1. OVERVIEW ── */}
        {!loading && tab === 'summary' && data && !data.error && (
          <div>
            <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>{TABS[0].desc}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 28 }}>
              <Card label="Total Products" value={fmtN(data.totalProducts)} color="#6366f1" />
              <Card label="Aaj ki Sales" value={fmt(data.todaySales?.amount)} sub={`${fmtN(data.todaySales?.cartons)} cartons`} color="#16a34a" />
              <Card label="Is Mahine Sales" value={fmt(data.monthSales?.amount)} sub={`${fmtN(data.monthSales?.cartons)} cartons`} color="#d97706" />
              <Card label="Stock (Rate Value)" value={fmt(data.stockValue?.rateValue)} sub={`${fmtN(data.stockValue?.cartons)} cartons`} color="#7c3aed" />
              <Card label="Stock (MRP Value)" value={fmt(data.stockValue?.mrpValue)} color="#0891b2" />
              <Card label="All-time Sales" value={fmt(data.allTimeSales?.totalAmount)} sub={`${fmtN(data.allTimeSales?.totalPairs)} pairs`} color="#dc2626" />
            </div>
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 14, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Quick Navigation</h6>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {TABS.slice(1).map(t => (
                  <div key={t.key} onClick={() => handleTab(t.key)}
                    style={{ padding: '13px 16px', border: '1.5px solid var(--border-strong, #e2e8f0)', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', background: 'var(--bg-main, #f8fafc)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong, #e2e8f0)'; e.currentTarget.style.background = 'var(--bg-main, #f8fafc)'; }}>
                    <div style={{ fontWeight: 600, marginBottom: 3, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{t.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)' }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 2. SALES REGISTER ── */}
        {!loading && tab === 'sales' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<>
                <div><label style={lbl}>Party</label><input style={srchInp} placeholder="Party name..." value={filters.party} onChange={e => setFilter('party', e.target.value)} /></div>
                <button onClick={() => load('sales')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
              </>}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Total Invoices" value={fmtN(data.count)} color="#6366f1" />
              <Card label="Total Cartons" value={fmtN(data.totalCartons)} color="#d97706" />
              <Card label="Total Amount" value={fmt(data.totalAmount)} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <button
                onClick={() => pushToTally('/tally/push/sales')}
                disabled={pushStatus.loading}
                style={{ padding: '9px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                {pushStatus.loading ? '⏳ Sending...' : '🚀 Send to Tally'}
              </button>
              <button
                onClick={() => downloadXML('/tally/export/sales-xml', `sales-tally-${filters.from}-to-${filters.to}.xml`)}
                style={{ padding: '9px 20px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                ⬇️ Download XML
              </button>
              {pushStatus.msg && tab === 'sales' && (
                <span style={{ fontSize: 13, fontWeight: 600, color: pushStatus.ok ? '#16a34a' : '#dc2626' }}>
                  {pushStatus.ok ? '✅' : '❌'} {pushStatus.msg}
                </span>
              )}
            </div>
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <Tbl heads={['Invoice No', 'Date', 'Party', 'Station', 'Transport', 'Cartons', 'Pairs', 'Amount']}
                rows={(data.data || []).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={td}><span style={{ fontWeight: 600, color: 'var(--primary, #6366f1)' }}>{r.invoiceNo}</span></td>
                    <td style={td}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td style={td}>{r.partyName}</td>
                    <td style={td}>{r.station}</td>
                    <td style={td}>{r.transport}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{fmtN(r.totalCartons)}</td>
                    <td style={td}>{fmtN(r.totalPairs)}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#16a34a' }}>{fmt(r.totalAmount)}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 3. PURCHASE REGISTER ── */}
        {!loading && tab === 'purchase' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<>
                <div><label style={lbl}>Worker</label><input style={srchInp} placeholder="Worker name..." value={filters.worker} onChange={e => setFilter('worker', e.target.value)} /></div>
                <button onClick={() => load('purchase')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
              </>}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Entries" value={fmtN(data.count)} color="#6366f1" />
              <Card label="Total Cartons" value={fmtN(data.totalCartons)} color="#d97706" />
              <Card label="Total Pairs" value={fmtN(data.totalPairs)} color="#7c3aed" />
              <Card label="Stock Value (Rate)" value={fmt(data.totalAmount)} color="#16a34a" />
            </div>
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <Tbl heads={['Date', 'Worker', 'Article', 'Gender', 'Size', 'Color', 'Cartons', 'Pairs', 'Rate', 'Amount']}
                rows={(data.data || []).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={td}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td style={{ ...td, fontWeight: 600, color: 'var(--primary, #6366f1)' }}>{r.worker}</td>
                    <td style={td}>{r.article}</td>
                    <td style={td}>{r.gender}</td>
                    <td style={td}>{r.size}</td>
                    <td style={td}>{r.color}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{fmtN(r.cartons)}</td>
                    <td style={td}>{fmtN(r.pairs)}</td>
                    <td style={td}>{fmt(r.rate)}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#16a34a' }}>{fmt(r.amount)}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 4. STOCK SUMMARY ── */}
        {!loading && tab === 'stock' && data && !data.error && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
              <div><label style={lbl}>Stock Type</label>
                <select style={inp} value={filters.stockType} onChange={e => setFilter('stockType', e.target.value)}>
                  <option value="">All</option>
                  <option value="pu">PU</option>
                  <option value="eva">EVA</option>
                </select>
              </div>
              <div><label style={lbl}>Gender</label>
                <select style={inp} value={filters.gender} onChange={e => setFilter('gender', e.target.value)}>
                  <option value="">All</option>
                  <option value="gents">Gents</option>
                  <option value="ladies">Ladies</option>
                  <option value="kids_gents">Kids Gents</option>
                  <option value="kids_ladies">Kids Ladies</option>
                </select>
              </div>
              <button onClick={() => load('stock')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Total Products" value={fmtN(data.count)} color="#6366f1" />
              <Card label="Total Cartons" value={fmtN(data.totalCartons)} color="#d97706" />
              <Card label="Total Pairs" value={fmtN(data.totalPairs)} color="#7c3aed" />
              <Card label="MRP Value" value={fmt(data.totalMrpValue)} color="#dc2626" />
              <Card label="Rate Value" value={fmt(data.totalRateValue)} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
              <button
                onClick={() => pushToTally('/tally/push/stock')}
                disabled={pushStatus.loading}
                style={{ padding: '9px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                {pushStatus.loading ? '⏳ Sending...' : '🚀 Send Stock to Tally'}
              </button>
              <button
                onClick={() => downloadXML('/tally/export/stock-xml', 'stock-tally.xml')}
                style={{ padding: '9px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                ⬇️ Download XML
              </button>
              {pushStatus.msg && tab === 'stock' && (
                <span style={{ fontSize: 13, fontWeight: 600, color: pushStatus.ok ? '#16a34a' : '#dc2626' }}>
                  {pushStatus.ok ? '✅' : '❌'} {pushStatus.msg}
                </span>
              )}
            </div>
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <Tbl heads={['Article', 'Gender', 'Type', 'Size', 'Color', 'Cartons', 'Pairs', 'Rate', 'MRP', 'Rate Value', 'MRP Value']}
                rows={(data.data || []).map((r, i) => (
                  <tr key={i} style={{ background: r.cartons < 0 ? '#fef2f2' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{r.article}</td>
                    <td style={td}>{r.gender}</td>
                    <td style={td}>{r.stockType?.toUpperCase()}</td>
                    <td style={td}>{r.size}</td>
                    <td style={td}>{r.color}</td>
                    <td style={{ ...td, fontWeight: 700, color: r.cartons < 0 ? '#dc2626' : '#1e293b' }}>{fmtN(r.cartons)}</td>
                    <td style={td}>{fmtN(r.pairs)}</td>
                    <td style={td}>{fmt(r.rate)}</td>
                    <td style={td}>{fmt(r.mrp)}</td>
                    <td style={{ ...td, color: '#16a34a', fontWeight: 600 }}>{fmt(r.rateValue)}</td>
                    <td style={{ ...td, color: 'var(--primary, #6366f1)', fontWeight: 600 }}>{fmt(r.mrpValue)}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 5. PARTY LEDGER ── */}
        {!loading && tab === 'party' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<>
                <div><label style={lbl}>Party (optional)</label><input style={srchInp} placeholder="Party name..." value={filters.party} onChange={e => setFilter('party', e.target.value)} /></div>
                <button onClick={() => load('party')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
              </>}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Parties" value={fmtN(data.partyCount)} color="#6366f1" />
              <Card label="Total Cartons" value={fmtN(data.grandCartons)} color="#d97706" />
              <Card label="Grand Total" value={fmt(data.grandTotal)} color="#16a34a" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(data.data || []).map((party, pi) => (
                <div key={pi} style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '14px 20px', background: 'var(--bg-muted, #f1f5f9)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>🏪 {party.partyName}</span>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <span style={{ fontSize: 13, color: '#475569' }}>{fmtN(party.totalCartons)} cartons</span>
                      <span style={{ fontSize: 13, color: '#475569' }}>{fmtN(party.totalPairs)} pairs</span>
                      <span style={{ fontWeight: 700, color: '#16a34a', fontSize: 15 }}>{fmt(party.totalAmount)}</span>
                    </div>
                  </div>
                  <Tbl heads={['Invoice No', 'Date', 'Station', 'Cartons', 'Pairs', 'Amount']}
                    rows={(party.transactions || []).map((t, ti) => (
                      <tr key={ti}>
                        <td style={{ ...td, color: 'var(--primary, #6366f1)', fontWeight: 600 }}>{t.invoiceNo}</td>
                        <td style={td}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                        <td style={td}>{t.station}</td>
                        <td style={td}>{fmtN(t.cartons)}</td>
                        <td style={td}>{fmtN(t.pairs)}</td>
                        <td style={{ ...td, fontWeight: 700, color: '#16a34a' }}>{fmt(t.amount)}</td>
                      </tr>
                    ))}
                  />
                </div>
              ))}
              {data.data.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Koi party nahi mili</div>}
            </div>
          </div>
        )}

        {/* ── 6. DAY BOOK ── */}
        {!loading && tab === 'daybook' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<>
                <div><label style={lbl}>Action</label>
                  <select style={inp} value={filters.action} onChange={e => setFilter('action', e.target.value)}>
                    <option value="">All</option>
                    <option value="ADD">Stock In (ADD)</option>
                    <option value="UPDATE">Update</option>
                    <option value="CHALLAN_OUT">Challan Out</option>
                    <option value="CHALLAN_IN">Challan In</option>
                    <option value="DELETE">Delete</option>
                    <option value="IMPORT">Import</option>
                  </select>
                </div>
                <button onClick={() => load('daybook')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
              </>}
            />
            <Card label="Total Entries" value={fmtN(data.count)} color="#6366f1" />
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(data?.byDate || {}).map(([date, entries]) => (
                <div key={date} style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 20px', background: 'var(--bg-muted, #f1f5f9)', borderBottom: '1px solid var(--border)', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>📅 {date} <span style={{ fontWeight: 400, color: '#64748b', fontSize: 12 }}>({entries.length} entries)</span></div>
                  <Tbl heads={['Time', 'Action', 'Article', 'Size', 'Color', 'Cartons', 'Pairs', 'Party / Worker', 'Invoice', 'Note']}
                    rows={entries.map((e, i) => {
                      const al = actionLabel(e.action);
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                          <td style={td}>{new Date(e.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={td}><span style={{ background: al.color + '18', color: al.color, padding: '2px 8px', borderRadius: 6, fontWeight: 600, fontSize: 11 }}>{al.label}</span></td>
                          <td style={{ ...td, fontWeight: 600 }}>{e.article}</td>
                          <td style={td}>{e.size}</td>
                          <td style={td}>{e.color}</td>
                          <td style={{ ...td, fontWeight: 600, color: e.isOut ? '#dc2626' : '#16a34a' }}>{e.isOut ? '-' : '+'}{fmtN(e.cartons)}</td>
                          <td style={td}>{fmtN(e.pairs)}</td>
                          <td style={td}>{e.partyName !== '-' ? e.partyName : e.worker}</td>
                          <td style={{ ...td, color: 'var(--primary, #6366f1)' }}>{e.invoiceNo !== '-' ? e.invoiceNo : '-'}</td>
                          <td style={{ ...td, fontSize: 11, color: '#64748b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.note}</td>
                        </tr>
                      );
                    })}
                  />
                </div>
              ))}
              {Object.keys(data?.byDate || {}).length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>Is period mein koi transaction nahi</div>}
            </div>
          </div>
        )}

        {/* ── 7. P&L STATEMENT ── */}
        {!loading && tab === 'pl' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<button onClick={() => load('pl')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
              <Card label="Total Sales (Taxable)" value={fmt(data.income?.totalSales)} color="#16a34a" />
              <Card label="Total GST Collected" value={fmt(data.income?.totalGST)} color="#d97706" sub="CGST+SGST+IGST" />
              <Card label="Invoices" value={fmtN(data.income?.invoiceCount)} color="#6366f1" />
              <Card label="Cartons Sold" value={fmtN(data.income?.totalCartonsSold)} color="#7c3aed" />
              <Card label="Pairs Sold" value={fmtN(data.income?.totalPairsSold)} color="#0891b2" />
            </div>

            {/* P&L Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                <h6 style={{ fontWeight: 700, color: '#16a34a', marginBottom: 16 }}>📥 Income (Cr.)</h6>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>Sales Revenue</span>
                  <span style={{ fontWeight: 700 }}>{fmt(data.income?.totalSales)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>GST Collected</span>
                  <span style={{ fontWeight: 700 }}>{fmt(data.income?.totalGST)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 800, fontSize: 16, color: '#16a34a' }}>
                  <span>Total</span>
                  <span>{fmt((data.income?.totalSales || 0) + (data.income?.totalGST || 0))}</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 24, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                <h6 style={{ fontWeight: 700, color: '#7c3aed', marginBottom: 16 }}>📦 Closing Stock</h6>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>Cartons in Stock</span>
                  <span style={{ fontWeight: 700 }}>{fmtN(data.closingStock?.totalCartons)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#475569' }}>Stock (Rate Value)</span>
                  <span style={{ fontWeight: 700 }}>{fmt(data.closingStock?.rateValue)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#475569' }}>Stock (MRP Value)</span>
                  <span style={{ fontWeight: 700 }}>{fmt(data.closingStock?.mrpValue)}</span>
                </div>
              </div>
            </div>

            {/* Month-wise breakdown */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Month-wise Sales</h6>
              <Tbl heads={['Month', 'Sales Amount', 'GST', 'Cartons']}
                rows={(data.salesByMonth || []).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ ...td, fontWeight: 600 }}>{r.month}</td>
                    <td style={{ ...td, color: '#16a34a', fontWeight: 700 }}>{fmt(r.sales)}</td>
                    <td style={td}>{fmt(r.gst)}</td>
                    <td style={td}>{fmtN(r.cartons)}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 8. OUTSTANDING ── */}
        {!loading && tab === 'outstanding' && data && !data.error && (
          <div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 20 }}>
              <div><label style={lbl}>Party</label><input style={srchInp} placeholder="Party name..." value={filters.party} onChange={e => setFilter('party', e.target.value)} /></div>
              <div><label style={lbl}>Status</label>
                <select style={inp} value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                  <option value="">Pending + Partial</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                </select>
              </div>
              <button onClick={() => load('outstanding')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Pending Invoices" value={fmtN(data.count)} color="#dc2626" />
              <Card label="Total Outstanding" value={fmt(data.totalOutstanding)} color="#dc2626" sub="Abhi tak nahi aaya" />
            </div>

            {/* Party-wise outstanding */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 12 }}>Party-wise Outstanding</h6>
              <Tbl heads={['Party', 'Invoices', 'Outstanding Amount']}
                rows={(data.partySummary || []).map((p, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 600 }}>{p.partyName}</td>
                    <td style={td}>{p.invoices}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#dc2626' }}>{fmt(p.totalOutstanding)}</td>
                  </tr>
                ))}
              />
            </div>

            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Invoice-wise Detail</h6>
              <Tbl heads={['Invoice', 'Date', 'Party', 'Invoice Total', 'Paid', 'Outstanding', 'Status', 'Due Date']}
                rows={(data.data || []).map((r, i) => (
                  <tr key={i} style={{ background: r.overdue ? '#fef2f2' : i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ ...td, color: 'var(--primary, #6366f1)', fontWeight: 600 }}>{r.invoiceNo}</td>
                    <td style={td}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td style={td}>{r.partyName}</td>
                    <td style={td}>{fmt(r.invoiceTotal)}</td>
                    <td style={{ ...td, color: '#16a34a' }}>{fmt(r.paidAmount)}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#dc2626' }}>{fmt(r.outstanding)}</td>
                    <td style={td}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: r.paymentStatus === 'partial' ? '#fef3c7' : '#fef2f2', color: r.paymentStatus === 'partial' ? '#d97706' : '#dc2626' }}>
                        {r.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ ...td, color: r.overdue ? '#dc2626' : '#475569' }}>{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '-'}{r.overdue ? ' ⚠️' : ''}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 9. GST REPORT ── */}
        {!loading && tab === 'gst' && data && !data.error && (
          <div>
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<button onClick={() => load('gst')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Apply</button>}
            />
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
              <Card label="Taxable Amount" value={fmt(data.summary?.totalTaxable)} color="#6366f1" />
              <Card label="CGST" value={fmt(data.summary?.totalCGST)} color="#d97706" />
              <Card label="SGST" value={fmt(data.summary?.totalSGST)} color="#d97706" />
              <Card label="IGST" value={fmt(data.summary?.totalIGST)} color="#7c3aed" />
              <Card label="Total GST" value={fmt(data.summary?.totalGST)} color="#dc2626" />
              <Card label="Grand Total" value={fmt(data.summary?.grandTotal)} color="#16a34a" />
            </div>

            {/* By GST Rate */}
            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 16, marginBottom: 16, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 12 }}>GST Rate-wise Summary</h6>
              <Tbl heads={['GST %', 'Invoices', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total']}
                rows={(data.byRate || []).map((r, i) => (
                  <tr key={i}>
                    <td style={{ ...td, fontWeight: 700 }}>{r.gstPercent}%</td>
                    <td style={td}>{r.count}</td>
                    <td style={td}>{fmt(r.taxable)}</td>
                    <td style={{ ...td, color: '#d97706' }}>{fmt(r.cgst)}</td>
                    <td style={{ ...td, color: '#d97706' }}>{fmt(r.sgst)}</td>
                    <td style={{ ...td, color: '#7c3aed' }}>{fmt(r.igst)}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#dc2626' }}>{fmt(r.total)}</td>
                  </tr>
                ))}
              />
            </div>

            <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h6 style={{ fontWeight: 700, marginBottom: 14 }}>Invoice-wise GST Detail</h6>
              <Tbl heads={['Invoice', 'Date', 'Party', 'State', 'GST%', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total']}
                rows={(data.data || []).map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ ...td, color: 'var(--primary, #6366f1)', fontWeight: 600 }}>{r.invoiceNo}</td>
                    <td style={td}>{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td style={td}>{r.partyName}</td>
                    <td style={td}><span style={{ fontSize: 11, background: r.isInterState ? '#ede9fe' : '#dcfce7', color: r.isInterState ? '#7c3aed' : '#16a34a', padding: '2px 6px', borderRadius: 4 }}>{r.isInterState ? 'Inter' : 'Intra'}</span></td>
                    <td style={td}>{r.gstPercent}%</td>
                    <td style={td}>{fmt(r.taxableAmount)}</td>
                    <td style={{ ...td, color: '#d97706' }}>{fmt(r.cgst)}</td>
                    <td style={{ ...td, color: '#d97706' }}>{fmt(r.sgst)}</td>
                    <td style={{ ...td, color: '#7c3aed' }}>{fmt(r.igst)}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{fmt(r.totalAmount)}</td>
                  </tr>
                ))}
              />
            </div>
          </div>
        )}

        {/* ── 10. PAYMENT BOOK ── */}
        {!loading && tab === 'payments' && (
          <div>
            {/* Payment Entry Form */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 24 }}>
              <h6 style={{ fontWeight: 700, marginBottom: 16, color: '#1e293b' }}>💰 Payment Record Karo</h6>
              <form onSubmit={submitPayment}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                  <div><label style={lbl}>Party Name *</label><input style={inp} required placeholder="Party name" value={payForm.partyName} onChange={e => setPayForm(f => ({ ...f, partyName: e.target.value }))} /></div>
                  <div><label style={lbl}>Invoice No</label><input style={inp} placeholder="Invoice no (optional)" value={payForm.invoiceNo} onChange={e => setPayForm(f => ({ ...f, invoiceNo: e.target.value }))} /></div>
                  <div><label style={lbl}>Amount *</label><input style={inp} type="number" required min="1" placeholder="₹ Amount" value={payForm.amount} onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))} /></div>
                  <div><label style={lbl}>Date *</label><input style={inp} type="date" required value={payForm.paymentDate} onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} /></div>
                  <div><label style={lbl}>Mode</label>
                    <select style={inp} value={payForm.paymentMode} onChange={e => setPayForm(f => ({ ...f, paymentMode: e.target.value }))}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="cheque">Cheque</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><label style={lbl}>Reference No</label><input style={inp} placeholder="UPI/Cheque no" value={payForm.referenceNo} onChange={e => setPayForm(f => ({ ...f, referenceNo: e.target.value }))} /></div>
                  <div><label style={lbl}>Note</label><input style={inp} placeholder="Optional note" value={payForm.note} onChange={e => setPayForm(f => ({ ...f, note: e.target.value }))} /></div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <button type="submit" disabled={payLoading} style={{ padding: '10px 28px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                    {payLoading ? 'Saving...' : '✅ Save Payment'}
                  </button>
                  {payMsg && <span style={{ color: payMsg.startsWith('✅') ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{payMsg}</span>}
                </div>
              </form>
            </div>

            {/* Payment history */}
            <DateFilter from={filters.from} to={filters.to} onChange={setFilter}
              extra={<>
                <div><label style={lbl}>Party</label><input style={srchInp} placeholder="Party..." value={filters.party} onChange={e => setFilter('party', e.target.value)} /></div>
                <button onClick={() => load('payments')} style={{ padding: '8px 20px', background: 'var(--primary, #6366f1)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Filter</button>
              </>}
            />
            {data && !data.error && (
              <>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
                  <Card label="Total Payments" value={fmtN(data.count)} color="#6366f1" />
                  <Card label="Total Amount Received" value={fmt(data.total)} color="#16a34a" />
                </div>
                <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
                  <Tbl heads={['Date', 'Party', 'Invoice', 'Amount', 'Mode', 'Reference', 'Note', '']}
                    rows={(data.data || []).map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={td}>{new Date(r.paymentDate).toLocaleDateString('en-IN')}</td>
                        <td style={{ ...td, fontWeight: 600 }}>{r.partyName}</td>
                        <td style={{ ...td, color: 'var(--primary, #6366f1)' }}>{r.invoiceNo || '-'}</td>
                        <td style={{ ...td, fontWeight: 700, color: '#16a34a' }}>{fmt(r.amount)}</td>
                        <td style={td}><span style={{ background: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'capitalize' }}>{r.paymentMode?.replace('_', ' ')}</span></td>
                        <td style={{ ...td, color: '#475569' }}>{r.referenceNo || '-'}</td>
                        <td style={{ ...td, fontSize: 12, color: '#64748b' }}>{r.note || '-'}</td>
                        <td style={td}><button onClick={() => deletePayment(r._id)} style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>Delete</button></td>
                      </tr>
                    ))}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
