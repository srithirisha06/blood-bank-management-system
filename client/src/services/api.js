import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (isAbsoluteUrl(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildAssetUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  if (isAbsoluteUrl(path)) return path;
  if (path.startsWith('/uploads')) return buildApiUrl(path);
  return buildApiUrl(`/uploads/${path.replace(/^\/+/, '')}`);
};

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blood_bank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional auto-logout if token invalid
      console.warn('Unauthorized request - session expired or invalid token.');
    }
    return Promise.reject(error);
  }
);

export default api;
