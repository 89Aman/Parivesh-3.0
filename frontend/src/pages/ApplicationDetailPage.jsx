import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import applicationService from '../services/applicationService';
import metadataService from '../services/metadataService';
import { getApiErrorMessage } from '../services/api';

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700', icon: 'edit_note' },
  SUBMITTED: { label: 'Submitted', color: 'bg-primary/10 text-primary', icon: 'check_circle' },
  UNDER_SCRUTINY: { label: 'Under Scrutiny', color: 'bg-amber-100 text-amber-700', icon: 'pending' },
  EDS: { label: 'EDS Required', color: 'bg-red-100 text-red-700', icon: 'warning' },
  REFERRED: { label: 'Referred', color: 'bg-indigo-100 text-indigo-700', icon: 'send' },
  MOM_GENERATED: { label: 'MoM Generated', color: 'bg-violet-100 text-violet-700', icon: 'article' },
  FINALIZED: { label: 'Finalized', color: 'bg-emerald-100 text-emerald-700', icon: 'verified' },
};

const timelineSteps = ['DRAFT', 'SUBMITTED', 'UNDER_SCRUTINY', 'REFERRED', 'MOM_GENERATED', 'FINALIZED'];

const detailFields = [
  'project_name',
  'project_description',
  'state',
  'district',
  'taluk',
  'village',
  'pincode',
  'project_area_ha',
  'capacity',
];

const buildEditState = (application) => ({
  project_name: application?.project_name || '',
  project_description: application?.project_description || '',
  state: application?.state || '',
  district: application?.district || '',
  taluk: application?.taluk || '',
  village: application?.village || '',
  pincode: application?.pincode || '',
  project_area_ha: application?.project_area_ha || '',
  capacity: application?.capacity || '',
});

const getDraftStorageKey = (appId) => `parivesh-application-edit-draft-${appId}`;

const normalizeValue = (value) => String(value ?? '').trim();

const formatDraftTimestamp = (value) => {
  if (!value) return '';

  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '';
  }
};

