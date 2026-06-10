import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios default authorization header
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setAuthHeader(token);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // If the server rejects our token (expired, or signed with a rotated
  // secret), clear the dead session instead of failing every request.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        const isLoginAttempt = error.config?.url?.includes('/auth/login');
        if (error.response?.status === 401 && !isLoginAttempt && localStorage.getItem('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthHeader(null);
          setUser(null);
          toast.error('Your session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const login = async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthHeader(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setAuthHeader(data.token);
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthHeader(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
