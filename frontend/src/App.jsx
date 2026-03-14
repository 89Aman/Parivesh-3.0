import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider from './components/ToastProvider';
import { ProtectedRoute, AdminRoute, PPRoute, ScrutinyRoute, MoMRoute } from './components/ProtectedRoute';

import MoMPortalGistMinutesEditor from './pages/MoMPortalGistMinutesEditor';
import ScrutinyPortalApplicationReview from './pages/ScrutinyPortalApplicationReview';
import PPPortalDashboard from './pages/PPPortalDashboard';
import PPPortalNewApplicationForm from './pages/PPPortalNewApplicationForm';
import AdminPortalDashboard from './pages/AdminPortalDashboard';
import Parivesh3Login from './pages/Parivesh3Login';
import Parivesh3Register from './pages/Parivesh3Register';
import PremiumDarkSidebar from './pages/PremiumDarkSidebar';
import PremiumDashboardStats from './pages/PremiumDashboardStats';
import ApplicationDataTable from './pages/ApplicationDataTable';
import ApplicationWorkflowTimeline from './pages/ApplicationWorkflowTimeline';
import ReviewApplicationModal from './pages/ReviewApplicationModal';
import ApplicationDetailPage from './pages/ApplicationDetailPage';

import TopProgressBar from './components/TopProgressBar';
import PageTransition from './components/PageTransition';
import useGlobalEffects from './hooks/useGlobalEffects';

function AppContent() {
  useGlobalEffects();
  const location = useLocation();

  return (
    <>
      <TopProgressBar />
      <PageTransition key={location.pathname}>
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
          <Route
            path="/admin/stats"
            element={
              <AdminRoute>
                <PremiumDashboardStats />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/sidebar"
            element={
              <AdminRoute>
                <PremiumDarkSidebar />
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
