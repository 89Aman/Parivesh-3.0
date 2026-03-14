import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import authService from '../services/authService';
import { getAuthToken } from '../services/session';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // ── Instant startup: read cached user + token from localStorage ──
  const cachedUser = authService.getStoredUser();
  const cachedToken = getAuthToken();
  const hasCachedSession = Boolean(cachedUser && cachedToken);

  const [user, setUser] = useState(cachedUser);
  const [isLoading, setIsLoading] = useState(!hasCachedSession); // only block if NO cache
  const [isAuthenticated, setIsAuthenticated] = useState(hasCachedSession);
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

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password);
    setUser(result.user);
    setIsAuthenticated(true);
    return result;
  }, []);



  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
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
