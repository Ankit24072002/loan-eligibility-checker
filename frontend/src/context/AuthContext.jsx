/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const getStoredUser = () => {
  const stored = localStorage.getItem('loanwise_user') || sessionStorage.getItem('loanwise_user');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem('loanwise_user');
    sessionStorage.removeItem('loanwise_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading] = useState(false);

  const saveUser = (userData, remember) => {
    if (remember) {
      localStorage.setItem('loanwise_user', JSON.stringify(userData));
      sessionStorage.removeItem('loanwise_user');
    } else {
      sessionStorage.setItem('loanwise_user', JSON.stringify(userData));
      localStorage.removeItem('loanwise_user');
    }
  };

  const login = (userData, remember = false) => {
    setUser(userData);
    saveUser(userData, remember);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('loanwise_user');
    sessionStorage.removeItem('loanwise_user');
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    if (localStorage.getItem('loanwise_user')) {
      localStorage.setItem('loanwise_user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('loanwise_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
