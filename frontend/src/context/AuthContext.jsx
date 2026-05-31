import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session
  useEffect(() => {
    const storedUser = localStorage.getItem('tradevault_user');
    const storedToken = localStorage.getItem('tradevault_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { username, password });
      const authData = response.data.data;
      
      setUser(authData);
      localStorage.setItem('tradevault_token', authData.token);
      localStorage.setItem('tradevault_user', JSON.stringify(authData));
      setLoading(false);
      return authData;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const register = async (username, password, email, fullName, role) => {
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { username, password, email, fullName, role });
      setLoading(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      setError(errMsg);
      setLoading(false);
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tradevault_token');
    localStorage.removeItem('tradevault_user');
  };

  const isClient = user?.role === 'CLIENT';
  const isOps = user?.role === 'OPERATIONS';
  const isRM = user?.role === 'RELATIONSHIP_MANAGER';
  const isTreasury = user?.role === 'TREASURY';
  const isCompliance = user?.role === 'COMPLIANCE';
  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isClient,
    isOps,
    isRM,
    isTreasury,
    isCompliance,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
