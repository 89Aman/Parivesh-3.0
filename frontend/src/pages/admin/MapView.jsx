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

let MapContainer, TileLayer, CircleMarker, Popup;

const MapView = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl]) => {
      MapContainer = rl.MapContainer;
      TileLayer = rl.TileLayer;
      CircleMarker = rl.CircleMarker;
      Popup = rl.Popup;
      setMapReady(true);
    }).catch(() => {
      toast.error('Map library not available.');
    });
  }, [toast]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await api.get('/admin/applications/geo');
        if (active) setApplications(res.data);
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load map data.'));
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [toast]);

  const statuses = ['ALL', ...new Set(applications.map((a) => a.status))];
  const filtered = filter === 'ALL' ? applications : applications.filter((a) => a.status === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#070f07]">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#22c55e] animate-spin" />
          <span className="material-symbols-outlined absolute inset-0 m-auto text-[#22c55e] text-xl leading-[3rem] text-center">map</span>
        </div>
        <p className="text-sm text-white/40">Loading map data…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070f07] p-6">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#22c55e]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[#22c55e] text-xl">map</span>
              <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#22c55e]/70">GIS View</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Application Map</h1>
            <p className="text-sm text-white/40 mt-1">{applications.length} projects plotted across India</p>
          </div>
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>Dashboard
          </Link>
        </div>

        {/* Stat chips */}
        <div className="flex gap-3 flex-wrap">
          {Object.entries(STATUS_COLORS).map(([status, color]) => {
            const count = applications.filter((a) => a.status === status).length;
            if (!count) return null;
            return (
              <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs text-white/60">{status.replaceAll('_', ' ')}</span>
                <span className="text-xs font-bold text-white">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                filter === s
                  ? 'bg-[#22c55e] text-[#070f07] shadow-lg shadow-[#22c55e]/20'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {s === 'ALL' ? `All (${applications.length})` : s.replaceAll('_', ' ')}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '520px' }}>
          {!mapReady ? (
            <div className="h-full flex flex-col items-center justify-center bg-white/[0.03] gap-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <span className="material-symbols-outlined text-4xl text-white/20">map</span>
              </div>
              <p className="text-sm text-white/40">Loading interactive map…</p>
            </div>
          ) : (
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((app) => (
                <CircleMarker
                  key={app.id}
                  center={[app.lat, app.lng]}
                  radius={9}
                  fillColor={STATUS_COLORS[app.status] || '#6b7280'}
                  color="#fff"
                  weight={1.5}
                  fillOpacity={0.9}
                >
                  <Popup>
                    <div style={{ minWidth: 160 }}>
                      <p style={{ fontWeight: 700, marginBottom: 4 }}>{app.project_name}</p>
                      <p style={{ color: STATUS_COLORS[app.status], fontWeight: 600, fontSize: 11 }}>{app.status?.replaceAll('_', ' ')}</p>
                      <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>Category: {app.category}</p>
                      <p style={{ fontSize: 11, color: '#666' }}>{app.state || 'N/A'} · {app.district || 'N/A'}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;

