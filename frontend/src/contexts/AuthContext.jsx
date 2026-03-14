import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import authService from '../services/authService';
import { AUTH_UNAUTHORIZED_EVENT } from '../services/api';

const AuthContext = createContext(null);

const fallbackAuthContext = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  userRoles: [],
  isAdmin: false,
  hasRole: () => false,
  login: authService.login,
  logout: authService.logout,
  refreshUser: authService.getCurrentUser,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Avoid blank-screen crashes during transient render/HMR edge-cases.
    // AuthProvider should still wrap the app in normal execution.
    return fallbackAuthContext;
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Read cached user for UI continuity, but do not treat it as authenticated
  // until restoreSession validates the token with the backend/supabase.
  const cachedUser = authService.getStoredUser();

  const [user, setUser] = useState(cachedUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const didInitialize = useRef(false);

  // ── Background validation (does not block rendering) ──
  const hydrateUser = useCallback(async () => {
    try {
      const profile = await authService.restoreSession();
      if (profile) {
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      return profile;
    } catch {
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      // We don't want to double-fetch on StrictMode, but we still need to clear isLoading
      if (didInitialize.current) {
        if (isActive) setIsLoading(false);
        return;
      }
      didInitialize.current = true;

      try {
        await hydrateUser();
      } catch {
        // ignore
      }

      if (isActive) {
        setIsLoading(false);
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, [hydrateUser]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  }, []);



  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Session is already cleared in authService finally block.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await authService.getCurrentUser();
    if (profile) {
      setUser(profile);
      setIsAuthenticated(true);
    }
    return profile;
  }, []);

  const userRoles = useMemo(() => {
    return (user?.roles || []).map((role) => role.name);
  }, [user]);

  const hasRole = useCallback(
    (...roles) => {
      return roles.some((role) => userRoles.includes(role));
    },
    [userRoles]
  );

  const isAdmin = useMemo(() => hasRole('ADMIN'), [hasRole]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      userRoles,
      isAdmin,
      hasRole,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, isAuthenticated, userRoles, isAdmin, hasRole, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
