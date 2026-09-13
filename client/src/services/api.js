import axios from 'axios';

const TOKEN_KEY = 'admin_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

// Bearer token instead of a cookie — a header isn't subject to browsers'
// (especially iOS Safari/WebKit's) cross-site cookie restrictions, so
// auth works the same on every platform.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export default api;
