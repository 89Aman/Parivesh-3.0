import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import applicationService from '../services/applicationService';
import authService from '../services/authService';
import { getApiErrorMessage } from '../services/api';
import metadataService from '../services/metadataService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState([]);
  const [sectors, setSectors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadData = async () => {
      try {
        const [apps, sectorList] = await Promise.all([
          applicationService.getApplications(),
          metadataService.getSectors(),
        ]);

        if (!isActive) {
          return;
        }

        setApplications(apps);
        setSectors(Object.fromEntries(sectorList.map((sector) => [sector.id, sector.name])));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load application registry.'));
        await authService.logout();
        navigate('/login', { replace: true });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isActive = false;
    };
  }, [navigate, toast]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return applications;
    }

    return applications.filter((application) => {
      const sectorName = sectors[application.sector_id] || '';
      return (
        application.id.toLowerCase().includes(query) ||
        application.project_name.toLowerCase().includes(query) ||
        application.status.toLowerCase().includes(query) ||
        sectorName.toLowerCase().includes(query)
      );
    });
  }, [applications, searchTerm, sectors]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4 md:px-10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-4 text-primary" to="/pp/dashboard">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <span className="material-symbols-outlined text-primary">account_balance</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">GovPortal</h2>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to="/pp/dashboard">
                Dashboard
              </Link>
              <Link className="border-b-2 border-primary py-1 text-sm font-semibold text-primary" to="/pp/applications">
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
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Application Registry</h1>
            <p className="text-base text-slate-500">
              Live project proponent records from the backend application service.
            </p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:brightness-110"
            to="/pp/new-application"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            New Application
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <div className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white">
            All Applications ({applications.length})
          </div>
          <div className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
            Drafts ({applications.filter((application) => application.status === 'DRAFT').length})
          </div>
          <div className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
            Submitted ({applications.filter((application) => application.status === 'SUBMITTED').length})
          </div>
          <div className="rounded-full bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700">
            Action Required ({applications.filter((application) => application.status === 'EDS').length})
          </div>
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan="6">
                      Loading application registry...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td className="p-6 text-sm text-slate-500" colSpan="6">
                      No applications matched your search.
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((application) => (
                    <tr className="transition-colors hover:bg-primary/5" key={application.id}>
                      <td className="p-4 font-mono text-sm text-slate-600">{application.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{application.project_name}</p>
                        <p className="text-xs text-slate-500">{application.state || 'State pending'}</p>
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
