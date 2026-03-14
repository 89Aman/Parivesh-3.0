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
import PlantLoader from './components/PlantLoader';
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
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm font-semibold text-slate-500">Loading your workspace...</p>
    </div>
  </div>
);

function AppContent() {
  useGlobalEffects();
  const location = useLocation();
  const toast = useToast();
  const lastUnauthorizedToastAtRef = useRef(0);
  const [showHelp, setShowHelp] = useState(false);

  useKeyboardShortcuts({
    onOpenHelp: () => setShowHelp((v) => !v),
    onCloseAll: () => setShowHelp(false),
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      const now = Date.now();
      if (now - lastUnauthorizedToastAtRef.current < 2500) {
        return;
      }

      lastUnauthorizedToastAtRef.current = now;
      if (location.pathname !== ROUTES.LOGIN) {
        toast.error('Session expired. Please login again.');
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [location.pathname, toast]);

  return (
    <AppErrorBoundary>
      <TopProgressBar />
      <GlobalSearch />
      {showHelp && <KeyboardShortcutsModal onClose={() => setShowHelp(false)} />}
      <PageTransition key={location.pathname}>
        <Suspense fallback={<RouteLoader />}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path={ROUTES.ROOT} element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path={ROUTES.LOGIN} element={<Parivesh3Login />} />
            <Route path={ROUTES.REGISTER} element={<Parivesh3Register />} />

            {/* Project Proponent Routes – require PP or RQP role */}
            <Route
              path={ROUTES.PP_DASHBOARD}
              element={
                <PPRoute>
                  <PPPortalDashboard />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_NEW_APPLICATION}
              element={
                <PPRoute>
                  <PPPortalNewApplicationForm />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_APPLICATIONS}
              element={
                <PPRoute>
                  <ApplicationDataTable />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_WORKFLOW}
              element={
                <PPRoute>
                  <ApplicationWorkflowTimeline />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_REVIEW}
              element={
                <PPRoute>
                  <ReviewApplicationModal />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_APPLICATION_DETAIL}
              element={
                <PPRoute>
                  <ApplicationDetailPage />
                </PPRoute>
              }
            />
            <Route
              path={ROUTES.PP_COMPLIANCE}
              element={
                <PPRoute>
                  <ComplianceTracker />
                </PPRoute>
              }
            />

            {/* Admin Routes – require ADMIN role */}
            <Route
              path={ROUTES.ADMIN_DASHBOARD}
              element={
                <AdminRoute>
                  <AdminPortalDashboard />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_ANALYTICS}
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_MAP}
              element={
                <AdminRoute>
                  <MapView />
                </AdminRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN_COMPLIANCE}
              element={
                <AdminRoute>
                  <ComplianceMonitor />
                </AdminRoute>
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

            {/* Legacy aliases kept for compatibility */}
            {Object.entries(LEGACY_ROUTE_ALIASES).map(([from, to]) => (
              <Route key={from} path={from} element={<Navigate to={to} replace />} />
            ))}

            {/* Catch-all – redirect to home */}
            <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AppErrorBoundary>
  );
}

function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
