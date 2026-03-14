import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import PariveshBrand from '../components/PariveshBrand';
import { ROUTES } from '../constants/routes';
import momService from '../services/momService';
import { getApiErrorMessage } from '../services/api';

const initialDraft = {
  background: '',
  deliberations: '',
  recommendation: '',
  followUps: '',
};

const serializeDraftToMoMContent = (draft) => {
  return [
    '### Background',
    draft.background || '',
    '',
    '### Deliberations',
    draft.deliberations || '',
    '',
    '### Recommendation',
    draft.recommendation || '',
    '',
    '### FollowUps',
    draft.followUps || '',
  ].join('\n');
};

const parseMoMContentToDraft = (content) => {
  const text = String(content || '').trim();
  if (!text) {
    return { ...initialDraft };
  }

  const getSection = (heading, nextHeading) => {
    const pattern = nextHeading
      ? new RegExp(`### ${heading}\\n([\\s\\S]*?)\\n### ${nextHeading}`)
      : new RegExp(`### ${heading}\\n([\\s\\S]*)$`);
    const match = text.match(pattern);
    return match ? match[1].trim() : '';
  };

  const structured = {
    background: getSection('Background', 'Deliberations'),
    deliberations: getSection('Deliberations', 'Recommendation'),
    recommendation: getSection('Recommendation', 'FollowUps'),
    followUps: getSection('FollowUps', null),
  };

  const hasStructuredData = Object.values(structured).some((value) => value);
  if (hasStructuredData) {
    return structured;
  }

  return {
    ...initialDraft,
    background: text,
  };
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

const getDraftStorageKey = (appId) => `parivesh-mom-editor-draft-${appId}`;

const formatStatus = (status) => String(status || '').replaceAll('_', ' ');

const escapeHtml = (value) =>
  String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatMultiline = (value) => {
  const safeValue = escapeHtml(value).trim();
  if (!safeValue) {
    return '<span class="empty">Not provided.</span>';
  }
  return safeValue.replaceAll('\n', '<br />');
};

const MoMPortalGistMinutesEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { logout } = useAuth();

  const [applications, setApplications] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [gistContent, setGistContent] = useState('');
  const [draft, setDraft] = useState(initialDraft);
  const [momStatus, setMomStatus] = useState('DRAFT');
  const [restoredAt, setRestoredAt] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [lastPersistedDraft, setLastPersistedDraft] = useState(initialDraft);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true);
  const [isGeneratingGist, setIsGeneratingGist] = useState(false);
  const [isSavingToServer, setIsSavingToServer] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const selectedApplication = useMemo(
    () => applications.find((item) => String(item.id) === String(selectedAppId)) || null,
    [applications, selectedAppId]
  );

  const isSelectedCaseFinalized = useMemo(
    () => selectedApplication?.status === 'FINALIZED' || momStatus === 'FINALIZED',
    [momStatus, selectedApplication]
  );

  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(lastPersistedDraft),
    [draft, lastPersistedDraft]
  );

  const loadWorkspace = useCallback(async () => {
    try {
      setIsWorkspaceLoading(true);
      const [appsResult, meetingsResult] = await Promise.allSettled([
        momService.listApplications(),
        momService.listMeetings(),
      ]);

      if (appsResult.status === 'rejected') {
        throw appsResult.reason;
      }

      const apps = appsResult.value || [];
      const meetingList = meetingsResult.status === 'fulfilled' ? meetingsResult.value || [] : [];

      if (meetingsResult.status === 'rejected') {
        toast.error('Meetings could not be loaded right now. You can still draft MoM for referred cases.');
      }

      setApplications(apps);
      setMeetings(meetingList);

      const referredApplicationId = String(location.state?.referredApplicationId || '');
      const referredApp = apps.find((item) => String(item.id) === referredApplicationId);
      const firstActiveApp = apps.find((item) => item.status !== 'FINALIZED');

      if (referredApp) {
        setSelectedAppId(String(referredApp.id));
      } else if (firstActiveApp) {
        setSelectedAppId(String(firstActiveApp.id));
      } else if (apps.length > 0) {
        setSelectedAppId(String(apps[0].id));
      } else {
        setSelectedAppId('');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load MoM workspace.'));
    } finally {
      setIsWorkspaceLoading(false);
    }
  }, [location.state, toast]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const loadEditorData = useCallback(async (appId) => {
    if (!appId) {
      setGistContent('');
      setDraft(initialDraft);
      setLastPersistedDraft(initialDraft);
      setRestoredAt('');
      setLastSavedAt('');
      setMomStatus('DRAFT');
      return;
    }

    try {
      let nextDraft = { ...initialDraft };
      let serverTimestamp = '';

      try {
        const gist = await momService.getGistForApplication(appId);
        setGistContent(gist?.content || '');
        if (gist?.content) {
          nextDraft.background = gist.content;
        }
      } catch {
        setGistContent('');
      }

      try {
        const mom = await momService.getMoM(appId);
        if (mom?.content) {
          nextDraft = parseMoMContentToDraft(mom.content);
          serverTimestamp = mom.finalized_at || mom.created_at || '';
          setMomStatus(mom.status || 'DRAFT');
        } else {
          setMomStatus('DRAFT');
        }
      } catch {
        setMomStatus('DRAFT');
      }

      const localDraftRaw = window.localStorage.getItem(getDraftStorageKey(appId));
      if (localDraftRaw) {
        try {
          const parsed = JSON.parse(localDraftRaw);
          if (parsed?.draft) {
            nextDraft = { ...nextDraft, ...parsed.draft };
            setRestoredAt(parsed.savedAt || '');
            setLastSavedAt(parsed.savedAt || '');
          }
        } catch {
          window.localStorage.removeItem(getDraftStorageKey(appId));
          setRestoredAt('');
          setLastSavedAt(serverTimestamp);
        }
      } else {
        setRestoredAt('');
        setLastSavedAt(serverTimestamp);
      }

      setDraft(nextDraft);
      setLastPersistedDraft(nextDraft);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load selected application workspace.'));
    }
  }, [toast]);

  useEffect(() => {
    loadEditorData(selectedAppId);
  }, [selectedAppId, loadEditorData]);

  useEffect(() => {
    if (!selectedAppId) return;

    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      window.localStorage.setItem(
        getDraftStorageKey(selectedAppId),
        JSON.stringify({ draft, savedAt })
      );
      setLastPersistedDraft(draft);
      setLastSavedAt(savedAt);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [draft, selectedAppId]);

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
      !window.confirm('You have unsaved MoM edits. Leave this page without saving them?')
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
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleSelectApplication = (event) => {
    const nextAppId = event.target.value;
    if (
      hasUnsavedChanges &&
      !window.confirm('You have unsaved MoM edits. Switch application anyway?')
    ) {
      return;
    }
    setSelectedAppId(nextAppId);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setDraft((current) => ({ ...current, [name]: value }));
  };

  const handleManualSave = () => {
    if (!selectedAppId) return;
    if (isSelectedCaseFinalized) {
      toast.info('This MoM is already finalized and locked.');
      return;
    }
    const savedAt = new Date().toISOString();
    window.localStorage.setItem(
      getDraftStorageKey(selectedAppId),
      JSON.stringify({ draft, savedAt })
    );
    setLastPersistedDraft(draft);
    setLastSavedAt(savedAt);
    toast.success('MoM draft saved locally.');
  };

  const handleGenerateGist = async () => {
    if (!selectedAppId) {
      toast.error('Select an application first.');
      return;
    }
    if (isSelectedCaseFinalized) {
      toast.info('This MoM is already finalized and locked.');
      return;
    }

    try {
      setIsGeneratingGist(true);
      const gist = await momService.generateGist(selectedAppId);
      setGistContent(gist.content || '');
      setDraft((current) => ({
        ...current,
        background: gist.content || current.background,
      }));
      setApplications((prev) =>
        prev.map((item) =>
          String(item.id) === String(selectedAppId)
            ? { ...item, status: 'MOM_GENERATED' }
            : item
        )
      );
      toast.success('Gist auto-generated successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to auto-generate gist.'));
    } finally {
      setIsGeneratingGist(false);
    }
  };

  const handleSaveToServer = async ({ silent = false } = {}) => {
    if (!selectedAppId) {
      if (!silent) toast.error('Select an application first.');
      return { ok: false, message: 'Select an application first.' };
    }

    if (isSelectedCaseFinalized) {
      const message = 'This MoM is already finalized and locked.';
      if (!silent) {
        toast.info(message);
      }
      return { ok: false, message };
    }

    try {
      setIsSavingToServer(true);
      const payload = serializeDraftToMoMContent(draft);
      const mom = await momService.createOrUpdateMoM(selectedAppId, payload);
      setMomStatus(mom.status || 'DRAFT');
      setLastSavedAt(new Date().toISOString());
      if (!silent) {
        toast.success('MoM draft saved to server.');
      }
      return { ok: true, message: '' };
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to save MoM draft to server.');
      if (!silent) {
        toast.error(message);
      }
      return { ok: false, message };
    } finally {
      setIsSavingToServer(false);
    }
  };

  const handleFinalize = async () => {
    if (!selectedAppId) {
      toast.error('Select an application first.');
      return;
    }

    if (isSelectedCaseFinalized) {
      toast.info('This MoM is already finalized and locked.');
      return;
    }

    const saveResult = await handleSaveToServer({ silent: true });
    if (!saveResult.ok) {
      toast.error(saveResult.message || 'Save to server failed. Fix errors before finalizing.');
      return;
    }

    try {
      setIsFinalizing(true);
      const mom = await momService.finalizeMoM(selectedAppId);
      setMomStatus(mom.status || 'FINALIZED');
      setApplications((prev) =>
        prev.map((item) =>
          String(item.id) === String(selectedAppId)
            ? { ...item, status: 'FINALIZED' }
            : item
        )
      );
      toast.success('MoM finalized and locked.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to finalize MoM.'));
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleExportPdf = () => {
    if (!selectedAppId || !selectedApplication) {
      toast.error('Select an application first.');
      return;
    }

    const exportWindow = window.open('', '_blank', 'noopener,noreferrer,width=1024,height=768');
    if (!exportWindow) {
      toast.error('Popup blocked. Allow popups to export the MoM document.');
      return;
    }

    const documentTitle = `${selectedApplication.project_name || 'MoM'} - PARIVESH 3.0`;
    const markup = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${escapeHtml(documentTitle)}</title>
          <style>
            :root {
              color-scheme: light;
              --ink: #0f172a;
              --muted: #475569;
              --line: #cbd5e1;
              --surface: #f8fafc;
              --brand: #0f766e;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 32px;
              color: var(--ink);
              font-family: Georgia, "Times New Roman", serif;
              line-height: 1.6;
              background: white;
            }
            .page {
              max-width: 900px;
              margin: 0 auto;
            }
            .eyebrow {
              margin: 0;
              color: var(--brand);
              font: 700 12px/1.4 Arial, sans-serif;
              letter-spacing: 0.24em;
              text-transform: uppercase;
            }
            h1 {
              margin: 8px 0 12px;
              font-size: 34px;
              line-height: 1.15;
            }
            .meta {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
              margin: 24px 0 32px;
              padding: 16px;
              border: 1px solid var(--line);
              background: var(--surface);
              font-family: Arial, sans-serif;
              font-size: 13px;
            }
            .meta strong {
              display: block;
              color: var(--muted);
              margin-bottom: 4px;
              font-size: 11px;
              letter-spacing: 0.08em;
              text-transform: uppercase;
            }
            section {
              margin-top: 28px;
              page-break-inside: avoid;
            }
            h2 {
              margin: 0 0 10px;
              padding-bottom: 8px;
              border-bottom: 1px solid var(--line);
              font-size: 20px;
            }
            .content {
              white-space: normal;
              font-size: 15px;
            }
            .empty {
              color: #64748b;
              font-style: italic;
            }
            .gist {
              padding: 14px 16px;
              border: 1px solid var(--line);
              background: var(--surface);
              font-family: "Courier New", monospace;
              font-size: 13px;
              white-space: pre-wrap;
            }
            .actions {
              margin-top: 32px;
              display: flex;
              justify-content: flex-end;
              font-family: Arial, sans-serif;
            }
            .note {
              color: var(--muted);
              font-size: 12px;
            }
            @media print {
              body { padding: 0; }
              .actions { display: none; }
            }
          </style>
        </head>
        <body>
          <main class="page">
            <p class="eyebrow">PARIVESH 3.0</p>
            <h1>Minutes of Meeting</h1>
            <p class="note">Use the print dialog destination "Save as PDF" to export this document.</p>
            <div class="meta">
              <div><strong>Project</strong>${escapeHtml(selectedApplication.project_name || 'N/A')}</div>
              <div><strong>Status</strong>${escapeHtml(formatStatus(selectedApplication.status || momStatus))}</div>
              <div><strong>Application ID</strong>${escapeHtml(String(selectedApplication.id || 'N/A'))}</div>
              <div><strong>Location</strong>${escapeHtml(`${selectedApplication.district || 'N/A'}, ${selectedApplication.state || 'N/A'}`)}</div>
              <div><strong>Category</strong>${escapeHtml(selectedApplication.category || 'N/A')}</div>
              <div><strong>Generated</strong>${escapeHtml(formatTimestamp(new Date().toISOString()) || 'N/A')}</div>
            </div>

            <section>
              <h2>Generated Gist</h2>
              <div class="gist">${escapeHtml(gistContent || 'No gist generated yet for this application.')}</div>
            </section>

            <section>
              <h2>1. Background of the Proposal</h2>
              <div class="content">${formatMultiline(draft.background)}</div>
            </section>

            <section>
              <h2>2. Committee Observations and Deliberations</h2>
              <div class="content">${formatMultiline(draft.deliberations)}</div>
            </section>

            <section>
              <h2>3. Final Recommendation</h2>
              <div class="content">${formatMultiline(draft.recommendation)}</div>
            </section>

            <section>
              <h2>4. Follow-up Actions</h2>
              <div class="content">${formatMultiline(draft.followUps)}</div>
            </section>

            <div class="actions">
              <button onclick="window.print()">Print / Save as PDF</button>
            </div>
          </main>
        </body>
      </html>
    `;

    exportWindow.document.open();
    exportWindow.document.write(markup);
    exportWindow.document.close();
    exportWindow.focus();
    toast.success('Export document opened. Choose Save as PDF in the print dialog.');
  };

  const completionScore = Math.round(
    ([
      draft.background,
      draft.deliberations,
      draft.recommendation,
      draft.followUps,
    ].filter((value) => value.trim()).length /
      4) *
      100
  );

  if (isWorkspaceLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Loading MoM workspace...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-primary/10 bg-white px-6 py-4 shadow-sm md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-4 text-primary" onClick={() => handleGuardedNavigation(ROUTES.COMMITTEE_SCRUTINY)} type="button">
              <PariveshBrand subtitle="Meeting Workspace" theme="light" title="PARIVESH 3.0 MoM Editor" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
              {lastSavedAt ? `Autosaved ${formatTimestamp(lastSavedAt)}` : 'Autosave active'}
            </div>
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-70" disabled={!selectedAppId || isSelectedCaseFinalized} onClick={handleManualSave} type="button">
              Save Local
            </button>
            <button
              className="rounded-lg border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/5 disabled:opacity-70"
              disabled={isSavingToServer || !selectedAppId || isSelectedCaseFinalized}
              onClick={() => handleSaveToServer()}
              type="button"
            >
              {isSavingToServer ? 'Saving...' : 'Save to Server'}
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
          </section>
        ) : null}

        <section className="rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/[0.08] via-white to-sky-50 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">MoM Dashboard</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">Convert gist to committee-ready minutes</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Pick a referred case, auto-generate its gist if missing, draft the minutes, then finalize and lock for record publication.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <MetricCard icon="workspaces" label="Cases" value={String(applications.length)} />
              <MetricCard icon="groups" label="Meetings" value={String(meetings.length)} />
              <MetricCard icon="task_alt" label="Draft coverage" value={`${completionScore}%`} />
              <MetricCard icon="schedule" label="MoM status" value={momStatus} />
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <aside className="space-y-6">
            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Application Queue</p>
              <div className="mt-4 space-y-3">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-primary focus:bg-white focus:outline-none"
                  onChange={handleSelectApplication}
                  value={selectedAppId}
                >
                  <option value="">Select application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={String(app.id)}>
                      {app.project_name} ({formatStatus(app.status)})
                    </option>
                  ))}
                </select>
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-70"
                  disabled={!selectedAppId || isGeneratingGist || isSelectedCaseFinalized}
                  onClick={handleGenerateGist}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">auto_awesome</span>
                  {isGeneratingGist ? 'Generating gist...' : 'Auto Generate Gist'}
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Application Summary</p>
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <SummaryRow label="Project ID" value={selectedApplication ? String(selectedApplication.id).slice(0, 12) : 'Not selected'} />
                <SummaryRow label="Project" value={selectedApplication?.project_name || 'Not selected'} />
                <SummaryRow label="Status" value={selectedApplication ? formatStatus(selectedApplication.status) : 'Not selected'} />
                <SummaryRow label="Category" value={selectedApplication?.category || 'N/A'} />
                <SummaryRow label="Location" value={selectedApplication ? `${selectedApplication.district || 'N/A'}, ${selectedApplication.state || 'N/A'}` : 'N/A'} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Meeting Space</p>
              <div className="mt-4 space-y-3">
                {meetings.length === 0 ? (
                  <p className="text-sm text-slate-500">No meetings available.</p>
                ) : (
                  meetings.slice(0, 5).map((meeting) => (
                    <div key={meeting.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-bold text-slate-800">{meeting.committee_name || 'Committee Meeting'}</p>
                      <p className="text-xs text-slate-500">Date: {formatTimestamp(meeting.meeting_date)}</p>
                      <p className="text-xs text-slate-500">Type: {meeting.meeting_type || 'EAC'}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">Generated Gist</p>
                <span className="text-xs font-semibold text-slate-500">Auto-filled from selected application</span>
              </div>
              <pre className="max-h-44 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-700">
                {gistContent || 'No gist generated yet for this application.'}
              </pre>
            </div>

            <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-sm md:p-8">
              {isSelectedCaseFinalized ? (
                <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                  This MoM is already finalized and locked for editing.
                </div>
              ) : null}
              <div className="space-y-8">
                <EditorField disabled={isSelectedCaseFinalized} helper="Summarize why the proposal is before the committee." label="1. Background of the Proposal" name="background" onChange={handleChange} rows={6} value={draft.background} />
                <EditorField disabled={isSelectedCaseFinalized} helper="Capture factual observations and compliance discussions." label="2. Committee Observations and Deliberations" name="deliberations" onChange={handleChange} rows={8} value={draft.deliberations} />
                <EditorField disabled={isSelectedCaseFinalized} helper="State whether the case is recommended, deferred, or rejected." label="3. Final Recommendation" name="recommendation" onChange={handleChange} rows={5} value={draft.recommendation} />
                <EditorField disabled={isSelectedCaseFinalized} helper="List actionable follow-up items." label="4. Follow-up Actions" name="followUps" onChange={handleChange} rows={5} value={draft.followUps} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-primary/10 bg-white/90 px-6 py-4 backdrop-blur md:px-10">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Selected Case</p>
              <p className="font-semibold text-slate-700">{selectedApplication?.project_name || 'No case selected'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Current Status</p>
              <p className="font-semibold text-slate-700">{selectedApplication ? formatStatus(selectedApplication.status) : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-70"
              disabled={!selectedAppId}
              onClick={handleExportPdf}
              type="button"
            >
              Export PDF
            </button>
            <button
              className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-70"
              disabled={!selectedAppId || isFinalizing || isSelectedCaseFinalized}
              onClick={handleFinalize}
              type="button"
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize and Lock MoM'}
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

const EditorField = ({ disabled = false, helper, label, name, onChange, rows, value }) => (
  <section>
    <div className="mb-3">
      <h2 className="text-lg font-bold text-slate-900">{label}</h2>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
    <textarea className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-800 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500" disabled={disabled} name={name} onChange={onChange} rows={rows} value={value} />
  </section>
);

export default MoMPortalGistMinutesEditor;
