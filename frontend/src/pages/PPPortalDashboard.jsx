import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import applicationService from '../services/applicationService';
import authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import metadataService from '../services/metadataService';

const statusStyles = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SUBMITTED: 'bg-primary/10 text-primary',
  UNDER_SCRUTINY: 'bg-amber-100 text-amber-700',
  EDS: 'bg-red-100 text-red-700',
  REFERRED: 'bg-indigo-100 text-indigo-700',
  MOM_GENERATED: 'bg-violet-100 text-violet-700',
  FINALIZED: 'bg-emerald-100 text-emerald-700',
};

const formatStatus = (status) => status.replaceAll('_', ' ');

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

const PPPortalDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(authService.getStoredUser());
  const [applications, setApplications] = useState([]);
  const [sectorMap, setSectorMap] = useState({});

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [profile, apps, sectors] = await Promise.all([
          authService.getCurrentUser(),
          applicationService.getApplications(),
          metadataService.getSectors(),
        ]);

        if (!isActive) {
          return;
        }

        setUser(profile);
        setApplications(apps);
        setSectorMap(
          Object.fromEntries(sectors.map((sector) => [sector.id, sector.name]))
        );
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load dashboard data.'));
        navigate('/login', { replace: true });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [navigate, toast]);

  const counts = applications.reduce(
    (summary, application) => {
      summary.total += 1;
      summary[application.status] = (summary[application.status] || 0) + 1;
      return summary;
    },
    { total: 0, DRAFT: 0, EDS: 0, FINALIZED: 0, SUBMITTED: 0, UNDER_SCRUTINY: 0 }
  );

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-white/90 px-6 py-4 backdrop-blur-md lg:px-40">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-3 text-primary" to="/">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-slate-900">PARIVESH 3.0</h2>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <Link className="border-b-2 border-primary pb-1 text-sm font-semibold text-primary" to="/pp/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to="/pp/applications">
                Applications
              </Link>
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to="/pp/new-application">
                New Application
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-slate-900">{user?.full_name || 'Project Proponent'}</p>
              <p className="text-xs text-slate-500">{user?.email || 'Not signed in'}</p>
            </div>
            <button
              className="rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 lg:px-40">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Welcome, {user?.full_name || 'Project Proponent'}
            </h1>
            <p className="text-base text-slate-500">
              Track your live environmental clearance applications and draft the next submission.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90"
            to="/pp/new-application"
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            New Application
          </Link>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-primary/5 bg-white p-5">
            <span className="material-symbols-outlined text-3xl text-primary">list_alt</span>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Total Applications</p>
            <h3 className="text-2xl font-black text-slate-900">{counts.total}</h3>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-5">
            <span className="material-symbols-outlined text-3xl text-amber-500">pending_actions</span>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Pending EDS</p>
            <h3 className="text-2xl font-black text-slate-900">{counts.EDS}</h3>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-5">
            <span className="material-symbols-outlined text-3xl text-emerald-500">check_circle</span>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Finalized</p>
            <h3 className="text-2xl font-black text-slate-900">{counts.FINALIZED}</h3>
          </div>
          <div className="rounded-xl border border-primary/5 bg-white p-5">
            <span className="material-symbols-outlined text-3xl text-slate-400">draft</span>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">Drafts</p>
            <h3 className="text-2xl font-black text-slate-900">{counts.DRAFT}</h3>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900">My Applications</h2>
              <p className="text-sm text-slate-500">Live data loaded from the PP backend endpoints.</p>
            </div>
            <Link className="text-sm font-bold text-primary hover:underline" to="/pp/applications">
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-y border-primary/10 bg-primary/5">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Application ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Sector</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-600">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500" colSpan="6">
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-slate-500" colSpan="6">
                      No applications yet. Create your first draft to start the workflow.
                    </td>
                  </tr>
                ) : (
                  applications.slice(0, 6).map((application) => (
                    <tr className="hover:bg-primary/[0.02]" key={application.id}>
                      <td className="px-6 py-5 text-sm font-bold text-primary">{application.id.slice(0, 8)}</td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-900">{application.project_name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-slate-400">
                          {application.state || 'State pending'}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">{application.category}</td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {sectorMap[application.sector_id] || `Sector #${application.sector_id}`}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                            statusStyles[application.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-500">{formatDate(application.updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PPPortalDashboard;
