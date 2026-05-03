import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../App.css';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, company } = useAuth();

  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const getInitials = () => {
    const name = user?.name || user?.email || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* ── Navbar ── */}
      <nav className="app-navbar navbar navbar-expand-lg">
        <div className="container" style={{ padding: '0 20px' }}>

          {/* Brand */}
          <Link className="app-brand navbar-brand" to="/">
            <div className="brand-icon">🏪</div>
            <span className="brand-name">{company?.name || 'My Business'}</span>
          </Link>

          {/* Mobile toggler */}
          <button
            className="navbar-toggler border-0 shadow-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ color: '#6366f1', fontSize: '1.1rem' }}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            {/* Left nav links */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0" style={{ gap: '2px' }}>
              <li className="nav-item">
                <Link
                  className={`nav-link-item ${isActive('/products') && !isActive('/products/salary-report') ? 'nav-active' : ''}`}
                  to="/products"
                >
                  📦 Products
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link-item ${isActive('/products/salary-report') ? 'nav-active' : ''}`}
                  to="/products/salary-report"
                >
                  💰 Salary
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link-item ${isActive('/history') ? 'nav-active' : ''}`}
                  to="/history"
                >
                  📊 History
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link-item ${isActive('/tally') ? 'nav-active' : ''}`}
                  to="/tally"
                >
                  🧾 Tally
                </Link>
              </li>
            </ul>

            {/* Right side */}
            <div className="d-flex align-items-center gap-2 mt-2 mt-lg-0">
              <button
                className="theme-toggle-btn"
                onClick={() => setIsDark(d => !d)}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link to="/challans/add" className="btn-nav-success">
                ➕ Create Challan
              </Link>
              <Link to="/products/add" className="btn-nav-primary">
                ➕ Add Product
              </Link>

              {/* User dropdown */}
              <div className="dropdown ms-1">
                <button
                  className="user-avatar-btn dropdown-toggle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ border: 'none', background: 'none' }}
                >
                  <div className="user-avatar-circle">{getInitials()}</div>
                  <span
                    className="d-none d-md-inline"
                    style={{
                      maxWidth: '110px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.82rem',
                      fontWeight: 500,
                      color: '#1e293b'
                    }}
                  >
                    {user?.name || user?.email}
                  </span>
                </button>

                <ul className="dropdown-menu dropdown-menu-end app-dropdown">
                  <li>
                    <div className="dropdown-header-custom">
                      <div className="dropdown-header-label">Signed in as</div>
                      <div className="dropdown-header-value">
                        {user?.name || user?.email}
                      </div>
                    </div>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item-styled is-danger"
                      onClick={handleLogout}
                    >
                      🚪 Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()}{' '}
            {company?.name || 'My Business'}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
