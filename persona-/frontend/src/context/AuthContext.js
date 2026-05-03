import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem('token');
      const sessionToken = sessionStorage.getItem('token');
      const authToken = localToken || sessionToken;

      if (authToken) {
        api.defaults.headers.common['x-auth-token'] = authToken;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
          setCompany(res.data.companyId); // populated company object
          setToken(authToken);
        } catch {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setUser(null);
          setCompany(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: authToken, user: userData, company: companyData } = res.data;

      if (rememberMe) {
        localStorage.setItem('token', authToken);
        sessionStorage.removeItem('token');
      } else {
        sessionStorage.setItem('token', authToken);
        localStorage.removeItem('token');
      }

      api.defaults.headers.common['x-auth-token'] = authToken;
      setUser(userData);
      setCompany(companyData);
      setToken(authToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const registerCompany = async (formData) => {
    try {
      const res = await api.post('/auth/register-company', formData);
      const { token: authToken, user: userData, company: companyData } = res.data;

      sessionStorage.setItem('token', authToken);
      api.defaults.headers.common['x-auth-token'] = authToken;
      setUser(userData);
      setCompany(companyData);
      setToken(authToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    setCompany(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, company, token, loading, login, logout, registerCompany }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
