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
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
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

    const response = await api.post('/auth/login', { email, password });
    const token = response.data.access_token;
    setAuthToken(token);

    const user = await hydrateCurrentUser();
    return { token, user };
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
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    clearSession();
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
