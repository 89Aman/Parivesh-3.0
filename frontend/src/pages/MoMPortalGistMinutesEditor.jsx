import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';

const MOM_DRAFT_STORAGE_KEY = 'parivesh-mom-editor-draft';

const initialDraft = {
  background:
    'The Member Secretary briefed the Committee about the proposal submitted by ABC Infrastructure Corp Ltd. The committee noted that the project was previously deferred for clarification on water consumption and greenbelt development plans.',
  deliberations:
    'The proponent presented the revised Water Balance Chart showing a 20% reduction in fresh water demand through ZLD implementation. The committee appreciated the updated greenbelt proposal and requested additional clarity on night-time rail-siding noise controls.',
  recommendation: '',
  followUps: 'Seek confirmation on Stage II forest clearance timeline before final recommendation is locked.',
};

const formatTimestamp = (value) => {
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

const getInitialMomDraftState = () => {
  try {
    const storedDraft = window.localStorage.getItem(MOM_DRAFT_STORAGE_KEY);
    if (!storedDraft) {
      return {
        draft: initialDraft,
        restoredAt: '',
        lastSavedAt: '',
        lastPersistedDraft: initialDraft,
      };
    }

    const parsedDraft = JSON.parse(storedDraft);
    const restoredDraft = { ...initialDraft, ...(parsedDraft.draft || {}) };
    const savedAt = parsedDraft.savedAt || '';

    return {
      draft: restoredDraft,
      restoredAt: savedAt,
      lastSavedAt: savedAt,
      lastPersistedDraft: restoredDraft,
    };
  } catch {
    window.localStorage.removeItem(MOM_DRAFT_STORAGE_KEY);
    return {
      draft: initialDraft,
      restoredAt: '',
      lastSavedAt: '',
      lastPersistedDraft: initialDraft,
    };
  }
};

const MoMPortalGistMinutesEditor = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();

  const initialState = getInitialMomDraftState();
  const [draft, setDraft] = useState(initialState.draft);
  const [restoredAt, setRestoredAt] = useState(initialState.restoredAt);
  const [lastSavedAt, setLastSavedAt] = useState(initialState.lastSavedAt);
  const [lastPersistedDraft, setLastPersistedDraft] = useState(initialState.lastPersistedDraft);

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(lastPersistedDraft),
    [draft, lastPersistedDraft]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(MOM_DRAFT_STORAGE_KEY, JSON.stringify({ draft, savedAt }));
      setLastPersistedDraft(draft);
      setLastSavedAt(savedAt);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleGuardedNavigation = (targetPath) => {
    if (
      hasUnsavedChanges &&
      !window.confirm('You have unsaved MoM edits. Leave this page without saving them locally?')
    ) {
      return;
    }

    navigate(targetPath);
  };

  const handleLogout = async () => {
    if (
      hasUnsavedChanges &&
      !window.confirm('You have unsaved MoM edits. Logout and leave this page anyway?')
    ) {
      return;
    }

    await logout();
    navigate('/login', { replace: true });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleManualSave = () => {
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(MOM_DRAFT_STORAGE_KEY, JSON.stringify({ draft, savedAt }));
    setLastPersistedDraft(draft);
    setLastSavedAt(savedAt);
    toast.success('MoM draft saved locally.');
  };

  const handleResetToGist = () => {
    if (!window.confirm('Reset the editor back to the original gist draft?')) {
      return;
    }

    setDraft(initialDraft);
    toast.info('Editor reset to the gist baseline.');
  };

  const handleInsertSection = () => {
    setDraft((current) => ({
      ...current,
      followUps: `${current.followUps}${current.followUps ? '\n' : ''}- Add a fresh action item here.`,
    }));
  };

  const handleFinalize = () => {
    toast.success('MoM draft marked ready for final lock.');
  };

  const completionScore = Math.round(
    ([draft.background, draft.deliberations, draft.recommendation, draft.followUps].filter((value) => value.trim()).length / 4) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-4 text-primary" onClick={() => handleGuardedNavigation('/committee/scrutiny')} type="button">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0 MoM Editor</h2>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Meeting workspace</p>
              </div>
            </button>
            <nav className="hidden items-center gap-6 md:flex">
              <button className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" onClick={() => handleGuardedNavigation('/committee/scrutiny')} type="button">
                Scrutiny Queue
              </button>
              <span className="border-b-2 border-primary pb-1 text-sm font-bold text-primary">MoM Editor</span>
            </nav>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              {lastSavedAt ? `Autosaved ${formatTimestamp(lastSavedAt)}` : 'Autosave active'}
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90" onClick={handleManualSave} type="button">
              Save Progress
            </button>
            <button className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition-colors hover:bg-red-100" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1600px] flex-col gap-6 px-6 py-8 md:px-10">
        {restoredAt ? (
          <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-bold">Local MoM draft restored</p>
              <p className="mt-1 text-amber-800">This workspace reopened the last local draft saved on {formatTimestamp(restoredAt)}.</p>
            </div>
            <button
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 hover:bg-amber-100"
              onClick={() => {
                setDraft(initialDraft);
                setRestoredAt('');
                toast.info('Restored state cleared from the editor.');
              }}
              type="button"
            >
              Reset editor
            </button>
          </section>
        ) : null}

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/[0.08] via-white to-sky-50 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Session #402</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Turn the gist into a committee-ready minute sheet</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Keep the case summary visible, draft the background and deliberations in sequence, and lock the recommendation only after the compliance gaps read clearly.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard icon="task_alt" label="Draft coverage" value={`${completionScore}%`} />
              <MetricCard icon="groups" label="Committee" value="G-12" />
              <MetricCard icon="schedule" label="Status" value={hasUnsavedChanges ? 'Saving...' : 'Stable'} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Application Summary</p>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <SummaryRow label="Project ID" value="IA/RJ/INFRA/402" />
                <SummaryRow label="Proponent" value="ABC Infrastructure Corp Ltd" />
                <SummaryRow label="Sector" value="Infrastructure (Category A)" />
                <SummaryRow label="Location" value="Udaipur, Rajasthan" />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Review cues</p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>The project expands a multi-modal logistics park over 450 hectares with green energy integration and rail-siding infrastructure.</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-emerald-500">check_circle</span>
                    <span>EIA report submitted on 12-Oct-2023.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-emerald-500">check_circle</span>
                    <span>Public hearing completed on 05-Nov-2023 with no major objections.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined mt-0.5 text-base text-amber-500">warning</span>
                    <span>Forest Clearance Stage II remains pending.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">Draft rhythm</p>
              <div className="mt-4 space-y-3 text-sm text-slate-200">
                <p>1. Background should explain the deferment history.</p>
                <p>2. Deliberations should capture facts, not conclusions.</p>
                <p>3. Recommendation should be the final decision line.</p>
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20" onClick={handleInsertSection} type="button">
                  Insert follow-up
                </button>
                <button className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200" onClick={handleResetToGist} type="button">
                  Reset to gist
                </button>
              </div>
              <button className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90" onClick={() => toast.success('Draft converted into the MoM working format.')} type="button">
                Convert to MoM Draft
              </button>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm md:p-8">
              <div className="space-y-8">
                <EditorField helper="Summarize the proposal and why it is before the committee again." label="1. Background of the Proposal" name="background" onChange={handleChange} rows={6} value={draft.background} />
                <EditorField helper="Capture factual observations, requested clarifications, and compliance notes." label="2. Committee Observations and Deliberations" name="deliberations" onChange={handleChange} rows={8} value={draft.deliberations} />
                <EditorField helper="State whether the proposal is recommended, deferred, or rejected." label="3. Final Recommendation" name="recommendation" onChange={handleChange} rows={5} value={draft.recommendation} />
                <EditorField helper="List precise follow-up items that must be tracked after the meeting." label="4. Follow-up Actions" name="followUps" onChange={handleChange} rows={5} value={draft.followUps} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-primary/10 bg-white/90 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Editor Mode</p>
              <p className="font-semibold text-slate-700">Structured drafting workspace</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Collaboration</p>
              <p className="font-semibold text-slate-700">3 reviewers expected to comment</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50" onClick={() => toast.info('PDF export is not connected yet in this environment.')} type="button">
              Export PDF
            </button>
            <button className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90" onClick={handleFinalize} type="button">
              Finalize and Lock MoM
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

const MetricCard = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
    <div className="flex items-center gap-2 text-primary">
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
    </div>
    <p className="mt-2 text-lg font-black text-slate-900">{value}</p>
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
    <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</span>
    <span className="max-w-[16rem] text-right font-semibold text-slate-900">{value}</span>
  </div>
);

const EditorField = ({ helper, label, name, onChange, rows, value }) => (
  <section>
    <div className="mb-3">
      <h2 className="text-lg font-bold text-slate-900">{label}</h2>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
    <textarea className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary" name={name} onChange={onChange} rows={rows} value={value} />
  </section>
);

export default MoMPortalGistMinutesEditor;