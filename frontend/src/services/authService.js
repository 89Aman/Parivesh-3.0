import api from './api';
import { isSupabaseConfigured, supabase } from '../supabase';
import {
  clearSession,
  getAuthToken,
  getStoredUser,
  setAuthToken,
  setStoredUser,
} from './session';

const getRoleNames = (user) => (user?.roles || []).map((role) => role.name);
const RATE_LIMIT_ERROR_CODE = 'PARIVESH_AUTH_RATE_LIMITED';
const DEFAULT_LOGIN_COOLDOWN_SECONDS = 60;

let loginCooldownUntil = 0;

const getErrorStatusCode = (error) => {
  if (typeof error?.response?.status === 'number') return error.response.status;
  if (typeof error?.status === 'number') return error.status;
  return null;
};

const extractRetryAfterSeconds = (error) => {
  const retryAfterHeader =
    error?.response?.headers?.['retry-after'] ??
    error?.response?.headers?.['Retry-After'];

  const parsedHeader = Number.parseInt(retryAfterHeader, 10);
  if (Number.isFinite(parsedHeader) && parsedHeader > 0) {
    return parsedHeader;
  }

  const errorText = [
    error?.response?.data?.detail,
    error?.response?.data?.message,
    error?.message,
  ]
    .filter(Boolean)
    .map((value) => String(value))
    .join(' ')
    .toLowerCase();

  const minuteMatch = errorText.match(/(\d+)\s*(minute|min)/);
  if (minuteMatch) {
    return Number.parseInt(minuteMatch[1], 10) * 60;
  }

  const secondMatch = errorText.match(/(\d+)\s*(second|sec)/);
  if (secondMatch) {
    return Number.parseInt(secondMatch[1], 10);
  }

  return DEFAULT_LOGIN_COOLDOWN_SECONDS;
};

const createRateLimitError = (retryAfterSeconds) => {
  const err = new Error(
    `Too many login attempts. Try again in ${Math.max(1, retryAfterSeconds)} seconds.`
  );
  err.code = RATE_LIMIT_ERROR_CODE;
  err.retryAfterSeconds = Math.max(1, retryAfterSeconds);
  return err;
};

const enforceLocalCooldown = () => {
  if (Date.now() < loginCooldownUntil) {
    const remainingSeconds = Math.ceil((loginCooldownUntil - Date.now()) / 1000);
    throw createRateLimitError(remainingSeconds);
  }
};

const registerRateLimit = (error) => {
  const retryAfterSeconds = extractRetryAfterSeconds(error);
  loginCooldownUntil = Date.now() + retryAfterSeconds * 1000;
  throw createRateLimitError(retryAfterSeconds);
};

export const isLoginRateLimitError = (error) => error?.code === RATE_LIMIT_ERROR_CODE;

export const canAccessPathForUser = (user, path) => {
  if (!path) return false;
  const roles = getRoleNames(user);

  if (path.startsWith('/admin')) {
    return roles.includes('ADMIN');
  }

  if (path.startsWith('/pp')) {
    return roles.includes('PP') || roles.includes('RQP');
  }

  if (path.startsWith('/committee/scrutiny')) {
    return roles.includes('SCRUTINY');
  }

  if (path.startsWith('/committee/mom-editor')) {
    return roles.includes('MOM');
  }

  return true;
};

export const getDefaultRouteForUser = (user) => {
  const roles = getRoleNames(user);

  if (roles.includes('ADMIN')) {
    return '/admin/dashboard';
  }

  if (roles.includes('SCRUTINY')) {
    return '/committee/scrutiny';
  }

  if (roles.includes('MOM')) {
    return '/committee/mom-editor';
  }

  return '/pp/dashboard';
};

export const getSafeRouteForUser = (user, requestedPath) => {
  if (requestedPath && canAccessPathForUser(user, requestedPath)) {
    return requestedPath;
  }
  return getDefaultRouteForUser(user);
};

let hydrateUserPromise = null;

const hydrateCurrentUser = async () => {
  if (hydrateUserPromise) {
    return hydrateUserPromise;
  }

  hydrateUserPromise = api
    .get('/auth/me')
    .then((response) => {
      setStoredUser(response.data);
      return response.data;
    })
    .catch((error) => {
      clearSession();
      throw error;
    })
    .finally(() => {
      hydrateUserPromise = null;
    });

  return hydrateUserPromise;
};

const authService = {
  login: async (email, password) => {
    enforceLocalCooldown();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (getErrorStatusCode(error) === 429) {
          registerRateLimit(error);
        }
        throw error;
      }

      const token = data?.session?.access_token;
      if (!token) {
        throw new Error('Supabase session could not be established.');
      }

      setAuthToken(token);
      const user = await hydrateCurrentUser();
      return { token, user };
    }

    let response;

    try {
      response = await api.post('/auth/login', { email, password });
    } catch (error) {
      if (getErrorStatusCode(error) === 429) {
        registerRateLimit(error);
      }
      throw error;
    }

    loginCooldownUntil = 0;

    const token = response.data.access_token;
    const user = response.data.user || null;
    setAuthToken(token);

    if (user) {
      setStoredUser(user);
      return { token, user };
    }

    const hydratedUser = await hydrateCurrentUser();
    return { token, user: hydratedUser };
  },


  registerPP: async ({ email, password, full_name, organization, phone }) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name || 'Project Proponent',
            organization: organization || null,
            phone: phone || null,
          },
        },
      });

      if (error) {
        throw error;
      }

      const token = data?.session?.access_token || null;
      if (!token) {
        return { user: null, requiresEmailVerification: true };
      }

      setAuthToken(token);
      const user = await hydrateCurrentUser();
      return { token, user, requiresEmailVerification: false };
    }

    await api.post('/auth/register-pp', {
      email,
      password,
      full_name: full_name || 'Project Proponent',
      organization,
      phone,
    });

    return authService.login(email, password);
  },

  logout: async () => {
    let signOutError = null;
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      signOutError = error;
    } finally {
      clearSession();
    }

    // Keep logout UX stable even when upstream sign-out fails.
    if (signOutError) {
      // eslint-disable-next-line no-console
      console.warn('Sign-out completed locally but remote sign-out failed.', signOutError);
    }
  },

  getCurrentUser: async () => {
    return hydrateCurrentUser();
  },

  restoreSession: async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          clearSession();
          return null;
        }

        setAuthToken(session.access_token);
        return await hydrateCurrentUser();
      }

      const storedUser = getStoredUser();
      const token = getAuthToken();
      if (!storedUser || !token) {
        return null;
      }

      return await hydrateCurrentUser();
    } catch {
      clearSession();
      return null;
    }
  },

  getStoredUser,
  getDefaultRouteForUser,
};

export default authService;
