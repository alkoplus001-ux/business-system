import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../App.css';

/* Smooth count-up animation hook */
const useCountUp = (target, duration = 1400) => {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) { setValue(0); return; }

    const start = performance.now();
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return value;
};

const Dashboard = () => {
  const { company } = useAuth();
  const [stats, setStats] = useState({ totalProducts: 0, totalStock: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const animatedProducts = useCountUp(loading ? 0 : stats.totalProducts);
  const animatedStock    = useCountUp(loading ? 0 : stats.totalStock, 1600);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/products');
        const products = res.data.data || [];
        setStats({
          totalProducts: products.length,
          totalStock: products.reduce(
            (sum, p) => sum + (p.cartons * p.pairPerCarton),
            0
          )
        });
      } catch {
        setStats({ totalProducts: 0, totalStock: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleFullExcelExport = async () => {
    setExporting(true);
    try {
      const response = await api.get('/products/export-all', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Inventory-Database.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dashboard-page">

      {/* ── Hero ── */}
      <section className="dashboard-hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-logo-box">👟</div>
            <h1 className="hero-title">
              {company?.name || 'My Business'}
            </h1>
            <p className="hero-subtitle">
              Your complete inventory &amp; business hub
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="stats-section">
        <div className="container">
          <div className="row g-4 justify-content-center">

            {/* Products Card */}
            <div className="col-12 col-sm-6 col-md-4 anim-fade-up delay-1">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: 'rgba(99, 102, 241, 0.1)' }}
                >
                  📦
                </div>
                <div className="stat-number" style={{ color: '#6366f1' }}>
                  {loading
                    ? <span className="skeleton" style={{ width: 80, height: 36 }}>&nbsp;</span>
                    : animatedProducts.toLocaleString()
                  }
                </div>
                <div className="stat-label">Total Products</div>
              </div>
            </div>

            {/* Stock Card */}
            <div className="col-12 col-sm-6 col-md-4 anim-fade-up delay-2">
              <div className="stat-card">
                <div
                  className="stat-icon"
                  style={{ background: 'rgba(16, 185, 129, 0.1)' }}
                >
                  👟
                </div>
                <div className="stat-number" style={{ color: '#10b981' }}>
                  {loading
                    ? <span className="skeleton" style={{ width: 100, height: 36 }}>&nbsp;</span>
                    : animatedStock.toLocaleString()
                  }
                </div>
                <div className="stat-label">Total Pairs in Stock</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="actions-section">
        <div className="container">
          <div className="actions-card">
            <div className="actions-header">
              <h5>⚡ Quick Actions</h5>
              <p>Jump to any section instantly</p>
            </div>

            <div className="d-flex flex-wrap gap-3 justify-content-center">

              <Link to="/products/add" className="action-btn action-btn-primary anim-fade-up delay-1">
                ➕ Add New Product
              </Link>

              <Link to="/products" className="action-btn action-btn-outline anim-fade-up delay-2">
                📋 View All Products
              </Link>

              <Link to="/products/salary-report" className="action-btn action-btn-outline anim-fade-up delay-3">
                💰 Salary Report
              </Link>

              <Link to="/challans" className="action-btn action-btn-outline anim-fade-up delay-4">
                📄 Challan PDF
              </Link>

              <button
                onClick={handleFullExcelExport}
                disabled={exporting}
                className="action-btn action-btn-green anim-fade-up delay-5"
              >
                {exporting ? (
                  <>
                    <span
                      style={{
                        width: 14, height: 14,
                        border: '2px solid rgba(255,255,255,0.35)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite'
                      }}
                    />
                    Exporting…
                  </>
                ) : (
                  <>💾 Export Database</>
                )}
              </button>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
