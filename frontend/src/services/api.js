import axios from 'axios';
import { isSupabaseConfigured, supabase } from '../supabase';
import { clearSession, getAuthToken, setAuthToken } from './session';

export const AUTH_UNAUTHORIZED_EVENT = 'parivesh:auth-unauthorized';

const formatValidationDetail = (detail) => {
  if (typeof detail === 'string') {
    return detail;
  }

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (typeof first === 'string') {
      return first;
    }

    if (first && typeof first === 'object') {
      const loc = Array.isArray(first.loc) ? first.loc.join(' -> ') : first.loc;
      const msg = first.msg || 'Validation error';
      return loc ? `${msg} (${loc})` : msg;
    }

    return 'Validation error';
  }

  if (detail && typeof detail === 'object') {
    return detail.message || JSON.stringify(detail);
  }

  return null;
};

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    const isLocalFrontend =
      (hostname === 'localhost' || hostname === '127.0.0.1') &&
      (port === '5173' || port === '4173');

    if (isLocalFrontend) {
      // Use 127.0.0.1 to avoid host-level localhost intercept conflicts.
      return 'http://127.0.0.1:8000/api/v1';
    }
  }

  return '/api/v1';
};

const normalizeLocalApiBaseUrl = (baseUrl) => {
  if (!baseUrl) return getDefaultApiBaseUrl();

  if (baseUrl.startsWith('/')) {
    return baseUrl.replace(/\/$/, '') || '/api/v1';
  }

  try {
    const parsed = new URL(baseUrl);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (isLocalHost && parsed.port === '8001') {
      parsed.port = '8000';
      return parsed.toString().replace(/\/$/, '');
    }
  } catch {
    return getDefaultApiBaseUrl();
  }

  return baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = normalizeLocalApiBaseUrl(import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl());

const LOCAL_FALLBACK_PORTS = ['8000'];

const isConnectivityError = (error) => {
  const code = error?.code;
  const message = (error?.message || '').toLowerCase();
  return (
    code === 'ERR_NETWORK' ||
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('network error') ||
    message.includes('timeout')
  );
};

const buildApiBaseUrlFallbacks = (baseUrl) => {
  if (!baseUrl) return [];

  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    return [];
  }

  const hostCandidates = [parsed.hostname];
  if (parsed.hostname === 'localhost') hostCandidates.push('127.0.0.1');
  if (parsed.hostname === '127.0.0.1') hostCandidates.push('localhost');

  const portCandidates = [parsed.port || (parsed.protocol === 'https:' ? '443' : '80')];
  if (LOCAL_FALLBACK_PORTS.includes(parsed.port)) {
    LOCAL_FALLBACK_PORTS.forEach((port) => {
      if (!portCandidates.includes(port)) {
        portCandidates.push(port);
      }
    });
  }

  const candidates = [];

  hostCandidates.forEach((hostname) => {
    portCandidates.forEach((port) => {
      const candidate = new URL(baseUrl);
      candidate.hostname = hostname;
      candidate.port = port;

      const normalized = candidate.toString().replace(/\/$/, '');
      if (normalized !== baseUrl.replace(/\/$/, '') && !candidates.includes(normalized)) {
        candidates.push(normalized);
      }
    });
  });

  return candidates;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
  async (error) => {
    const config = error?.config;

    // Retry with localhost/127.0.0.1 + port 8000 fallbacks for local connectivity issues.
    if (isConnectivityError(error) && config) {
      const baseUrl = config.baseURL || API_BASE_URL;
      const fallbackBaseUrls =
        config.__apiBaseFallbacks || buildApiBaseUrlFallbacks(baseUrl);
      const fallbackIndex = config.__apiBaseFallbackIndex || 0;
      const nextBaseUrl = fallbackBaseUrls[fallbackIndex];

      if (nextBaseUrl) {
        config.__apiBaseFallbacks = fallbackBaseUrls;
        config.__apiBaseFallbackIndex = fallbackIndex + 1;
        config.baseURL = nextBaseUrl;
        return api.request(config);
      }
    }

    if (error.response && error.response.status === 401) {
      clearSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallbackMessage = 'Something went wrong.') => {
  if (error?.code === 'PARIVESH_AUTH_RATE_LIMITED') {
    return error?.message || 'Too many login attempts. Please wait before trying again.';
  }

  if (isConnectivityError(error)) {
    return `Cannot connect to backend server. Checked ${API_BASE_URL} with localhost/127.0.0.1 fallback on port 8000.`;
  }

  if (error?.response?.status === 429) {
    return 'Too many login attempts. Please wait and try again shortly.';
  }

  const normalizedDetail = formatValidationDetail(error?.response?.data?.detail);
  if (normalizedDetail) {
    return normalizedDetail;
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallbackMessage
  );
};

export default api;
