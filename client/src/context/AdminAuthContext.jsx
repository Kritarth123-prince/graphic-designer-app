import React, { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/adminAuth.service';
import { getAuthToken } from '../services/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getAuthToken()) {
      setChecking(false);
      return;
    }
    authService
      .me()
      .then(setAdmin)
      .catch(() => setAdmin(null))
      .finally(() => setChecking(false));
  }, []);

  async function login(email, password) {
    const loggedInAdmin = await authService.login(email, password);
    setAdmin(loggedInAdmin);
    return loggedInAdmin;
  }

  async function logout() {
    await authService.logout();
    setAdmin(null);
  }

  return (
    <AdminAuthContext.Provider value={{ admin, checking, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
