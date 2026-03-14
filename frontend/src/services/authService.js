import api from './api';
import { supabase } from '../supabase';
import {
  clearSession,
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

const syncTokenFromSupabase = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  setAuthToken(session?.access_token || null);
  return session;
};

const hydrateCurrentUser = async () => {
  const session = await syncTokenFromSupabase();
  if (!session?.access_token) {
    clearSession();
    return null;
  }

  const response = await api.get('/auth/me');
  setStoredUser(response.data);
  return response.data;
};

const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Supabase login error:', error);
      throw error;
    }

    setAuthToken(data.session?.access_token || null);
    const user = await hydrateCurrentUser();
    return { session: data.session, user };
  },

  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });

    if (error) {
      console.error('Supabase Google login error:', error);
      throw error;
    }

    return data;
  },

  registerPP: async ({ email, password, full_name, organization, phone }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          organization,
          phone,
        },
      },
    });

    if (error) {
      console.error('Supabase registration error:', error);
      throw error;
    }

    if (data.session?.access_token) {
      setAuthToken(data.session.access_token);
      const user = await hydrateCurrentUser();
      return { session: data.session, user };
    }

    return data;
  },

  logout: async () => {
    await supabase.auth.signOut();
    clearSession();
  },

  getCurrentUser: async () => {
    try {
      return await hydrateCurrentUser();
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  },

  restoreSession: async () => {
    try {
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
