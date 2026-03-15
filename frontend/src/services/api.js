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
    // Keep the user-configured local host/port intact.
    // Silent port rewriting can route requests to a stale backend process.
    // We only validate URL shape here.
    new URL(baseUrl);
  } catch {
    return getDefaultApiBaseUrl();
  }

  return baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = normalizeLocalApiBaseUrl(import.meta.env.VITE_API_BASE_URL || getDefaultApiBaseUrl());

const LOCAL_FALLBACK_PORTS = ['8000', '8001'];

const isPrivateIpv4Host = (hostname) => {
  if (!hostname) return false;
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
  return false;
};

const isLocalNetworkHost = (hostname) => {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    isPrivateIpv4Host(hostname)
  );
};

const getErrorDetailText = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === 'string') return detail.toLowerCase();
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          return item.msg || JSON.stringify(item);
        }
        return '';
      })
      .join(' ')
      .toLowerCase();
  }
  return '';
};

const shouldTriggerGlobalUnauthorized = (error) => {
  if (error?.response?.status !== 401) return false;

  const config = error?.config || {};
  if (config.__skipGlobalUnauthorized) return false;

  const requestUrl = `${config.baseURL || ''}${config.url || ''}`.toLowerCase();

  // Wrong credentials and similar auth form flows should not nuke session globally.
  if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register')) {
    return false;
  }

  // /auth/me is our canonical session validity check.
  if (requestUrl.includes('/auth/me')) {
    return true;
  }

  const detailText = getErrorDetailText(error);
  return (
    detailText.includes('not authenticated') ||
    detailText.includes('could not validate credentials') ||
    detailText.includes('invalid token') ||
    detailText.includes('token has expired') ||
    detailText.includes('signature')
  );
};

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
    if (typeof window === 'undefined') {
      return [];
    }

    // Resolve relative API base URLs (for example /api/v1) against the page origin
    // so localhost and loopback fallbacks can still be generated.
    try {
      parsed = new URL(baseUrl, window.location.origin);
    } catch {
      return [];
    }
  }

  const hostCandidates = [parsed.hostname];
  if (parsed.hostname === 'localhost') hostCandidates.push('127.0.0.1');
  if (parsed.hostname === '127.0.0.1') hostCandidates.push('localhost');

  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    if (currentHost && !hostCandidates.includes(currentHost)) {
      hostCandidates.push(currentHost);
    }
  }

  const resolvedPort = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
  const portCandidates = [resolvedPort];

  const shouldAddLocalPorts =
    LOCAL_FALLBACK_PORTS.includes(parsed.port) ||
    (typeof window !== 'undefined' &&
      (window.location.port === '5173' || window.location.port === '4173') &&
      isLocalNetworkHost(window.location.hostname)) ||
    isLocalNetworkHost(parsed.hostname);

  if (shouldAddLocalPorts) {
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

    if (shouldTriggerGlobalUnauthorized(error)) {
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
    return `Cannot connect to backend server. Checked ${API_BASE_URL} with localhost/127.0.0.1 and local-hostname fallbacks on ports 8000/8001.`;
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
