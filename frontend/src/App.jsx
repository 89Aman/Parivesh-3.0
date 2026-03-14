import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ToastProvider, { useToast } from './components/ToastProvider';
import { ProtectedRoute, AdminRoute, PPRoute, ScrutinyRoute, MoMRoute } from './components/ProtectedRoute';
import { AUTH_UNAUTHORIZED_EVENT } from './services/api';
import { LEGACY_ROUTE_ALIASES, ROUTES } from './constants/routes';

import TopProgressBar from './components/TopProgressBar';
import PageTransition from './components/PageTransition';
import AppErrorBoundary from './components/AppErrorBoundary';
import useGlobalEffects from './hooks/useGlobalEffects';
import SimpleSpinner from './components/SimpleSpinner';
import GlobalSearch from './components/GlobalSearch';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import useKeyboardShortcuts from './hooks/useKeyboardShortcuts';

const MoMPortalGistMinutesEditor = lazy(() => import('./pages/MoMPortalGistMinutesEditor'));
const ScrutinyPortalApplicationReview = lazy(() => import('./pages/ScrutinyPortalApplicationReview'));
const PPPortalDashboard = lazy(() => import('./pages/PPPortalDashboard'));
const PPPortalNewApplicationForm = lazy(() => import('./pages/PPPortalNewApplicationForm'));
const AdminPortalDashboard = lazy(() => import('./pages/AdminPortalDashboard'));
const Parivesh3Login = lazy(() => import('./pages/Parivesh3Login'));
const Parivesh3Register = lazy(() => import('./pages/Parivesh3Register'));
const ApplicationDataTable = lazy(() => import('./pages/ApplicationDataTable'));
const ApplicationWorkflowTimeline = lazy(() => import('./pages/ApplicationWorkflowTimeline'));
const ReviewApplicationModal = lazy(() => import('./pages/ReviewApplicationModal'));
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const MapView = lazy(() => import('./pages/admin/MapView'));
const ComplianceMonitor = lazy(() => import('./pages/admin/ComplianceMonitor'));
const ComplianceTracker = lazy(() => import('./pages/pp/ComplianceTracker'));

const RouteLoader = () => (
  <SimpleSpinner
    title="Loading page..."
    subtitle="Please wait."
  />
);

function AppContent() {
  useGlobalEffects();
  const location = useLocation();
  const toast = useToast();
  const lastUnauthorizedToastAtRef = useRef(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useKeyboardShortcuts({
    onSearch: () => setShowSearch(true),
    onHelp: () => setShowHelp(true),
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      const now = Date.now();
      if (now - lastUnauthorizedToastAtRef.current > 5000) {
        toast.error('Session expired. Please log in again.');
        lastUnauthorizedToastAtRef.current = now;
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
  }, [toast]);

  return (
    <ThemeProvider>
      <AppErrorBoundary>
        <div className="relative min-h-screen bg-slate-50 font-sans text-slate-900 antialiased selection:bg-primary/10 selection:text-primary">
          <TopProgressBar />
          <GlobalSearch isOpen={showSearch} onClose={() => setShowSearch(false)} />
          <KeyboardShortcutsModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
          
          <Suspense fallback={<RouteLoader />}>
            <PageTransition location={location}>
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.LOGIN} element={<Parivesh3Login />} />
                <Route path={ROUTES.REGISTER} element={<Parivesh3Register />} />

                {/* Legacy Aliases */}
                {Object.entries(LEGACY_ROUTE_ALIASES).map(([oldPath, newPath]) => (
                  <Route key={oldPath} path={oldPath} element={<Navigate to={newPath} replace />} />
                ))}

                {/* Admin Routes */}
                <Route
                  path={`${ROUTES.ADMIN_PREFIX}/*`}
                  element={
                    <AdminRoute>
                      <Routes>
                        <Route path="dashboard" element={<AdminPortalDashboard />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="map" element={<MapView />} />
                        <Route path="compliance" element={<ComplianceMonitor />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AdminRoute>
                  }
                />

                {/* PP Routes */}
                <Route
                  path={`${ROUTES.PP_PREFIX}/*`}
                  element={
                    <PPRoute>
                      <Routes>
                        <Route path="dashboard" element={<PPPortalDashboard />} />
                        <Route path="apply" element={<PPPortalNewApplicationForm />} />
                        <Route path="compliance" element={<ComplianceTracker />} />
                        <Route path="applications/:id" element={<ApplicationDetailPage />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </PPRoute>
                  }
                />

                {/* Committee Routes – require SCRUTINY or MOM role */}
                <Route
                  path={ROUTES.COMMITTEE_SCRUTINY}
                  element={
                    <ScrutinyRoute>
                      <ScrutinyPortalApplicationReview />
                    </ScrutinyRoute>
                  }
                />
                <Route path="/scrutiny/dashboard" element={<Navigate to={ROUTES.COMMITTEE_SCRUTINY} replace />} />
                <Route
                  path={ROUTES.COMMITTEE_MOM_EDITOR}
                  element={
                    <MoMRoute>
                      <MoMPortalGistMinutesEditor />
                    </MoMRoute>
                  }
                />

                {/* Default Redirects */}
                <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </PageTransition>
          </Suspense>
        </div>
      </AppErrorBoundary>
    </ThemeProvider>
  );
}

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
