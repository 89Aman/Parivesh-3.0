import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { Skeleton, SkeletonText } from '../components/Skeleton';
import scrutinyService from '../services/scrutinyService';
import { getApiErrorMessage } from '../services/api';

const statusStyles = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  UNDER_SCRUTINY: 'bg-amber-100 text-amber-700',
  EDS: 'bg-red-100 text-red-700',
  REFERRED: 'bg-indigo-100 text-indigo-700',
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatStatus = (status) => (status ? status.replaceAll('_', ' ') : 'N/A');

const getQueueDays = (createdAt) => {
  if (!createdAt) return 0;
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
};

const buildDraftSnapshot = (draftRemarks, draftAttachment) => ({
  remarks: draftRemarks || '',
  attachedNoteName: draftAttachment || '',
});

const ScrutinyPortalApplicationReview = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { logout, hasRole } = useAuth();
  const fileInputRef = useRef(null);

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [application, setApplication] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [payment, setPayment] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [attachedNoteName, setAttachedNoteName] = useState('');
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [queueError, setQueueError] = useState('');
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState('');
  const [savedDraftMeta, setSavedDraftMeta] = useState(null);
  const [lastDraftSnapshot, setLastDraftSnapshot] = useState(buildDraftSnapshot('', ''));

  const hasUnsavedLocalDraft = useMemo(() => {
    const currentSnapshot = buildDraftSnapshot(remarks, attachedNoteName);
    return (
      currentSnapshot.remarks !== lastDraftSnapshot.remarks ||
      currentSnapshot.attachedNoteName !== lastDraftSnapshot.attachedNoteName
    );
  }, [attachedNoteName, lastDraftSnapshot, remarks]);

  const refreshQueue = async () => {
    const queue = await scrutinyService.getApplicationsForScrutiny();
    setApplications(queue);
    if (!selectedAppId && queue.length > 0) {
      setSelectedAppId(queue[0].id);
    } else if (selectedAppId && !queue.some((item) => item.id === selectedAppId)) {
      setSelectedAppId(queue[0]?.id || null);
    }
    return queue;
  };

  const loadSelectedApplication = useCallback(async (appId) => {
    if (!appId) {
      setApplication(null);
      setDocuments([]);
      setPayment(null);
      setSavedDraftMeta(null);
      return;
    }

    setIsDetailsLoading(true);
    try {
      const [details, docs, paymentDetails] = await Promise.all([
        scrutinyService.getApplicationDetails(appId),
        scrutinyService.getApplicationDocuments(appId),
        scrutinyService.getPaymentDetails(appId).catch((error) => {
          const status = error?.response?.status;
          if (status === 404) {
            return null;
          }
          throw error;
        }),
      ]);

      setApplication(details);
      setDocuments(docs);
      setPayment(paymentDetails);

      const savedDraft = localStorage.getItem(`scrutiny_draft_${appId}`);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          const parsedRemarks = parsed.remarks || '';
          const parsedAttachment = parsed.attachedNoteName || '';
          setRemarks(parsedRemarks);
          setAttachedNoteName(parsedAttachment);
          setLastDraftSnapshot(buildDraftSnapshot(parsedRemarks, parsedAttachment));
          setSavedDraftMeta(parsed.savedAt ? { savedAt: parsed.savedAt } : null);
        } catch {
          setRemarks('');
          setAttachedNoteName('');
          setLastDraftSnapshot(buildDraftSnapshot('', ''));
          setSavedDraftMeta(null);
        }
      } else {
        setRemarks('');
        setAttachedNoteName('');
        setLastDraftSnapshot(buildDraftSnapshot('', ''));
        setSavedDraftMeta(null);
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to load application details.'));
      setApplication(null);
      setDocuments([]);
      setPayment(null);
      setLastDraftSnapshot(buildDraftSnapshot('', ''));
      setSavedDraftMeta(null);
    } finally {
      setIsDetailsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!hasUnsavedLocalDraft) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedLocalDraft]);

  const loadInitialData = useCallback(async () => {
    setIsPageLoading(true);
    setQueueError('');
    try {
      const [queue, meetingList] = await Promise.all([
        scrutinyService.getApplicationsForScrutiny(),
        scrutinyService.listMeetings(),
      ]);
      setApplications(queue);
      setMeetings(meetingList);
      setSelectedAppId(queue[0]?.id || null);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Unable to load scrutiny queue.');
      setQueueError(message);
      toast.error(message);
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let isActive = true;

    const initialize = async () => {
      const stallTimer = setTimeout(() => {
        if (!isActive) return;
        setIsPageLoading(false);
        setQueueError('Unable to load scrutiny queue. Please retry after backend is available.');
      }, 12000);

      try {
        await loadInitialData();
      } finally {
        clearTimeout(stallTimer);
      }
    };

    initialize();

    return () => {
      isActive = false;
    };
  }, [loadInitialData]);

  useEffect(() => {
    loadSelectedApplication(selectedAppId);
  }, [loadSelectedApplication, selectedAppId]);

  const updateApplicationInQueue = (updatedApp) => {
    setApplications((prev) =>
      prev.map((item) => (item.id === updatedApp.id ? { ...item, ...updatedApp } : item))
    );
  };

  const ensureUnderScrutiny = async () => {
    if (!application) {
      throw new Error('No application selected.');
    }
    if (application.status === 'SUBMITTED') {
      const accepted = await scrutinyService.acceptApplication(application.id);
      setApplication(accepted);
      updateApplicationInQueue(accepted);
      return accepted;
    }
    return application;
  };

  const handleNotifications = () => {
    const underScrutiny = applications.filter((item) => item.status === 'UNDER_SCRUTINY').length;
    const submitted = applications.filter((item) => item.status === 'SUBMITTED').length;
    const eds = applications.filter((item) => item.status === 'EDS').length;
    toast.info(
      `Queue summary: ${submitted} submitted, ${underScrutiny} under scrutiny, ${eds} in EDS.`
    );
  };

  const handleHelp = () => {
    window.open('https://parivesh.nic.in/', '_blank', 'noopener,noreferrer');
  };

  const handleOpenMeetings = () => {
    if (hasRole('MOM')) {
      navigate('/committee/mom-editor');
      return;
    }
    toast.info('MoM meeting workspace is available for MOM role.');
  };

  const handleLogout = async () => {
    if (
      hasUnsavedLocalDraft &&
      !window.confirm('You have unsaved scrutiny remarks. Leave without saving this local draft?')
    ) {
      return;
    }

    await logout();
    navigate('/login', { replace: true });
  };

  const handleGuardedNavigation = (targetPath) => {
    if (
      hasUnsavedLocalDraft &&
      !window.confirm('You have unsaved scrutiny remarks. Leave this page without saving the draft?')
    ) {
      return;
    }

    navigate(targetPath);
  };

  const handleSelectApplication = (nextAppId) => {
    if (
      hasUnsavedLocalDraft &&
      !window.confirm('You have unsaved remarks for this file. Switch to another application anyway?')
    ) {
      return;
    }

    setSelectedAppId(nextAppId);
  };

  const handleDocumentAction = async (doc) => {
    if (!doc?.file_path) {
      toast.error('Document path is missing.');
      return;
    }

    if (doc.file_path.startsWith('http://') || doc.file_path.startsWith('https://')) {
      window.open(doc.file_path, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      await navigator.clipboard.writeText(doc.file_path);
      toast.info(`Document path copied: ${doc.file_path}`);
    } catch {
      toast.info(`Document path: ${doc.file_path}`);
    }
  };

  const handleOpenMap = () => {
    if (!application) return;
    const locationQuery =
      application.latitude && application.longitude
        ? `${application.latitude},${application.longitude}`
        : `${application.village || ''} ${application.district || ''} ${application.state || ''}`.trim();

    if (!locationQuery) {
      toast.error('Location details are not available.');
      return;
    }
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleVerifyPayment = async () => {
    if (!application) return;
    if (!payment) {
      toast.error('No payment found yet. Open QR and simulate payment first.');
      return;
    }
    if (payment?.status === 'VERIFIED') {
      toast.info('Payment is already verified.');
      return;
    }

    setActiveAction('verify');
    try {
      const verified = await scrutinyService.verifyPayment(application.id);
      setPayment(verified);
      toast.success('Payment verified successfully.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to verify payment.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleOpenQrAndSimulatePayment = async () => {
    if (!application) return;

    setActiveAction('simulate');
    try {
      const amount = Number(application?.project_area_ha || 0) > 0
        ? Number((application.project_area_ha * 100).toFixed(2))
        : 50000;

      const upiPayload = `upi://pay?pa=parivesh.demo@upi&pn=PARIVESH%20DEMO&am=${amount}&cu=INR&tn=App-${application.id}`;
      const qrUrl = `https://quickchart.io/qr?size=260&text=${encodeURIComponent(upiPayload)}`;
      window.open(qrUrl, '_blank', 'noopener,noreferrer');

      const simulated = await scrutinyService.simulatePayment(application.id, amount);
      setPayment(simulated);
      toast.success('QR opened and demo payment simulated. You can now verify payment.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to open QR/simulate payment.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleReferToMeeting = async () => {
    if (!application) return;
    setActiveAction('refer');
    try {
      await ensureUnderScrutiny();

      let paymentSnapshot = payment;
      if (!paymentSnapshot) {
        throw new Error(
          'Payment has not been simulated by the Project Proponent yet. Please ask PP to complete payment first.'
        );
      }

      if (paymentSnapshot.status !== 'VERIFIED') {
        paymentSnapshot = await scrutinyService.verifyPayment(application.id);
        setPayment(paymentSnapshot);
      }

      let meetingId = meetings[0]?.id;
      if (!meetingId) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const createdMeeting = await scrutinyService.createMeeting(
          nextWeek.toISOString().slice(0, 10),
          'EAC',
          'EAC'
        );
        setMeetings((prev) => [createdMeeting, ...prev]);
        meetingId = createdMeeting.id;
      }

      await scrutinyService.referApplication(application.id, meetingId, remarks.trim() || null);
      toast.success('Application referred to meeting successfully.');
      await refreshQueue();
      await loadSelectedApplication(application.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to refer application.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleRaiseEDS = async () => {
    if (!application) return;
    if (!remarks.trim()) {
      toast.error('Enter internal remarks before raising EDS.');
      return;
    }

    setActiveAction('eds');
    try {
      await ensureUnderScrutiny();
      await scrutinyService.raiseEDS(application.id, remarks.trim(), [
        {
          standard_reason: 'Clarification required from scrutiny',
          comments: remarks.trim(),
          affected_field: attachedNoteName ? `Attachment: ${attachedNoteName}` : null,
        },
      ]);
      toast.success('EDS raised successfully.');
      await refreshQueue();
      await loadSelectedApplication(application.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to raise EDS.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!remarks.trim()) {
      toast.error('Add rejection remarks before proceeding.');
      return;
    }

    setActiveAction('reject');
    try {
      await ensureUnderScrutiny();
      await scrutinyService.raiseEDS(application.id, `Rejection note: ${remarks.trim()}`, [
        {
          standard_reason: 'Application rejected at scrutiny stage',
          comments: remarks.trim(),
        },
      ]);
      toast.success('Rejection note issued to proponent through EDS.');
      await refreshQueue();
      await loadSelectedApplication(application.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to process rejection.'));
    } finally {
      setActiveAction('');
    }
  };

  const handleAttachNote = () => {
    fileInputRef.current?.click();
  };

  const handleNoteSelected = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAttachedNoteName(file.name);
    toast.info(`Attached note: ${file.name}`);
  };

  const handleSaveDraft = () => {
    if (!application) {
      toast.error('No application selected.');
      return;
    }
    const savedAt = new Date().toISOString();
    localStorage.setItem(
      `scrutiny_draft_${application.id}`,
      JSON.stringify({
        remarks,
        attachedNoteName,
        savedAt,
      })
    );
    setLastDraftSnapshot(buildDraftSnapshot(remarks, attachedNoteName));
    setSavedDraftMeta({ savedAt });
    toast.success('Internal remarks draft saved.');
  };

  const appTitle = application?.project_name || 'No Application Selected';
  const appSubtitle = application
    ? `Proposal ID: ${application.id} | ${application.state || 'State pending'}`
    : 'Select an application from the scrutiny queue.';
  const queueDays = application ? getQueueDays(application.created_at) : 0;
  const submittedCount = applications.filter((item) => item.status === 'SUBMITTED').length;
  const underScrutinyCount = applications.filter((item) => item.status === 'UNDER_SCRUTINY').length;
  const edsCount = applications.filter((item) => item.status === 'EDS').length;
  const referredCount = applications.filter((item) => item.status === 'REFERRED').length;

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-slate-50">
      <header className="flex items-center justify-between border-b border-primary/10 bg-white px-8 py-3">
        <div className="flex items-center gap-8">
          <button className="flex items-center gap-4 text-primary" onClick={() => handleGuardedNavigation('/')} type="button">
            <div className="flex size-8 items-center justify-center rounded bg-primary/10">
              <span className="material-symbols-outlined text-primary">account_balance</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">PARIVESH 3.0</h2>
          </button>
          <nav className="flex items-center gap-6">
            <button className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" onClick={() => handleGuardedNavigation('/pp/dashboard')} type="button">
              Dashboard
            </button>
            <button className="border-b-2 border-primary text-sm font-bold text-primary" onClick={() => handleGuardedNavigation('/committee/scrutiny')} type="button">
              Scrutiny Queue
            </button>
            <button className="text-sm font-medium text-slate-600 transition-colors hover:text-primary" onClick={handleOpenMeetings} type="button">
              Meetings
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-10 items-center justify-center rounded bg-red-50 px-3 text-red-600 hover:bg-red-100"
            onClick={handleLogout}
            type="button"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
          <button
            className="flex h-10 items-center justify-center rounded bg-primary/10 px-3 text-primary"
            onClick={handleNotifications}
            type="button"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="flex h-10 items-center justify-center rounded bg-primary/10 px-3 text-primary"
            onClick={handleHelp}
            type="button"
          >
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-8 py-6">
        <section className="rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/[0.08] via-white to-sky-50 p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Scrutiny workspace</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Move the next file decisively</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Keep the active case in focus, review the documents and payment in one pass, then choose the next action without losing your internal notes.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              <SummaryStat label="In queue" value={applications.length} />
              <SummaryStat label="Submitted" value={submittedCount} />
              <SummaryStat label="Under scrutiny" value={underScrutinyCount} />
              <SummaryStat label="EDS / referred" value={`${edsCount}/${referredCount}`} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-4">
          <section className="rounded-xl border border-primary/10 bg-white p-4">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Scrutiny Queue</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">Pick a case, keep remarks attached to that application, and finish one decision path at a time.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">{applications.length}</span>
            </div>
            {isPageLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : queueError ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600">{queueError}</p>
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white"
                  onClick={loadInitialData}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">refresh</span>
                  Retry
                </button>
              </div>
            ) : applications.length === 0 ? (
              <p className="text-sm text-slate-500">No applications currently in scrutiny queue.</p>
            ) : (
              <div className="space-y-2">
                {applications.map((item) => (
                  <button
                    className={`w-full rounded-lg border px-3 py-2 text-left transition-all ${
                      selectedAppId === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 bg-white hover:border-primary/50'
                    }`}
                    key={item.id}
                    onClick={() => handleSelectApplication(item.id)}
                    type="button"
                  >
                    <p className="truncate text-sm font-semibold text-slate-900">{item.project_name}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatStatus(item.status)}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-primary/10 bg-white p-5">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[11px] uppercase text-slate-400">Category</p>
                <p className="font-semibold text-slate-800">{application?.category || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-400">Capacity</p>
                <p className="font-semibold text-slate-800">{application?.capacity || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase text-slate-400">Location</p>
                <p className="font-semibold text-slate-800">
                  {[application?.village, application?.district, application?.state].filter(Boolean).join(', ') ||
                    'N/A'}
                </p>
                <button
                  className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  onClick={handleOpenMap}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">map</span>
                  Open Map
                </button>
              </div>
            </div>
          </section>
        </aside>

        <section className="col-span-6 space-y-6">
          <div className="rounded-xl border border-primary/10 bg-white p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                {isDetailsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-72" />
                    <Skeleton className="h-4 w-96" />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-black text-slate-900">{appTitle}</h1>
                    <p className="mt-1 text-sm text-slate-500">{appSubtitle}</p>
                  </>
                )}
              </div>
              <div className="rounded-lg bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700">
                {queueDays} Days in Queue
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${
                  statusStyles[application?.status] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {formatStatus(application?.status)}
              </span>
              <span className="text-xs text-slate-500">Created: {formatDate(application?.created_at)}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-primary/10 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-lg font-bold text-slate-900">Document Verification Checklist</h3>
              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                {documents.length} DOCUMENTS
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Document</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Uploaded</th>
                    <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isDetailsLoading ? (
                    <tr><td colSpan="3" className="px-5 py-4"><SkeletonText lines={3} /></td></tr>
                  ) : documents.length === 0 ? (
                    <tr>
                      <td className="px-5 py-4 text-sm text-slate-500" colSpan="3">
                        No documents uploaded for this application.
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-5 py-4 text-sm font-medium text-slate-800">{doc.name}</td>
                        <td className="px-5 py-4 text-xs text-slate-500">{formatDate(doc.uploaded_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <button
                            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            onClick={() => handleDocumentAction(doc)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">visibility</span>
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-4">
              <div>
                <p className="text-xs font-bold text-slate-700">
                  Payment Status: {payment?.status || 'NOT AVAILABLE'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {payment?.transaction_ref
                    ? `Transaction ID: ${payment.transaction_ref} | Amount: INR ${payment.amount}`
                    : 'Payment details unavailable for this application.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 disabled:opacity-60"
                  disabled={!application || Boolean(activeAction) || payment?.status === 'VERIFIED'}
                  onClick={handleOpenQrAndSimulatePayment}
                  type="button"
                >
                  {activeAction === 'simulate' ? 'OPENING QR...' : 'Open QR + Simulate Paid'}
                </button>
                <button
                  className="rounded border border-primary/20 bg-white px-3 py-1 text-[11px] font-bold text-primary disabled:opacity-60"
                  disabled={!application || Boolean(activeAction)}
                  onClick={handleVerifyPayment}
                  type="button"
                >
                  {activeAction === 'verify' ? 'VERIFYING...' : 'Re-Verify'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="col-span-3 space-y-6">
          <div className="rounded-xl border-2 border-primary/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Action Panel</h3>
                <p className="mt-1 text-sm text-slate-500">Keep remarks tight, save locally when needed, then send the file down a single review path.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right text-xs font-semibold text-slate-600">
                <div>{documents.length} docs</div>
                <div>{payment?.status || 'Payment pending'}</div>
              </div>
            </div>
            <div className="mb-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-primary/[0.04] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">Current queue age</p>
                <p className="mt-1 text-lg font-black text-slate-900">{queueDays} days</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Selected status</p>
                <p className="mt-1 text-lg font-black text-slate-900">{formatStatus(application?.status)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Last draft save</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{savedDraftMeta?.savedAt ? formatDateTime(savedDraftMeta.savedAt) : 'Not saved yet'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                disabled={!application || Boolean(activeAction)}
                onClick={handleReferToMeeting}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">send</span>
                {activeAction === 'refer' ? 'Referring...' : 'Refer to Meeting (EAC)'}
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-3 font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                disabled={!application || Boolean(activeAction)}
                onClick={handleRaiseEDS}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">help_center</span>
                {activeAction === 'eds' ? 'Raising EDS...' : 'Raise EDS'}
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                disabled={!application || Boolean(activeAction)}
                onClick={handleReject}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">cancel</span>
                {activeAction === 'reject' ? 'Processing...' : 'Reject Application'}
              </button>
            </div>

            <hr className="my-5" />

            <div>
              <label className="mb-2 block text-xs font-bold uppercase text-slate-400">Internal Remarks</label>
              <textarea
                className="h-32 w-full rounded-lg border-none bg-slate-50 p-3 text-sm placeholder:text-slate-400 focus:ring-1 focus:ring-primary"
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Type your observations here..."
                value={remarks}
              />
              {savedDraftMeta?.savedAt ? (
                <p className="mt-2 text-[11px] text-slate-500">Local draft saved on {formatDateTime(savedDraftMeta.savedAt)}.</p>
              ) : (
                <p className="mt-2 text-[11px] text-slate-500">Save remarks locally if you need to leave this review and return later.</p>
              )}
              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary"
                  onClick={handleAttachNote}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">attach_file</span>
                  {attachedNoteName ? 'Change Note' : 'Attach Note'}
                </button>
                <button
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white"
                  onClick={handleSaveDraft}
                  type="button"
                >
                  SAVE DRAFT
                </button>
              </div>
              {attachedNoteName ? (
                <p className="mt-2 truncate text-[11px] text-slate-500">Attached: {attachedNoteName}</p>
              ) : null}
              <input
                accept=".txt,.doc,.docx,.pdf"
                className="hidden"
                onChange={handleNoteSelected}
                ref={fileInputRef}
                type="file"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-indigo-900 p-5 text-white shadow-sm">
            <div className="absolute -bottom-4 -right-4 opacity-10">
              <span className="material-symbols-outlined text-9xl">gavel</span>
            </div>
            <h4 className="mb-2 text-sm font-bold">Standard Operating Procedure</h4>
            <p className="mb-4 text-xs leading-relaxed text-indigo-200">
              Ensure industrial projects are scrutinized for emissions, water balance, and compliance notes.
            </p>
            <button
              className="inline-flex items-center gap-1 text-xs font-bold underline"
              onClick={handleHelp}
              type="button"
            >
              View Compliance Guide
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
        </aside>
        </div>
      </main>

      <footer className="mt-auto flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5 text-xs text-slate-500">
        <div>Copyright Ministry of Environment, Forest and Climate Change (MoEFCC), Government of India.</div>
        <div className="flex gap-6">
          <button className="hover:text-primary" onClick={handleHelp} type="button">
            Security Policy
          </button>
          <button className="hover:text-primary" onClick={handleNotifications} type="button">
            Audit Log
          </button>
          <button className="hover:text-primary" onClick={handleHelp} type="button">
            Accessibility Support
          </button>
        </div>
      </footer>
    </div>
  );
};

const SummaryStat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
    <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export default ScrutinyPortalApplicationReview;
