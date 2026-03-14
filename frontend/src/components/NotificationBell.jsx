import { useState, useEffect, useEffectEvent, useRef } from 'react';
import api from '../services/api';

const toSafeNotifications = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const formatTimeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useEffectEvent(async () => {
    try {
      const res = await api.get('/notifications/me');
      const nextNotifications = toSafeNotifications(res?.data);
      setNotifications(nextNotifications);
      setUnreadCount(nextNotifications.filter((n) => !n.is_read).length);
    } catch {
      // silent fail
      setNotifications([]);
      setUnreadCount(0);
    }
  });

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent fail
    }
  };

  const markAllRead = async () => {
    try {
      await api.post('/notifications/me/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // silent fail
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] transition-all duration-200 hover:border-[#22c55e]/25 hover:bg-[#22c55e]/10"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-lg text-white/80 transition-all duration-200 group-hover:scale-110 group-hover:text-[#22c55e]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-84 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0a140a] shadow-2xl shadow-black/70">
          <div className="h-px bg-gradient-to-r from-transparent via-[#22c55e]/40 to-transparent" />
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <span className="text-sm font-semibold text-white">Notifications</span>
              <p className="text-[10px] text-white/35">Realtime workflow updates</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="rounded-full border border-[#22c55e]/20 bg-[#22c55e]/10 px-2.5 py-1 text-[10px] font-semibold text-[#22c55e] transition-colors hover:bg-[#22c55e]/15"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="material-symbols-outlined text-3xl text-white/10">notifications_off</span>
                <p className="text-sm text-white/45">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && markRead(n.id)}
                  className={`cursor-pointer px-4 py-3 transition-colors hover:bg-white/[0.04] ${n.is_read ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${n.is_read ? 'bg-white/15' : 'bg-[#22c55e]'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs leading-relaxed text-white/90">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-[10px] text-white/35">{formatTimeAgo(n.created_at)}</p>
                        {!n.is_read && <span className="text-[10px] font-semibold text-[#22c55e]">Unread</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
