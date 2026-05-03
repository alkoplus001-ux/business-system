import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password, rememberMe);
    if (res.success) {
      toast.success('Welcome back! 🎉');
      navigate('/');
    } else {
      toast.error(res.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">

      {/* Animated background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Card */}
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo-box">📦</div>

        <h2 className="login-heading">Welcome Back</h2>
        <p className="login-sub">Sign in to your business dashboard</p>

        <form onSubmit={handleSubmit} noValidate>

          {/* Email */}
          <div className="mb-3">
            <label className="login-label">Email Address</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">📧</span>
              <input
                type="email"
                name="email"
                className="login-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-3">
            <label className="login-label">Password</label>
            <div className="login-input-wrap">
              <span className="login-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="login-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye-btn"
                onClick={() => setShowPassword(p => !p)}
                tabIndex={-1}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="mb-4">
            <label className="remember-row">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              <span>Remember me for 30 days</span>
            </label>
          </div>

          {/* Submit */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="login-spinner" />
                Signing in…
              </>
            ) : (
              'Sign In →'
            )}
          </button>

        </form>

        <p className="login-footer-text">
          New business?{' '}
          <Link to="/register">Register your company</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
