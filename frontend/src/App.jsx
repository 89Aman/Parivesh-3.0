import { Suspense, lazy, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider, { useToast } from './components/ToastProvider';
import { ProtectedRoute, AdminRoute, PPRoute, ScrutinyRoute, MoMRoute } from './components/ProtectedRoute';
import { AUTH_UNAUTHORIZED_EVENT } from './services/api';

import TopProgressBar from './components/TopProgressBar';
import PageTransition from './components/PageTransition';
import useGlobalEffects from './hooks/useGlobalEffects';
import PlantLoader from './components/PlantLoader';

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

const RouteLoader = () => (
  <PlantLoader
    title="Growing the next page..."
    subtitle="Watering and nurturing your workspace."
  />
);

function AppContent() {
  useGlobalEffects();
  const location = useLocation();
  const toast = useToast();
  const lastUnauthorizedToastAtRef = useRef(0);

  useEffect(() => {
    const handleUnauthorized = () => {
      const now = Date.now();
      if (now - lastUnauthorizedToastAtRef.current < 2500) {
        return;
      }

      lastUnauthorizedToastAtRef.current = now;
      if (location.pathname !== '/login') {
        toast.error('Session expired. Please login again.');
      }
    };

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [location.pathname, toast]);

  return (
    <>
      <TopProgressBar />
      <PageTransition key={location.pathname}>
        <Suspense fallback={<RouteLoader />}>
          <Routes location={location}>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Parivesh3Login />} />
            <Route path="/register" element={<Parivesh3Register />} />

            {/* Project Proponent Routes – require PP or RQP role */}
            <Route
              path="/pp/dashboard"
              element={
                <PPRoute>
                  <PPPortalDashboard />
                </PPRoute>
              }
            />
            <Route
              path="/pp/new-application"
              element={
                <PPRoute>
                  <PPPortalNewApplicationForm />
                </PPRoute>
              }
            />
            <Route
              path="/pp/applications"
              element={
                <PPRoute>
                  <ApplicationDataTable />
                </PPRoute>
              }
            />
            <Route
              path="/pp/workflow/:appId?"
              element={
                <PPRoute>
                  <ApplicationWorkflowTimeline />
                </PPRoute>
              }
            />
            <Route
              path="/pp/review/:appId?"
              element={
                <PPRoute>
                  <ReviewApplicationModal />
                </PPRoute>
              }
            />
            <Route
              path="/pp/application/:appId"
              element={
                <PPRoute>
                  <ApplicationDetailPage />
                </PPRoute>
              }
            />

            {/* Admin Routes – require ADMIN role */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminPortalDashboard />
                </AdminRoute>
              }
            />

            {/* Committee Routes – require SCRUTINY or MOM role */}
            <Route
              path="/committee/scrutiny"
              element={
                <ScrutinyRoute>
                  <ScrutinyPortalApplicationReview />
                </ScrutinyRoute>
              }
            />
            <Route
              path="/committee/mom-editor"
              element={
                <MoMRoute>
                  <MoMPortalGistMinutesEditor />
                </MoMRoute>
              }
            />

            {/* Catch-all – redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
