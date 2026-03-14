import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ToastProvider';
import api from '../../services/api';
import { getApiErrorMessage } from '../../services/api';
import { ROUTES } from '../../constants/routes';

const STATUS_COLORS = {
  DRAFT: '#6b7280',
  SUBMITTED: '#3b82f6',
  UNDER_SCRUTINY: '#f59e0b',
  EDS: '#ef4444',
  REFERRED: '#6366f1',
  MOM_GENERATED: '#8b5cf6',
  FINALIZED: '#22c55e',
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_SCRUTINY: 'Scrutiny',
  EDS: 'EDS',
  REFERRED: 'Referred',
  MOM_GENERATED: 'MoM',
  FINALIZED: 'Finalized',
};

const toSafeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const toSafeCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatusRows = (value) => {
  return toSafeArray(value)
    .map((row) => ({
      status: String(row?.status || 'UNKNOWN'),
      count: toSafeCount(row?.count),
    }))
    .filter((row) => row.status && row.count >= 0);
};

const normalizeSectorRows = (value) => {
  return toSafeArray(value)
    .map((row, index) => ({
      sector_id: row?.sector_id ?? `S-${index + 1}`,
      count: toSafeCount(row?.count),
    }))
    .sort((a, b) => b.count - a.count);
};

const normalizeTrendRows = (value) => {
  return toSafeArray(value)
    .map((row) => ({
      month: String(row?.month || ''),
      count: toSafeCount(row?.count),
    }))
    .filter((row) => row.month);
};

const BarChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-xs text-white/40 py-8 text-center">No data available</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-3 h-40 mt-4 px-1">
      {data.map((d) => {
        const color = STATUS_COLORS[d.status] || '#6b7280';
        const pct = Math.max((d.count / max) * 100, 3);
        return (
          <div key={d.status} className="flex flex-col items-center gap-1.5 flex-1 group">
            <span className="text-[10px] font-semibold text-white/60 group-hover:text-white transition-colors">{d.count}</span>
            <div className="w-full relative rounded-t-md overflow-hidden" style={{ height: `${(pct / 100) * 120}px` }}>
              <div
                className="absolute inset-0 opacity-30 rounded-t-md"
                style={{ background: color }}
              />
              <div
                className="absolute bottom-0 inset-x-0 rounded-t-md transition-all duration-700"
                style={{ background: `linear-gradient(to top, ${color}, ${color}99)`, height: '100%' }}
              />
            </div>
            <span className="text-[8px] text-white/40 text-center leading-tight group-hover:text-white/70 transition-colors">
              {STATUS_LABELS[d.status] || d.status}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const LineChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-xs text-white/40 py-8 text-center">No data available</p>;
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 400; const h = 120; const pad = 24;
  const pts = data.map((d, i) => ({
    x: pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2),
    y: h - pad - ((d.count / max) * (h - pad * 2)),
    ...d,
  }));
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M ${pts[0].x},${h - pad} ` + pts.map((p) => `L ${p.x},${p.y}`).join(' ') + ` L ${pts[pts.length-1].x},${h-pad} Z`;
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-28">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lineGrad)" />
        <polyline fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={polyline} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#22c55e" stroke="#0f1f0f" strokeWidth="1.5">
            <title>{`${p.month}: ${p.count} applications`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between px-1">
        {pts.map((p) => (
          <span key={p.month} className="text-[9px] text-white/30">{p.month?.slice(5)}</span>
        ))}
      </div>
    </div>
  );
};

const Analytics = () => {
  const toast = useToast();
  const [overview, setOverview] = useState({
    total_applications: 0,
    total_finalized: 0,
    by_status: [],
  });
  const [sector, setSector] = useState([]);
  const [trend, setTrend] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [ov, sec, tr] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/by-sector'),
          api.get('/analytics/monthly-trend'),
        ]);
        if (!active) return;
        const safeOverview = {
          total_applications: toSafeCount(ov?.data?.total_applications),
          total_finalized: toSafeCount(ov?.data?.total_finalized),
          by_status: normalizeStatusRows(ov?.data?.by_status),
        };
        setOverview(safeOverview);
        setSector(normalizeSectorRows(sec?.data));
        setTrend(normalizeTrendRows(tr?.data));
        setLoadError('');
      } catch (err) {
        const message = getApiErrorMessage(err, 'Failed to load analytics.');
        setLoadError(message);
        setOverview({ total_applications: 0, total_finalized: 0, by_status: [] });
        setSector([]);
        setTrend([]);
        toast.error(message);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070f07]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#22c55e] animate-spin" />
          <span className="material-symbols-outlined absolute inset-0 m-auto text-[#22c55e] text-xl leading-[3rem] text-center">bar_chart</span>
        </div>
        <p className="text-sm text-white/40">Loading analytics…</p>
      </div>
    );
  }

  const clearanceRate = overview?.total_applications
    ? Math.round((overview.total_finalized / overview.total_applications) * 100)
    : 0;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#070f07] p-6">
        <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-red-300">error</span>
          <h1 className="text-2xl font-bold text-white">Analytics unavailable</h1>
          <p className="text-sm text-red-100/90">{loadError}</p>
          <div className="mt-2 flex items-center gap-3">
            <button
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              onClick={() => window.location.reload()}
              type="button"
            >
              Retry
            </button>
            <Link
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
              to={ROUTES.ADMIN_DASHBOARD}
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070f07] p-6">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#22c55e]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-7">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#22c55e] text-xl">analytics</span>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#22c55e]/70">Command Centre</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Analytics Dashboard</h1>
            <p className="text-sm text-white/40 mt-1">Real-time metrics across all Environmental Clearance applications</p>
          </div>
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Dashboard
          </Link>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Applications', value: overview?.total_applications ?? 0, icon: 'folder_open', gradient: 'from-[#22c55e]/20 to-[#22c55e]/5', iconColor: 'text-[#22c55e]', border: 'border-[#22c55e]/20' },
            { label: 'Clearance Rate', value: `${clearanceRate}%`, icon: 'verified', gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', border: 'border-blue-500/20' },
            { label: 'Finalized', value: overview?.total_finalized ?? 0, icon: 'check_circle', gradient: 'from-emerald-500/20 to-emerald-500/5', iconColor: 'text-emerald-400', border: 'border-emerald-500/20' },
            { label: 'Active Sectors', value: sector.length, icon: 'category', gradient: 'from-purple-500/20 to-purple-500/5', iconColor: 'text-purple-400', border: 'border-purple-500/20' },
          ].map((kpi) => (
            <div key={kpi.label} className={`relative rounded-2xl border ${kpi.border} bg-gradient-to-br ${kpi.gradient} p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-white/50 mb-2">{kpi.label}</p>
                  <p className="text-3xl font-black text-white">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10`}>
                  <span className={`material-symbols-outlined text-xl ${kpi.iconColor}`}>{kpi.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Applications by Status</h3>
              <span className="text-xs text-white/30">All time</span>
            </div>
            <p className="text-xs text-white/40 mb-2">Distribution across workflow stages</p>
            <BarChart data={overview?.by_status || []} />
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white">Monthly Submission Trend</h3>
              <span className="text-xs text-white/30">Last 12 months</span>
            </div>
            <p className="text-xs text-white/40 mb-2">Applications submitted per month</p>
            <LineChart data={trend} />
          </div>
        </div>

        {/* Top sectors */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-white">Sector Breakdown</h3>
              <p className="text-xs text-white/40 mt-0.5">Applications by sector (top 8)</p>
            </div>
            <span className="text-xs font-mono text-white/30">{sector.length} sectors</span>
          </div>
          <div className="space-y-3">
            {sector.slice(0, 8).map((s, i) => {
              const maxCount = sector[0]?.count || 1;
              const pct = Math.round((s.count / maxCount) * 100);
              const opacity = 1 - i * 0.08;
              return (
                <div key={s.sector_id} className="flex items-center gap-4 group">
                  <span className="text-xs text-white/40 w-16 font-mono">Sector {s.sector_id}</span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${pct}%`, background: `rgba(34,197,94,${opacity})` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/60 w-8 text-right group-hover:text-white transition-colors">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
