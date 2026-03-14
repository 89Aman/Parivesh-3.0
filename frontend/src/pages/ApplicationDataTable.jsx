import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import PariveshBrand from '../components/PariveshBrand';
import applicationService from '../services/applicationService';
import adminService from '../services/adminService';
import { getApiErrorMessage } from '../services/api';
import metadataService from '../services/metadataService';
import { ROUTES } from '../constants/routes';

const statusBadgeStyles = {
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

const ApplicationDataTable = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [applications, setApplications] = useState([]);
  const [sectors, setSectors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = useMemo(() => user?.roles?.some(r => r.name === 'ADMIN'), [user]);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const fetchApps = isAdmin ? adminService.getApplications : applicationService.getApplications;
        const [apps, sectorList] = await Promise.all([
          fetchApps(),
          metadataService.getSectors(),
        ]);

        if (!isActive) return;

        setApplications(apps);
        setSectors(Object.fromEntries(sectorList.map((sector) => [sector.id, sector.name])));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load application registry.'));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadData();
    return () => { isActive = false; };
  }, [navigate, toast, isAdmin]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    let result = applications;

    if (statusFilter !== 'ALL') {
      result = result.filter((app) => app.status === statusFilter);
    }

    if (query) {
      result = result.filter((app) => {
        const sectorName = sectors[app.sector_id] || '';
        return (
          app.id.toLowerCase().includes(query) ||
          app.project_name.toLowerCase().includes(query) ||
          app.status.toLowerCase().includes(query) ||
          sectorName.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [applications, searchTerm, statusFilter, sectors]);

  const statusCounts = useMemo(() => {
    const counts = { ALL: applications.length, DRAFT: 0, SUBMITTED: 0, EDS: 0 };
    applications.forEach((app) => {
      if (counts[app.status] !== undefined) counts[app.status]++;
    });
    return counts;
  }, [applications]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4 md:px-10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-4 text-primary" to={ROUTES.PP_DASHBOARD}>
              <PariveshBrand theme="light" />
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to={ROUTES.PP_DASHBOARD}>
                Dashboard
              </Link>
              <Link className="border-b-2 border-primary py-1 text-sm font-semibold text-primary" to={ROUTES.PP_APPLICATIONS}>
                Applications
              </Link>
            </nav>
          </div>

          <div className="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              search
            </span>
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search project, status, or ID..."
              value={searchTerm}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-8 md:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {isAdmin ? 'Global Application Registry' : 'Application Registry'}
            </h1>
            <p className="text-base text-slate-500">
              {isAdmin
                ? 'Viewing all system applications across all proponents.'
                : 'Click any row to view details and manage your application.'}
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110"
            to={ROUTES.PP_NEW_APPLICATION}
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            New Application
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'ALL', label: 'All Applications' },
            { key: 'DRAFT', label: 'Drafts' },
            { key: 'SUBMITTED', label: 'Submitted' },
            { key: 'EDS', label: 'Action Required' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                statusFilter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {tab.label} ({statusCounts[tab.key] || 0})
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border-t-[3px] border-primary bg-white shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Application ID</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Project Name</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Sector</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Created</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan="7">
                      <div className="flex items-center gap-3">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        Loading application registry...
                      </div>
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan="7">
                      No applications matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr
                      className="cursor-pointer transition-colors hover:bg-primary/5"
                      key={application.id}
                      onClick={() => navigate(ROUTES.PP_APPLICATION_DETAIL.replace(':appId', application.id))}
                    >
                      <td className="p-4 font-mono text-sm font-semibold text-primary">{application.id.slice(0, 8)}…</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{application.project_name}</p>
                        <p className="text-xs text-slate-500">{application.state || 'Location pending'}</p>
                      </td>
                      <td className="p-4 text-sm text-slate-600">
                        {sectors[application.sector_id] || `Sector #${application.sector_id}`}
                      </td>
                      <td className="p-4 text-sm text-slate-600">{application.category}</td>
                      <td className="p-4 text-sm text-slate-500">{formatDate(application.created_at)}</td>
                      <td className="p-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-tight ${
                            statusBadgeStyles[application.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="material-symbols-outlined text-lg text-slate-400">chevron_right</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-white/70 px-6 py-4 text-xs font-medium text-slate-500">
            Showing {filteredApplications.length} of {applications.length} records
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApplicationDataTable;
