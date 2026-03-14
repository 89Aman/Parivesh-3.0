import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import applicationService from '../services/applicationService';
import metadataService from '../services/metadataService';
import { getApiErrorMessage } from '../services/api';

const statusConfig = {
  DRAFT: {
    label: 'Draft',
    icon: 'edit_note',
    summary: 'The application is editable and still with the proponent.',
    eta: 'Submit when the metadata feels complete.',
    accent: 'bg-slate-100 text-slate-700 border-slate-200',
  },
  SUBMITTED: {
    label: 'Submitted',
    icon: 'send',
    summary: 'The application has entered the official review pipeline.',
    eta: 'Queued for scrutiny review.',
    accent: 'bg-primary/10 text-primary border-primary/20',
  },
  UNDER_SCRUTINY: {
    label: 'Under Scrutiny',
    icon: 'policy',
    summary: 'The scrutiny team is reviewing the submission package and attached details.',
    eta: 'Technical review in progress.',
    accent: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  EDS: {
    label: 'EDS Required',
    icon: 'warning',
    summary: 'An additional clarification or supporting input is required from the proponent.',
    eta: 'Respond quickly to move the case back into scrutiny.',
    accent: 'bg-red-100 text-red-700 border-red-200',
  },
  REFERRED: {
    label: 'Referred',
    icon: 'move_down',
    summary: 'The application has been referred onward for committee consideration.',
    eta: 'Committee review stage approaching.',
    accent: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  MOM_GENERATED: {
    label: 'MoM Generated',
    icon: 'article',
    summary: 'The minutes of meeting have been prepared for this application.',
    eta: 'Final closure pending.',
    accent: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  FINALIZED: {
    label: 'Finalized',
    icon: 'verified',
    summary: 'The workflow is complete and the application is finalized.',
    eta: 'Process completed.',
    accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
};

const timelineSteps = ['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'EDS', 'REFERRED', 'MOM_GENERATED', 'FINALIZED'];

const formatDate = (value) => {
  if (!value) return 'Pending';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const ApplicationWorkflowTimeline = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [app, setApp] = useState(null);
  const [sectorMap, setSectorMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!appId) {
      navigate('/pp/applications', { replace: true });
      return;
    }

    let isActive = true;

    const loadData = async () => {
      try {
        const [application, sectors] = await Promise.all([
          applicationService.getApplicationById(appId),
          metadataService.getSectors(),
        ]);

        if (!isActive) {
          return;
        }

        setApp(application);
        setSectorMap(Object.fromEntries(sectors.map((sector) => [sector.id, sector.name])));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load workflow details.'));
        navigate('/pp/applications', { replace: true });
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
  }, [appId, navigate, toast]);

  const currentStepIndex = useMemo(() => {
    if (!app?.status) return 0;
    return Math.max(timelineSteps.indexOf(app.status), 0);
  }, [app]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading workflow...
        </div>
      </div>
    );
  }

  if (!app) {
    return null;
  }

  const currentStatus = statusConfig[app.status] || statusConfig.DRAFT;
  const progressPercent = Math.round(((currentStepIndex + 1) / timelineSteps.length) * 100);
  const nextStep = timelineSteps[currentStepIndex + 1];
  const nextStatus = nextStep ? statusConfig[nextStep] : null;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4 md:px-10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center gap-4 text-primary" to="/pp/dashboard">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0</h2>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to="/pp/dashboard">
                Dashboard
              </Link>
              <Link className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" to="/pp/applications">
                Applications
              </Link>
            </nav>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-primary/20 hover:text-primary"
            to={`/pp/application/${app.id}`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to application
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-10">
        <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-white via-primary/[0.03] to-emerald-50 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Live Workflow Tracking</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">{app.project_name}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{currentStatus.summary}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">ID: {app.id.slice(0, 8)}</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Sector: {sectorMap[app.sector_id] || `#${app.sector_id}`}</span>
                <span className="rounded-full bg-white px-3 py-1 shadow-sm">Updated: {formatDate(app.updated_at)}</span>
              </div>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${currentStatus.accent}`}>
              <span className="material-symbols-outlined text-lg">{currentStatus.icon}</span>
              {currentStatus.label}
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-8">
            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-glass">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Application Journey</h2>
                  <p className="text-sm text-slate-500">A single view of where the case is and what comes next.</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {progressPercent}% complete
                </span>
              </div>

              <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ width: `${progressPercent}%` }} />
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {timelineSteps.map((step, index) => {
                  const stepStatus = statusConfig[step];
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isUpcoming = index > currentStepIndex;

                  return (
                    <div
                      key={step}
                      className={`rounded-2xl border p-4 transition-all ${
                        isCurrent
                          ? 'border-primary/20 bg-primary/[0.04] shadow-sm'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/70'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            isCurrent
                              ? 'bg-primary/10 text-primary'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-white text-slate-400'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">{isCompleted ? 'check' : stepStatus.icon}</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                          {isCurrent ? 'Current' : isCompleted ? 'Done' : 'Upcoming'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">{stepStatus.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {isCurrent ? stepStatus.summary : isUpcoming ? stepStatus.eta : 'Completed in the workflow.'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-glass">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Current Stage</h2>
                  <p className="text-sm text-slate-500">What the workflow status means for this application right now.</p>
                </div>
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${currentStatus.accent}`}>
                  <span className="material-symbols-outlined text-lg">{currentStatus.icon}</span>
                  {currentStatus.label}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Current stage</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{currentStatus.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{currentStatus.summary}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Next milestone</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{nextStatus?.label || 'Workflow complete'}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{nextStatus?.summary || 'No further action pending in the standard flow.'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Last updated</p>
                  <p className="mt-2 text-base font-bold text-slate-900">{formatDate(app.updated_at)}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{currentStatus.eta}</p>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Quick summary</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>Category</span>
                  <span className="font-bold text-slate-900">{app.category}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>Sector</span>
                  <span className="max-w-[10rem] truncate font-bold text-slate-900">{sectorMap[app.sector_id] || `#${app.sector_id}`}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span>State</span>
                  <span className="font-bold text-slate-900">{app.state || 'Pending'}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-glass">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Actions</p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10"
                  to={`/pp/application/${app.id}`}
                >
                  <span className="material-symbols-outlined text-lg">description</span>
                  Open application details
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:border-primary/20 hover:text-primary"
                  to="/pp/applications"
                >
                  <span className="material-symbols-outlined text-lg">grid_view</span>
                  Return to registry
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ApplicationWorkflowTimeline;
