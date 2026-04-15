import axios from 'axios';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Ensure URL ends with /api
const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : 
               (rawApiUrl.endsWith('/') ? `${rawApiUrl}api` : `${rawApiUrl}/api`);

// Base server URL (without /api) for file serving
const SERVER_URL = API_URL.replace(/\/api$/, '');

const api = axios.create({
  baseURL: API_URL.endsWith('/') ? API_URL : `${API_URL}/`,
});

api.interceptors.request.use((config) => {
  // Ensure the URL is relative to the baseURL by stripping the leading slash
  if (config.url && config.url.startsWith('/')) {
    config.url = config.url.substring(1);
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Resolves a file URL from the database.
 * - If it's already absolute (R2 URL like https://...), return as-is.
 * - If it's a legacy local path (/uploads/...), prepend the server URL.
 */
export const getFileUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${SERVER_URL}${path}`;
};

export default api;
