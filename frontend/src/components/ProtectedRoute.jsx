import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getDefaultRouteForUser } from '../services/authService';

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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !hasRole(...requiredRoles)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <span className="material-symbols-outlined text-3xl text-red-600">block</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="mb-6 text-sm text-slate-500">
            You do not have the required permissions to access this page.
            Required role: <strong>{requiredRoles.join(' or ')}</strong>
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Go Home
          </a>
        </div>
      </div>
    );
  }

  // Ensure a user can only access their canonical portal family.
  const canonicalRoute = getDefaultRouteForUser(user);
  const canonicalPrefix = getPortalPrefix(canonicalRoute);
  const currentPrefix = getPortalPrefix(location.pathname);
  if (currentPrefix !== canonicalPrefix) {
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
