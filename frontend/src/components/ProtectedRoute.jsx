import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultRouteForUser } from '../services/authService';
import PlantLoader from './PlantLoader';

const getPortalPrefix = (path) => {
  if (path.startsWith('/admin')) return '/admin';
  if (path.startsWith('/pp')) return '/pp';
  if (path.startsWith('/committee/scrutiny')) return '/committee/scrutiny';
  if (path.startsWith('/committee/mom-editor')) return '/committee/mom-editor';
  return '/';
};

/**
 * Protects routes that require authentication.
 * Redirects to /login if user is not authenticated.
 */
export const ProtectedRoute = ({ children, requiredRoles }) => {
  const { isAuthenticated, isLoading, hasRole, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <PlantLoader
        title="Growing your secure session..."
        subtitle="Checking your access permissions."
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Ensure a user can only access their canonical portal family.
  const canonicalRoute = getDefaultRouteForUser(user);
  const canonicalPrefix = getPortalPrefix(canonicalRoute);
  const currentPrefix = getPortalPrefix(location.pathname);
  if (currentPrefix !== canonicalPrefix) {
    return <Navigate to={canonicalRoute} replace />;
  }

  // Role mismatch within same route family should also bounce to canonical route.
  if (requiredRoles && requiredRoles.length > 0 && !hasRole(...requiredRoles)) {
    return <Navigate to={canonicalRoute} replace />;
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
