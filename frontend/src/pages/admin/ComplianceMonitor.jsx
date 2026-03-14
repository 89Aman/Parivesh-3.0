import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/api';
import { ROUTES } from '../../constants/routes';

const STATUS_META = {
  PENDING:   { bg: 'bg-amber-500/15',  text: 'text-amber-400',  dot: 'bg-amber-400',  icon: 'schedule' },
  SUBMITTED: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', icon: 'check_circle' },
  OVERDUE:   { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400',    icon: 'warning' },
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isOverdue = (task) =>
  task.status === 'PENDING' && task.due_date && new Date(task.due_date) < new Date();

const ComplianceMonitor = () => {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await api.get('/compliance/admin/all');
        if (active) setTasks(res.data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load compliance tasks.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [toast]);

  const enriched = tasks.map((t) => ({
    ...t,
    effectiveStatus: isOverdue(t) ? 'OVERDUE' : t.status,
  }));

  const filtered = filter === 'ALL' ? enriched : enriched.filter((t) => t.effectiveStatus === filter);
  const counts = {
    ALL: enriched.length,
    PENDING: enriched.filter((t) => t.effectiveStatus === 'PENDING').length,
    SUBMITTED: enriched.filter((t) => t.effectiveStatus === 'SUBMITTED').length,
    OVERDUE: enriched.filter((t) => t.effectiveStatus === 'OVERDUE').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070f07]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#22c55e] animate-spin" />
          <span className="material-symbols-outlined absolute inset-0 m-auto text-[#22c55e] text-xl leading-[3rem] text-center">assignment</span>
        </div>
        <p className="text-sm text-white/40">Loading compliance tasks…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070f07] p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#22c55e] text-xl">assignment_turned_in</span>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#22c55e]/70">Post-Clearance</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Compliance Monitor</h1>
            <p className="text-sm text-white/40 mt-1">Track post-clearance obligations across all finalized projects</p>
          </div>
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>Dashboard
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{k:'ALL',label:'Total Tasks',icon:'list',c:'border-white/10 bg-white/[0.03]',tc:'text-white'},
            {k:'PENDING',label:'Pending',icon:'schedule',c:'border-amber-500/20 bg-amber-500/5',tc:'text-amber-400'},
            {k:'SUBMITTED',label:'Submitted',icon:'check_circle',c:'border-emerald-500/20 bg-emerald-500/5',tc:'text-emerald-400'},
            {k:'OVERDUE',label:'Overdue',icon:'warning',c:'border-red-500/20 bg-red-500/5',tc:'text-red-400'},
          ].map(({k,label,icon,c,tc}) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-2xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${c} ${
                filter === k ? 'ring-1 ring-white/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-white/50">{label}</span>
                <span className={`material-symbols-outlined text-lg ${tc}`}>{icon}</span>
              </div>
              <p className={`text-3xl font-black ${tc}`}>{counts[k]}</p>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">
              {filter === 'ALL' ? 'All Tasks' : filter} &mdash; <span className="text-white/40 font-normal">{filtered.length} tasks</span>
            </p>
            <div className="flex gap-2">
              {['ALL','PENDING','SUBMITTED','OVERDUE'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    filter === s ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <span className="material-symbols-outlined text-4xl text-white/10">assignment</span>
                <p className="text-sm text-white/30">No tasks found for this filter</p>
              </div>
            ) : (
              filtered.map((t) => {
                const meta = STATUS_META[t.effectiveStatus] || STATUS_META.PENDING;
                return (
                  <div key={t.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                    {/* Status dot */}
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/90 truncate">{t.task_name}</p>
                      {t.description && (
                        <p className="text-xs text-white/35 mt-0.5 truncate">{t.description}</p>
                      )}
                    </div>
                    {/* App ID */}
                    <span className="hidden md:block font-mono text-[10px] text-white/30 shrink-0">
                      {String(t.application_id).slice(0, 8)}…
                    </span>
                    {/* Due date */}
                    <span className="text-xs text-white/50 shrink-0 w-24 text-right">{formatDate(t.due_date)}</span>
                    {/* Status badge */}
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${meta.bg} ${meta.text}`}>
                      <span className="material-symbols-outlined text-[12px]">{meta.icon}</span>
                      {t.effectiveStatus}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplianceMonitor;
