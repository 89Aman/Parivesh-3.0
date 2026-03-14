import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PariveshBrand from '../components/PariveshBrand';
import { useToast } from '../components/ToastProvider';
import applicationService from '../services/applicationService';
import authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import metadataService from '../services/metadataService';
import { ROUTES } from '../constants/routes';

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
        navigate(ROUTES.LOGIN, { replace: true });
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
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const activeApplications = applications.filter((application) => application.status !== 'FINALIZED').length;
  const latestApplications = [...applications]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 6);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#070f07] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 left-12 h-72 w-72 rounded-full bg-[#22c55e]/6 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#091209]/80 px-6 py-4 backdrop-blur-xl lg:px-14">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-3 text-white" to={ROUTES.ROOT}>
              <PariveshBrand subtitle="Project Proponent" theme="dark" />
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <Link className="border-b border-[#22c55e] pb-1 text-sm font-semibold text-[#22c55e]" to={ROUTES.PP_DASHBOARD}>
                Dashboard
              </Link>
              <Link className="text-sm font-medium text-white/55 transition-colors hover:text-white" to={ROUTES.PP_APPLICATIONS}>
                Applications
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold text-white">{user?.full_name || 'Project Proponent'}</p>
              <p className="text-xs text-white/45">{user?.email || 'Not signed in'}</p>
            </div>
            <button
              className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-semibold text-white/75 transition-colors hover:bg-white/[0.08] hover:text-white"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative flex-1 px-4 py-8 lg:px-14">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22c55e]/70">Workspace Overview</p>
            <h1 className="text-3xl font-black tracking-tight text-white lg:text-4xl">
              Welcome, {user?.full_name || 'Project Proponent'}
            </h1>
            <p className="text-base text-white/45">
              Track your live environmental clearance applications and draft the next submission.
            </p>
          </div>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#22c55e] to-emerald-400 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#062706] shadow-lg shadow-[#22c55e]/20 transition-all hover:scale-[1.02]"
            to={ROUTES.PP_NEW_APPLICATION}
          >
            <span className="material-symbols-outlined text-xl">add_circle</span>
            New Application
          </Link>
        </div>

        <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3 text-indigo-300">
              <span className="material-symbols-outlined mt-0.5 text-2xl">info</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Mandatory: Submit Application Gist</h3>
              <p className="mt-1 text-sm text-white/60">
                You must submit the details of your project (Gist/brief summary) of the applied case for reference and discussion in the upcoming meeting.
              </p>
              <a
                href="https://sites.google.com/view/ec-tor-form-submission/gist-submission-page"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-indigo-400/20 bg-indigo-500/15 px-4 py-2 text-sm font-semibold text-indigo-200 shadow-sm transition-colors hover:bg-indigo-500/20"
              >
                Submit Gist Form
                <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Applications', value: counts.total, icon: 'list_alt', tone: 'from-[#22c55e]/20 to-[#22c55e]/5', iconTone: 'text-[#22c55e]' },
            { label: 'Active Pipeline', value: activeApplications, icon: 'timeline', tone: 'from-blue-500/20 to-blue-500/5', iconTone: 'text-blue-400' },
            { label: 'Pending EDS', value: counts.EDS, icon: 'pending_actions', tone: 'from-amber-500/20 to-amber-500/5', iconTone: 'text-amber-400' },
            { label: 'Finalized', value: counts.FINALIZED, icon: 'check_circle', tone: 'from-emerald-500/20 to-emerald-500/5', iconTone: 'text-emerald-400' },
          ].map((card) => (
            <div key={card.label} className={`rounded-3xl border border-white/10 bg-gradient-to-br ${card.tone} p-5 shadow-2xl shadow-black/20 backdrop-blur-sm`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{card.label}</p>
                  <h3 className="mt-2 text-3xl font-black text-white">{card.value}</h3>
                </div>
                <span className={`material-symbols-outlined text-3xl ${card.iconTone}`}>{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <h2 className="text-xl font-bold text-white">My Applications</h2>
              <p className="text-sm text-white/40">Live data loaded from the PP backend endpoints.</p>
            </div>
            <Link className="text-sm font-bold text-[#22c55e] hover:text-emerald-300" to={ROUTES.PP_APPLICATIONS}>
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-y border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Application ID</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Project Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Category</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Sector</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-white/45" colSpan="6">
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td className="px-6 py-8 text-sm text-white/45" colSpan="6">
                      No applications yet. Create your first draft to start the workflow.
                    </td>
                  </tr>
                ) : (
                  latestApplications.map((application) => (
                    <tr className="hover:bg-white/[0.03]" key={application.id}>
                      <td className="px-6 py-5 text-sm font-bold text-[#22c55e]">{application.id.slice(0, 8)}</td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-white">{application.project_name}</p>
                        <p className="text-[11px] uppercase tracking-wide text-white/30">
                          {application.state || 'State pending'}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/55">{application.category}</td>
                      <td className="px-6 py-5 text-sm text-white/55">
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
                      <td className="px-6 py-5 text-sm text-white/45">{formatDate(application.updated_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22c55e]/65">Quick Summary</p>
                <h2 className="text-xl font-bold text-white">Portfolio Health</h2>
              </div>
              <span className="material-symbols-outlined text-[#22c55e]">monitoring</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Submitted', value: counts.SUBMITTED || 0, color: 'bg-blue-500' },
                { label: 'Under Scrutiny', value: counts.UNDER_SCRUTINY || 0, color: 'bg-amber-500' },
                { label: 'Drafts', value: counts.DRAFT || 0, color: 'bg-slate-500' },
                { label: 'Finalized', value: counts.FINALIZED || 0, color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/8 bg-black/10 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-white/80">{item.label}</p>
                    <span className="text-lg font-black text-white">{item.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${counts.total ? Math.max(8, Math.round((item.value / counts.total) * 100)) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PPPortalDashboard;
