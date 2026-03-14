import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/api';
import { ROUTES } from '../../constants/routes';

const STATUS_META = {
  PENDING:   { bar: 'bg-amber-500',   text: 'text-amber-400',   badge: 'bg-amber-500/15 text-amber-400',   icon: 'schedule' },
  SUBMITTED: { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400', icon: 'check_circle' },
  OVERDUE:   { bar: 'bg-red-500',     text: 'text-red-400',     badge: 'bg-red-500/15 text-red-400',         icon: 'warning' },
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86_400_000);
  return diff;
};

const isOverdue = (task) =>
  task.status === 'PENDING' && task.due_date && new Date(task.due_date) < new Date();

const ComplianceTracker = () => {
  const { appId } = useParams();
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/compliance/${appId}`);
      setTasks(res.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load compliance tasks.'));
    } finally {
      setIsLoading(false);
    }
  }, [appId, toast]);

  useEffect(() => {
    if (appId) load();
  }, [appId, load]);

  const submitTask = async (taskId) => {
    setSubmitting(taskId);
    try {
      await api.patch(`/compliance/${taskId}/submit`);
      toast.success('Task marked as submitted!');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to submit task.'));
    } finally {
      setSubmitting(null);
    }
  };

  const enriched = tasks.map((t) => ({
    ...t,
    effectiveStatus: isOverdue(t) ? 'OVERDUE' : t.status,
  }));

  const done = enriched.filter((t) => t.effectiveStatus === 'SUBMITTED').length;
  const pct = enriched.length ? Math.round((done / enriched.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070f07]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#22c55e] animate-spin" />
          <span className="material-symbols-outlined absolute inset-0 m-auto text-[#22c55e] text-xl leading-[3rem] text-center">assignment</span>
        </div>
        <p className="text-sm text-white/40">Loading your compliance tasks…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070f07] p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 right-0 w-80 h-80 bg-[#22c55e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#22c55e] text-xl">checklist</span>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#22c55e]/70">Post-Clearance</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Compliance Tracker</h1>
            <p className="text-sm text-white/40 mt-1">Track your post-clearance obligations</p>
          </div>
          <Link
            to={ROUTES.PP_DASHBOARD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>Dashboard
          </Link>
        </div>

        {enriched.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-white">
                {done} of {enriched.length} tasks completed
              </p>
              <span className={`text-lg font-black ${ pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-white/60' }`}>{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#22c55e] to-emerald-400 transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3">
              {[{label:'Done',count:done,color:'text-emerald-400'},{label:'Pending',count:enriched.filter(t=>t.effectiveStatus==='PENDING').length,color:'text-amber-400'},{label:'Overdue',count:enriched.filter(t=>t.effectiveStatus==='OVERDUE').length,color:'text-red-400'}].map(({label,count,color})=>(
                <div key={label} className="text-center">
                  <p className={`text-xl font-black ${color}`}>{count}</p>
                  <p className="text-[10px] text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {enriched.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 flex flex-col items-center gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="material-symbols-outlined text-4xl text-white/20">assignment</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/60">No compliance tasks yet</p>
              <p className="text-xs text-white/30 mt-1">Tasks are auto-generated when your application is finalized.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {enriched.map((task, idx) => {
              const meta = STATUS_META[task.effectiveStatus] || STATUS_META.PENDING;
              const days = daysUntil(task.due_date);
              return (
                <div
                  key={task.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden flex hover:bg-white/[0.05] transition-colors group"
                >
                  {/* Timeline left bar */}
                  <div className={`w-1 flex-shrink-0 ${meta.bar}`} />
                  <div className="flex-1 p-4 flex items-start justify-between gap-4 min-w-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${meta.badge}`}>
                          <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                          {task.effectiveStatus}
                        </span>
                        {task.due_date && (
                          <span className={`text-[10px] font-medium ${ days !== null && days < 0 ? 'text-red-400' : days !== null && days <= 7 ? 'text-amber-400' : 'text-white/40' }`}>
                            {days !== null && days < 0
                              ? `${Math.abs(days)}d overdue`
                              : days !== null
                              ? `${days}d remaining`
                              : formatDate(task.due_date)
                            }
                          </span>
                        )}
                        <span className="text-[10px] text-white/25 ml-auto">#{idx + 1}</span>
                      </div>
                      <p className="text-sm font-semibold text-white">{task.task_name}</p>
                      {task.description && (
                        <p className="text-xs text-white/50 mt-1 leading-relaxed">{task.description}</p>
                      )}
                      {task.submitted_at && (
                        <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Submitted {formatDate(task.submitted_at)}
                        </p>
                      )}
                    </div>
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => submitTask(task.id)}
                        disabled={submitting === task.id}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22c55e]/15 hover:bg-[#22c55e]/25 text-[#22c55e] text-xs font-semibold border border-[#22c55e]/20 transition-all disabled:opacity-50 hover:scale-[1.02]"
                      >
                        {submitting === task.id ? (
                          <>
                            <span className="w-3 h-3 rounded-full border border-t-[#22c55e] border-white/20 animate-spin" />
                            Submitting…
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[14px]">upload</span>
                            Mark Submitted
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceTracker;
