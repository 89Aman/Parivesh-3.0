import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { canAccessPathForUser, getDefaultRouteForUser } from '../services/authService';
import { ROUTES } from '../constants/routes';
import SimpleSpinner from './SimpleSpinner';

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <SimpleSpinner
        title="Checking session..."
        subtitle="Verifying your access permissions."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // A partially hydrated session (missing roles) can cause redirect loops on reload.
  // Bounce to login so session can be re-established cleanly.
  if (!Array.isArray(user?.roles) || user.roles.length === 0) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role mismatch should bounce to the best allowed route for this user.
  const canonicalRoute = getDefaultRouteForUser(user);
  if (!canAccessPathForUser(user, location.pathname)) {
    const target = canonicalRoute === location.pathname ? ROUTES.LOGIN : canonicalRoute;
    return <Navigate to={target} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole(...requiredRoles)) {
    const target = canonicalRoute === location.pathname ? ROUTES.LOGIN : canonicalRoute;
    return <Navigate to={target} replace />;
  }

  return children;
};

/**
 * Shorthand for admin-only routes.
 */
export const AdminRoute = ({ children }) => {
  return <ProtectedRoute requiredRoles={['ADMIN']}>{children}</ProtectedRoute>;
};

/**
 * Shorthand for PP routes.
 */
export const PPRoute = ({ children }) => {
  return <ProtectedRoute requiredRoles={['PP', 'RQP']}>{children}</ProtectedRoute>;
};

/**
 * Shorthand for Scrutiny routes.
 */
export const ScrutinyRoute = ({ children }) => {
  return <ProtectedRoute requiredRoles={['SCRUTINY']}>{children}</ProtectedRoute>;
};

/**
 * Shorthand for MoM routes.
 */
export const MoMRoute = ({ children }) => {
  return <ProtectedRoute requiredRoles={['MOM']}>{children}</ProtectedRoute>;
};
