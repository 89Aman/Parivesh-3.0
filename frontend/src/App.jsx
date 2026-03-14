import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import MoMPortalGistMinutesEditor from './pages/MoMPortalGistMinutesEditor';
import ScrutinyPortalApplicationReview from './pages/ScrutinyPortalApplicationReview';
import PPPortalDashboard from './pages/PPPortalDashboard';
import PPPortalNewApplicationForm from './pages/PPPortalNewApplicationForm';
import AdminPortalDashboard from './pages/AdminPortalDashboard';
import EntryPortalRoleSelection from './pages/EntryPortalRoleSelection';
import Parivesh3Login from './pages/Parivesh3Login';
import PremiumDarkSidebar from './pages/PremiumDarkSidebar';
import PremiumDashboardStats from './pages/PremiumDashboardStats';
import ApplicationDataTable from './pages/ApplicationDataTable';
import ApplicationWorkflowTimeline from './pages/ApplicationWorkflowTimeline';
import ReviewApplicationModal from './pages/ReviewApplicationModal';
import TopProgressBar from './components/TopProgressBar';
import { ToastProvider } from './components/ToastProvider';
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
          <Route path="/" element={<EntryPortalRoleSelection />} />
          <Route path="/login" element={<Parivesh3Login />} />
          
          {/* Project Proponent Root */}
          <Route path="/pp/dashboard" element={<PPPortalDashboard />} />
          <Route path="/pp/new-application" element={<PPPortalNewApplicationForm />} />
          <Route path="/pp/applications" element={<ApplicationDataTable />} />
          <Route path="/pp/workflow" element={<ApplicationWorkflowTimeline />} />
          <Route path="/pp/review" element={<ReviewApplicationModal />} />
          
          {/* Admin Root */}
          <Route path="/admin/dashboard" element={<AdminPortalDashboard />} />
          <Route path="/admin/stats" element={<PremiumDashboardStats />} />
          <Route path="/admin/sidebar" element={<PremiumDarkSidebar />} />
          
          {/* Committee Root */}
          <Route path="/committee/scrutiny" element={<ScrutinyPortalApplicationReview />} />
          <Route path="/committee/mom-editor" element={<MoMPortalGistMinutesEditor />} />
        </Routes>
      </PageTransition>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;

