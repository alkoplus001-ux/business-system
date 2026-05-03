import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const RegisterCompany = () => {
  const [form, setForm] = useState({
    companyName: '',
    companyPhone: '',
    companyAddress: '',
    gst: '',
    adminName: '',
    email: '',       // single email — used for login
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { registerCompany } = useAuth();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = e => {
    e.preventDefault();
    if (!form.companyName) {
      toast.error('Company name is required');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.adminName || !form.email || !form.password) {
      toast.error('Name, email and password are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    // send both companyEmail and adminEmail as same email
    const payload = {
      companyName: form.companyName,
      companyEmail: form.email,
      companyPhone: form.companyPhone,
      companyAddress: form.companyAddress,
      gst: form.gst,
      adminName: form.adminName,
      adminEmail: form.email,
      adminPassword: form.password
    };
    const res = await registerCompany(payload);
    if (res.success) {
      toast.success('Company registered! Welcome.');
      navigate('/');
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    card: {
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '16px',
      padding: '40px',
      boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '440px'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e2e8f0',
      borderRadius: '10px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      background: '#fafafa',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '14px',
      background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
      border: 'none',
      borderRadius: '10px',
      color: 'white',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    outlineBtn: {
      width: '100%',
      padding: '12px',
      background: 'transparent',
      border: '2px solid #cbd5e0',
      borderRadius: '10px',
      color: '#475569',
      fontSize: '14px',
      cursor: 'pointer',
      marginBottom: '10px'
    },
    stepDot: (active) => ({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: active ? '#2a5298' : '#e2e8f0',
      display: 'inline-block'
    })
  };

  return (
    <>
      <style>{`
        .reg-input:focus {
          border-color: #2a5298 !important;
          outline: none;
          background: white !important;
          box-shadow: 0 0 0 3px rgba(42, 82, 152, 0.1);
        }
        .reg-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(30, 60, 114, 0.3);
        }
        .reg-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      <div style={styles.container}>
        <div style={styles.card}>

          {/* Header */}
          <div className="text-center mb-3">
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🏢</div>
            <h2 className="fw-bold text-dark mb-1">Register Company</h2>
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              {step === 1 ? 'Step 1 of 2 — Company Details' : 'Step 2 of 2 — Login Credentials'}
            </p>
          </div>

          {/* Step dots */}
          <div className="d-flex justify-content-center gap-2 mb-4">
            <span style={styles.stepDot(step >= 1)} />
            <span style={styles.stepDot(step >= 2)} />
          </div>

          {/* ── STEP 1: Company Info ── */}
          {step === 1 && (
            <form onSubmit={handleNext}>
              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                  Company Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  className="reg-input"
                  style={styles.input}
                  placeholder="e.g. Sharma Footwear Pvt Ltd"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>Phone</label>
                <input
                  type="text"
                  name="companyPhone"
                  className="reg-input"
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  value={form.companyPhone}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>GST Number</label>
                <input
                  type="text"
                  name="gst"
                  className="reg-input"
                  style={styles.input}
                  placeholder="e.g. 07AABCU9603R1ZX"
                  value={form.gst}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  className="reg-input"
                  style={styles.input}
                  placeholder="Company address"
                  value={form.companyAddress}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="reg-btn" style={styles.button}>
                Next →
              </button>
            </form>
          )}

          {/* ── STEP 2: Login Credentials ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                  Your Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="adminName"
                  className="reg-input"
                  style={styles.input}
                  placeholder="Admin / Owner name"
                  value={form.adminName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                  Email <span style={{ color: 'red' }}>*</span>
                  <span style={{ fontWeight: 'normal', color: '#94a3b8', marginLeft: '6px' }}>(login ke liye)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  className="reg-input"
                  style={styles.input}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                  Password <span style={{ color: 'red' }}>*</span>
                  <span style={{ fontWeight: 'normal', color: '#94a3b8', marginLeft: '6px' }}>(login ke liye)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="reg-input"
                    style={{ ...styles.input, paddingRight: '45px' }}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                    tabIndex={-1}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-medium text-dark mb-1" style={{ fontSize: '14px' }}>
                  Confirm Password <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="reg-input"
                  style={styles.input}
                  placeholder="Password dobara likho"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="button" style={styles.outlineBtn} onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="reg-btn" style={styles.button} disabled={loading}>
                {loading ? 'Registering...' : 'Register & Login →'}
              </button>
            </form>
          )}

          <p className="text-center mt-3 mb-0" style={{ fontSize: '14px', color: '#64748b' }}>
            Pehle se account hai?{' '}
            <Link to="/login" style={{ color: '#2a5298', fontWeight: '600', textDecoration: 'none' }}>
              Login karo
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterCompany;
