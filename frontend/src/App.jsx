import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import MoMPortalGistMinutesEditor from './pages/MoMPortalGistMinutesEditor';
import ScrutinyPortalApplicationReview from './pages/ScrutinyPortalApplicationReview';
import PPPortalDashboard from './pages/PPPortalDashboard';
import PPPortalNewApplicationForm from './pages/PPPortalNewApplicationForm';
import AdminPortalDashboard from './pages/AdminPortalDashboard';
import EntryPortalRoleSelection from './pages/EntryPortalRoleSelection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EntryPortalRoleSelection />} />
        
        {/* Project Proponent Root */}
        <Route path="/pp/dashboard" element={<PPPortalDashboard />} />
        <Route path="/pp/new-application" element={<PPPortalNewApplicationForm />} />
        
        {/* Admin Root */}
        <Route path="/admin/dashboard" element={<AdminPortalDashboard />} />
        
        {/* Committee Root */}
        <Route path="/committee/scrutiny" element={<ScrutinyPortalApplicationReview />} />
        <Route path="/committee/mom-editor" element={<MoMPortalGistMinutesEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