const ApplicationDetailPage = () => {
  const { appId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const hasHydratedDraft = useRef(false);

  const [app, setApp] = useState(null);
  const [sectors, setSectors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(buildEditState(null));
  const [restoredDraftAt, setRestoredDraftAt] = useState('');
  const [lastAutosavedAt, setLastAutosavedAt] = useState('');

  useEffect(() => {
    if (location.state?.fromCreate) {
      toast.success('Draft created. Continue refining it here before submission.');
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, toast]);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [application, sectorList] = await Promise.all([
          applicationService.getApplicationById(appId),
          metadataService.getSectors(),
        ]);

        if (!isActive) {
          return;
        }

        const baseEditData = buildEditState(application);
        const storageKey = getDraftStorageKey(appId);
        const storedDraft = application.status === 'DRAFT' ? window.sessionStorage.getItem(storageKey) : null;

        setApp(application);
        setSectors(Object.fromEntries(sectorList.map((sector) => [sector.id, sector.name])));

        if (storedDraft) {
          try {
            const parsedDraft = JSON.parse(storedDraft);
            const restored = { ...baseEditData, ...(parsedDraft.editData || {}) };
            const hasRestoredChanges = detailFields.some(
              (field) => normalizeValue(restored[field]) !== normalizeValue(baseEditData[field])
            );

            setEditData(restored);
            setRestoredDraftAt(parsedDraft.savedAt || '');
            setLastAutosavedAt(parsedDraft.savedAt || '');
            setIsEditing(hasRestoredChanges);

            if (!hasRestoredChanges) {
              window.sessionStorage.removeItem(storageKey);
              setRestoredDraftAt('');
              setLastAutosavedAt('');
            }
          } catch {
            window.sessionStorage.removeItem(storageKey);
            setEditData(baseEditData);
            setRestoredDraftAt('');
            setLastAutosavedAt('');
          }
        } else {
          setEditData(baseEditData);
          setRestoredDraftAt('');
          setLastAutosavedAt('');
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load application.'));
        navigate('/pp/applications', { replace: true });
      } finally {
        if (isActive) {
          setIsLoading(false);
          hasHydratedDraft.current = true;
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [appId, navigate, toast]);

  const baseEditData = useMemo(() => buildEditState(app), [app]);

  const hasPendingEdits = useMemo(() => {
    if (!app || app.status !== 'DRAFT') {
      return false;
    }

    return detailFields.some(
      (field) => normalizeValue(editData[field]) !== normalizeValue(baseEditData[field])
    );
  }, [app, baseEditData, editData]);

  useEffect(() => {
    if (!hasHydratedDraft.current || !app || app.status !== 'DRAFT' || !isEditing) {
      return;
    }

    const storageKey = getDraftStorageKey(app.id);

    if (!hasPendingEdits) {
      window.sessionStorage.removeItem(storageKey);
      setLastAutosavedAt('');
      return;
    }

    const savedAt = new Date().toISOString();
    window.sessionStorage.setItem(storageKey, JSON.stringify({ editData, savedAt }));
    setLastAutosavedAt(savedAt);
  }, [app, editData, hasPendingEdits, isEditing]);

  useEffect(() => {
    if (!hasPendingEdits) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasPendingEdits]);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditData((current) => ({ ...current, [name]: value }));
  };

  const handleGuardedNavigation = (target) => {
    if (
      hasPendingEdits &&
      !window.confirm('You have unsaved local edits for this application. Leave without saving them to the server?')
    ) {
      return;
    }

    navigate(target);
  };

  const handleDiscardLocalDraft = () => {
    if (!app) {
      return;
    }

    setEditData(baseEditData);
    setIsEditing(false);
    setRestoredDraftAt('');
    setLastAutosavedAt('');
    window.sessionStorage.removeItem(getDraftStorageKey(app.id));
    toast.info('Local draft changes discarded.');
  };

  const handleCancelEdit = () => {
    if (hasPendingEdits && !window.confirm('Discard your local draft changes?')) {
      return;
    }

    handleDiscardLocalDraft();
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const updated = await applicationService.updateApplication(appId, {
        ...editData,
        project_area_ha: editData.project_area_ha ? Number(editData.project_area_ha) : null,
      });

      setApp(updated);
      setEditData(buildEditState(updated));
      setIsEditing(false);
      setRestoredDraftAt('');
      setLastAutosavedAt('');
      window.sessionStorage.removeItem(getDraftStorageKey(appId));
      toast.success('Application updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save changes.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (hasPendingEdits) {
      toast.error('Save your draft changes before submitting the application.');
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await applicationService.submitApplication(appId);
      setApp(updated);
      toast.success('Application submitted for review!');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit application.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading application...
        </div>
      </div>
    );
  }

  if (!app) {
    return null;
  }

  const cfg = statusConfig[app.status] || statusConfig.DRAFT;
  const isDraft = app.status === 'DRAFT';
  const currentStepIndex = Math.max(timelineSteps.indexOf(app.status), 0);
  const projectHealth = Math.round(
    ([
      app.project_name,
      app.project_description,
      app.state,
      app.district,
      app.village,
      app.category,
      app.capacity,
      app.project_area_ha,
    ].filter(Boolean).length /
      8) *
      100
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white px-6 py-4 md:px-10">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-4 text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined">eco</span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0</h2>
            </button>
            <nav className="hidden items-center gap-6 md:flex">
              <button className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
                Dashboard
              </button>
              <button className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" onClick={() => handleGuardedNavigation('/pp/applications')} type="button">
                Applications
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 md:px-10">
        {isDraft && restoredDraftAt ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold">Local draft restored</p>
              <p className="mt-1 text-amber-800">Edits saved in this browser on {formatDraftTimestamp(restoredDraftAt)} were reopened for you.</p>
            </div>
            <button className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 hover:bg-amber-100" onClick={handleDiscardLocalDraft} type="button">
              Discard local copy
            </button>
          </section>
        ) : null}

        {isDraft ? (
          <section className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/[0.08] via-white to-emerald-50 p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Draft Workspace</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Refine before you submit</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Edit the project metadata, review the readiness score, and only submit once the local draft and server copy are aligned.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary/5" onClick={() => handleGuardedNavigation(`/pp/workflow/${app.id}`)} type="button">
                  <span className="material-symbols-outlined text-lg">timeline</span>
                  Preview Workflow
                </button>
                <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-70" disabled={isSubmitting} onClick={handleSubmit} type="button">
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary" onClick={() => handleGuardedNavigation('/pp/applications')} type="button">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to registry
            </button>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{app.project_name}</h1>
            <p className="font-mono text-sm text-slate-400">ID: {app.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${cfg.color}`}>
              <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
              {cfg.label}
            </span>
            <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:border-primary/20 hover:text-primary" onClick={() => handleGuardedNavigation(`/pp/workflow/${app.id}`)} type="button">
              <span className="material-symbols-outlined text-lg">monitoring</span>
              View Flow
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.75fr]">
          <div className="space-y-8">
            <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Workflow Progress</h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Stage {currentStepIndex + 1} of {timelineSteps.length}
                </span>
              </div>
              <div className="flex items-center gap-0 overflow-x-auto pb-2">
                {timelineSteps.map((step, index) => {
                  const isCompleted = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const stepCfg = statusConfig[step];

                  return (
                    <div key={step} className="flex min-w-[110px] flex-1 items-center">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`flex size-9 items-center justify-center rounded-full text-sm font-bold transition-all ${
                            isCompleted
                              ? 'bg-primary text-white shadow-sm'
                              : isCurrent
                              ? 'bg-primary/10 text-primary ring-2 ring-primary/30'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {isCompleted ? <span className="material-symbols-outlined text-sm">check</span> : index + 1}
                        </div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                          {stepCfg.label}
                        </span>
                      </div>
                      {index < timelineSteps.length - 1 ? <div className={`mx-1 h-0.5 flex-1 rounded-full ${isCompleted ? 'bg-primary' : 'bg-slate-200'}`} /> : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
                  <p className="mt-1 text-sm text-slate-500">Keep the server record and your local draft aligned before final submission.</p>
                </div>
                {isDraft && !isEditing ? (
                  <button className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/5" onClick={() => setIsEditing(true)} type="button">
                    <span className="material-symbols-outlined text-lg">edit</span>
                    Edit
                  </button>
                ) : null}
              </div>

              {isEditing && isDraft ? (
                <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">Local editing mode</p>
                    <p className="mt-1">{lastAutosavedAt ? `Autosaved in this browser on ${formatDraftTimestamp(lastAutosavedAt)}.` : 'Changes will autosave locally while you edit.'}</p>
                  </div>
                  <button className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100" onClick={handleDiscardLocalDraft} type="button">
                    Reset local edits
                  </button>
                </div>
              ) : null}

              <div className="grid gap-6 md:grid-cols-2">
                {isEditing ? (
                  <>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Name</label>
                      <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_name" onChange={handleEditChange} value={editData.project_name} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                      <textarea className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_description" onChange={handleEditChange} rows="4" value={editData.project_description} />
                    </div>
                    {['state', 'district', 'taluk', 'village', 'pincode'].map((field) => (
                      <div key={field}>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{field}</label>
                        <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name={field} onChange={handleEditChange} value={editData[field]} />
                      </div>
                    ))}
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Area (ha)</label>
                      <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_area_ha" onChange={handleEditChange} step="0.01" type="number" value={editData.project_area_ha} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Capacity</label>
                      <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="capacity" onChange={handleEditChange} value={editData.capacity} />
                    </div>
                  </>
                ) : (
                  <>
                    <DetailRow label="Category" value={app.category} />
                    <DetailRow label="Sector" value={sectors[app.sector_id] || `#${app.sector_id}`} />
                    <DetailRow label="State" value={app.state} />
                    <DetailRow label="District" value={app.district} />
                    <DetailRow label="Taluk" value={app.taluk} />
                    <DetailRow label="Village" value={app.village} />
                    <DetailRow label="Pincode" value={app.pincode} />
                    <DetailRow label="Project Area" value={app.project_area_ha ? `${app.project_area_ha} ha` : null} />
                    <DetailRow label="Capacity" value={app.capacity} />
                    <DetailRow label="EDS Cycles" value={app.eds_cycle_count} />
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Description</label>
                      <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                        {app.project_description || 'No project description has been provided yet.'}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {isEditing ? (
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                  <button className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50" onClick={handleCancelEdit} type="button">
                    Cancel
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:brightness-110 disabled:opacity-70" disabled={isSubmitting} onClick={handleSave} type="button">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Readiness</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-900">{projectHealth}%</h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                </div>
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light" style={{ width: `${projectHealth}%` }} />
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Higher readiness means the project description, location metadata, and scale details are filled in and ready for scrutiny.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Next best action</p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-base font-bold text-slate-900">{isDraft ? 'Save local edits, then submit' : 'Track workflow progress'}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isDraft
                    ? 'Keep local edits synced to the server before submission so reviewers see the latest project metadata.'
                    : 'Open the workflow view to see the current stage, timing, and next milestone.'}
                </p>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light" onClick={() => handleGuardedNavigation(`/pp/workflow/${app.id}`)} type="button">
                Open workflow view
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800">{value || 'Not provided yet'}</div>
  </div>
);

export default ApplicationDetailPage;