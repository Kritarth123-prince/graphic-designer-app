import axios from 'axios';

const TOKEN_KEY = 'admin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Bearer token auth (not cookies) — cross-site cookies get blocked by
// Safari's cross-site tracking prevention on iOS regardless of
// SameSite/Secure flags, which broke admin login there in production.
// A header isn't subject to that at all, and works the same everywhere.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export default api;
