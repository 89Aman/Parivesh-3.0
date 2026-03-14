import axios from 'axios';
import { isSupabaseConfigured, supabase } from '../supabase';
import { clearSession, getAuthToken, setAuthToken } from './session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
  async (config) => {
    let token = getAuthToken();

    if (isSupabaseConfigured && supabase) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const supabaseToken = session?.access_token;
        if (supabaseToken) {
          token = supabaseToken;
          setAuthToken(supabaseToken);
        }
      } catch {
        // Fall back to cached token from localStorage.
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      clearSession();
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong.') => {
  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
};

export default api;
