import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

const ApplicationDetailPage = () => {
  const { appId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [app, setApp] = useState(null);
  const [sectors, setSectors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      try {
        const [application, sectorList] = await Promise.all([
          applicationService.getApplicationById(appId),
          metadataService.getSectors(),
        ]);
        if (!isActive) return;
        setApp(application);
        setEditData({
          project_name: application.project_name || '',
          project_description: application.project_description || '',
          state: application.state || '',
          district: application.district || '',
          taluk: application.taluk || '',
          village: application.village || '',
          pincode: application.pincode || '',
          project_area_ha: application.project_area_ha || '',
          capacity: application.capacity || '',
        });
        setSectors(Object.fromEntries(sectorList.map((s) => [s.id, s.name])));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load application.'));
        navigate('/pp/applications', { replace: true });
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => { isActive = false; };
  }, [appId, navigate, toast]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const updated = await applicationService.updateApplication(appId, {
        ...editData,
        project_area_ha: editData.project_area_ha ? Number(editData.project_area_ha) : null,
      });
      setApp(updated);
      setIsEditing(false);
      toast.success('Application updated.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save changes.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
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

  if (!app) return null;

  const cfg = statusConfig[app.status] || statusConfig.DRAFT;
  const isDraft = app.status === 'DRAFT';
  const currentStepIndex = timelineSteps.indexOf(app.status);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      {/* Header */}
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
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 md:px-10">
        {/* Back + Title */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Link className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-primary" to="/pp/applications">
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Back to registry
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{app.project_name}</h1>
            <p className="font-mono text-sm text-slate-400">ID: {app.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${cfg.color}`}>
              <span className="material-symbols-outlined text-lg">{cfg.icon}</span>
              {cfg.label}
            </span>
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Workflow Progress</h3>
          <div className="flex items-center gap-0">
            {timelineSteps.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const stepCfg = statusConfig[step];
              return (
                <div key={step} className="flex flex-1 items-center">
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
                      {isCompleted ? (
                        <span className="material-symbols-outlined text-sm">check</span>
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider ${isCurrent ? 'text-primary' : 'text-slate-400'}`}>
                      {stepCfg.label}
                    </span>
                  </div>
                  {i < timelineSteps.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 rounded-full ${isCompleted ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Details Card */}
        <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Application Details</h3>
            {isDraft && !isEditing && (
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/5"
                onClick={() => setIsEditing(true)}
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Edit
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {isEditing ? (
              <>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Name</label>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_name" onChange={handleEditChange} value={editData.project_name} />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                  <textarea className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_description" onChange={handleEditChange} rows="3" value={editData.project_description} />
                </div>
                {['state', 'district', 'taluk', 'village', 'pincode'].map((field) => (
                  <div key={field}>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{field}</label>
                    <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name={field} onChange={handleEditChange} value={editData[field]} />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Project Area (ha)</label>
                  <input className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm" name="project_area_ha" onChange={handleEditChange} type="number" step="0.01" value={editData.project_area_ha} />
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
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</p>
                  <p className="mt-1 text-sm text-slate-700">{app.project_description || '—'}</p>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
              <button
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-primary/20 hover:brightness-110 disabled:opacity-70"
                disabled={isSubmitting}
                onClick={handleSave}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Submit Section */}
        {isDraft && !isEditing && (
          <div className="rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
            <span className="material-symbols-outlined mb-3 text-4xl text-primary">send</span>
            <h3 className="text-lg font-bold text-slate-900">Ready to submit?</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Once submitted, your application will be reviewed by the Scrutiny team. You won't be able to edit it unless they request additional information (EDS).
            </p>
            <button
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-light px-8 py-3 font-bold text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Submitted info */}
        {!isDraft && (
          <div className="rounded-xl border border-primary/10 bg-white p-6 shadow-glass">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-primary">info</span>
              <div>
                <p className="font-semibold text-slate-900">Application {cfg.label}</p>
                <p className="text-sm text-slate-500">
                  {app.status === 'SUBMITTED' && 'Your application is awaiting review by the Scrutiny team.'}
                  {app.status === 'UNDER_SCRUTINY' && 'A scrutiny officer is currently reviewing your application.'}
                  {app.status === 'EDS' && 'Additional information has been requested. Please respond to the EDS query.'}
                  {app.status === 'REFERRED' && 'Your application has been referred to the Expert Appraisal Committee.'}
                  {app.status === 'MOM_GENERATED' && 'Minutes of the meeting have been generated for your application.'}
                  {app.status === 'FINALIZED' && 'Your application has been finalized. Check your clearance status.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-slate-700">{value || '—'}</p>
  </div>
);

export default ApplicationDetailPage;
