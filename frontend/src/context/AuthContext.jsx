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

  /**
   * Update the current user's username, email, and/or password.
   * On success, syncs the updated profile back into localStorage & context state.
   */
  const updateProfile = async ({ newUsername, newEmail, currentPassword, newPassword }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put('/auth/profile', {
        newUsername: newUsername || null,
        newEmail: newEmail || null,
        currentPassword: currentPassword || null,
        newPassword: newPassword || null,
      });

      const updatedProfile = response.data.data;

      // Merge updated fields back into stored user and update the JWT token if returned
      const mergedUser = {
        ...user,
        username: updatedProfile.username || user.username,
        email: updatedProfile.email || user.email,
        fullName: updatedProfile.fullName || user.fullName,
      };

      if (updatedProfile.token) {
        mergedUser.token = updatedProfile.token;
        localStorage.setItem('tradevault_token', updatedProfile.token);
      }

      setUser(mergedUser);
      localStorage.setItem('tradevault_user', JSON.stringify(mergedUser));
      setLoading(false);
      return updatedProfile;
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Profile update failed.';
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
    updateProfile,
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
