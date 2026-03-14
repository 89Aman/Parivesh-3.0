import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import PariveshBrand from '../components/PariveshBrand';
import { Skeleton, SkeletonCard, SkeletonTableRows, SkeletonText } from '../components/Skeleton';
import adminService from '../services/adminService';
import { getApiErrorMessage } from '../services/api';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import { ROUTES } from '../constants/routes';

const roleStyles = {
  ADMIN: 'bg-red-500/15 text-red-300 border border-red-500/20',
  PP: 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/20',
  RQP: 'bg-violet-500/15 text-violet-300 border border-violet-500/20',
  SCRUTINY: 'bg-blue-500/15 text-blue-300 border border-blue-500/20',
  MOM: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
};

const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const formatStatusLabel = (status) => (status || 'N/A').replaceAll('_', ' ');

const RANGE_OPTIONS = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
];

const getRangeStartDate = (rangeKey) => {
  const now = new Date();
  if (rangeKey === 'today') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
  const days = rangeKey === '30d' ? 30 : 7;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

const toSafeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.results)) return value.results;
  return [];
};

const AdminPortalDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statsRange, setStatsRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: '',
    full_name: '',
    organization: '',
    phone: '',
    role_name: 'PP',
  });
  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    organization: '',
    phone: '',
    role_name: 'PP',
  });

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      try {
        const [usersData, applicationsData] = await Promise.all([
          adminService.getUsers(),
          adminService.getApplications(),
        ]);
        if (!isActive) return;
        setUsers(toSafeArray(usersData));
        setApplications(toSafeArray(applicationsData));
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load admin dashboard data.'));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => { isActive = false; };
  }, [toast]);

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roles?.some((r) => r.name.toLowerCase().includes(q))
    );
  });

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.password || !newUserForm.full_name) {
      toast.error('Email, password, and full name are required.');
      return;
    }

    try {
      setIsCreating(true);
      const created = await adminService.createUser(newUserForm);
      setUsers((prev) => [...prev, created]);
      setShowCreateModal(false);
      setShowCreatePassword(false);
      setNewUserForm({ email: '', password: '', full_name: '', organization: '', phone: '', role_name: 'PP' });
      toast.success(`User "${created.full_name}" created successfully.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create user.'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (u.id === user.id) {
      toast.error('You cannot delete your own account.');
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${u.full_name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(u.id);
      setUsers((prev) => prev.filter((item) => item.id !== u.id));
      toast.success(`User "${u.full_name}" has been deleted.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to delete user.'));
    }
  };

  const handleOpenEditModal = (u) => {
    const firstRole = (u.roles && u.roles[0]?.name) || 'PP';
    setEditingUser(u);
    setEditUserForm({
      full_name: u.full_name || '',
      organization: u.organization || '',
      phone: u.phone || '',
      role_name: firstRole,
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editUserForm.full_name) {
      toast.error('Full name is required.');
      return;
    }

    try {
      setIsUpdating(true);
      const updated = await adminService.updateUser(editingUser.id, editUserForm);
      setUsers((prev) => prev.map((item) => (item.id === editingUser.id ? updated : item)));
      setShowEditModal(false);
      setEditingUser(null);
      toast.success(`User "${updated.full_name}" updated successfully.`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update user.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const rangeStart = getRangeStartDate(statsRange);
  const scopedApplications = applications.filter((app) => {
    const rawDate = app.updated_at || app.created_at;
    if (!rawDate) return false;
    return new Date(rawDate) >= rangeStart;
  });

  const totalApplications = scopedApplications.length;
  const totalApplicants = new Set(scopedApplications.map((a) => a.applicant_id)).size;
  const statusCounts = scopedApplications.reduce((acc, app) => {
    const key = app.status || 'UNKNOWN';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pendingApplications =
    (statusCounts.SUBMITTED || 0) +
    (statusCounts.UNDER_SCRUTINY || 0) +
    (statusCounts.EDS || 0) +
    (statusCounts.REFERRED || 0) +
    (statusCounts.MOM_GENERATED || 0);
  const finalizedApplications = statusCounts.FINALIZED || 0;
  const completionRate = totalApplications
    ? Math.round((finalizedApplications / totalApplications) * 100)
    : 0;
  const recentApplications = [...scopedApplications]
    .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
    .slice(0, 4);

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#070f07] text-white">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 left-8 h-80 w-80 rounded-full bg-[#22c55e]/6 blur-3xl" />
          <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-500/5 blur-3xl" />
        </div>

        {/* Sidebar */}
        <aside className="relative z-50 flex w-[290px] shrink-0 flex-col border-r border-white/10 bg-[#091209]/90 text-white backdrop-blur-xl">
          <Link to={ROUTES.ROOT} className="flex items-center gap-3 border-b border-white/10 p-6 group">
            <PariveshBrand className="transition-all group-hover:opacity-90" subtitle="Admin Portal" theme="dark" />
          </Link>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            <Link className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#22c55e]/20 to-[#22c55e]/8 px-3 py-3 font-bold text-white ring-1 ring-[#22c55e]/15 transition-all shadow-lg shadow-[#22c55e]/10" to={ROUTES.ADMIN_DASHBOARD}>
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm">User Management</span>
            </Link>
            <Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/55 hover:bg-white/[0.05] hover:text-white transition-all" to={ROUTES.ADMIN_ANALYTICS}>
              <span className="material-symbols-outlined">bar_chart</span>
              <span className="text-sm">Analytics</span>
            </Link>
            <Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/55 hover:bg-white/[0.05] hover:text-white transition-all" to={ROUTES.ADMIN_MAP}>
              <span className="material-symbols-outlined">map</span>
              <span className="text-sm">Map View</span>
            </Link>
            <Link className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-white/55 hover:bg-white/[0.05] hover:text-white transition-all" to={ROUTES.ADMIN_COMPLIANCE}>
              <span className="material-symbols-outlined">assignment</span>
              <span className="text-sm">Compliance Monitor</span>
            </Link>
          </nav>

          <div className="border-t border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex size-10 items-center justify-center rounded-full border border-[#22c55e]/20 bg-[#22c55e]/15 text-xs font-bold text-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.12)]">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
              </div>
              <button className="text-white/35 hover:text-red-400 transition-colors" onClick={handleLogout} title="Logout">
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative flex flex-1 flex-col overflow-y-auto bg-transparent">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#091209]/75 px-8 py-4 backdrop-blur-xl">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22c55e]/65">Operations Console</p>
              <h2 className="text-2xl font-black tracking-tight text-white">User Management</h2>
              <p className="text-sm text-white/40">Manage system users, assign roles, and create new accounts.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
              <a
                href="/api/v1/admin/export"
                download
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/75 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export CSV
              </a>
              <button
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-emerald-400 px-4 py-2 text-sm font-semibold text-[#062706] transition-all shadow-lg shadow-[#22c55e]/20 hover:scale-[1.02]"
                onClick={() => {
                  setShowCreatePassword(false);
                  setShowCreateModal(true);
                }}
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create New User
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8">
            {/* Stats */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Performance Snapshot</h3>
                <p className="text-sm text-white/40">Track applications and pipeline health by timeframe.</p>
              </div>
              <div className="inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-1 shadow-sm backdrop-blur-sm">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatsRange(option.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      statsRange === option.key
                        ? 'bg-[#22c55e] text-[#062706] shadow'
                        : 'text-white/55 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-500/12 to-blue-500/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Total Applications</span>
                    <span className="mt-1 text-3xl font-black leading-none text-white">{totalApplications}</span>
                  </div>
                  <div className="rounded-2xl bg-blue-500/12 p-3 text-blue-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">description</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                    <span className="material-symbols-outlined !text-xs">groups</span> Applicants: {totalApplicants}
                  </span>
                </div>
                <div className="text-[11px] text-white/40">Realtime total proposals in system</div>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-red-500/12 to-red-500/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Pending Review</span>
                    <span className="mt-1 text-3xl font-black leading-none text-white">{pendingApplications}</span>
                  </div>
                  <div className="rounded-2xl bg-red-500/12 p-3 text-red-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">warning</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300">
                    <span className="material-symbols-outlined !text-xs">report</span> EDS: {statusCounts.EDS || 0}
                  </span>
                </div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 15 Q 15 25, 30 18 T 50 30 T 75 15 T 100 35" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/12 to-emerald-500/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Finalized</span>
                    <span className="mt-1 text-3xl font-black leading-none text-white">{finalizedApplications}</span>
                  </div>
                  <div className="rounded-2xl bg-emerald-500/12 p-3 text-emerald-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    <span className="material-symbols-outlined !text-xs">check_circle</span> Completion: {completionRate}%
                  </span>
                </div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 35 L 20 28 L 40 32 L 60 18 L 80 22 L 100 5" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-amber-500/12 to-amber-500/4 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Live Pipeline</span>
                    <span className="mt-1 text-3xl font-black leading-none text-white">{statusCounts.UNDER_SCRUTINY || 0}</span>
                  </div>
                  <div className="rounded-2xl bg-amber-500/12 p-3 text-amber-300 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">pending_actions</span>
                  </div>
                </div>
                <div className="text-[11px] text-white/40">
                  Submitted: {statusCounts.SUBMITTED || 0} • Referred: {statusCounts.REFERRED || 0}
                </div>
              </div>
                </>
              )}
            </div>            {/* User Table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex flex-col items-start justify-between gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center">
                  <h3 className="text-lg font-bold text-white">User Directory</h3>
                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/25 text-xl">search</span>
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/25 transition-all focus:bg-white/[0.07]"
                      placeholder="Search users..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto flex-1">
                  {isLoading ? (
                    <SkeletonTableRows rows={6} cols={3} />
                  ) : (
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-white/[0.03] text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Roles</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-white/45">No users found.</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-full bg-[#22c55e]/15 text-[10px] font-bold uppercase text-[#22c55e]">
                                  {getInitials(u.full_name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-white">{u.full_name}</p>
                                  <p className="truncate text-[10px] text-white/35">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(u.roles || []).map((r) => (
                                  <span key={r.id} className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-tighter ${roleStyles[r.name] || 'border border-white/10 bg-white/10 text-white/60'}`}>
                                    {r.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button className="p-1 text-white/35 transition-colors hover:text-[#22c55e]" onClick={() => handleOpenEditModal(u)}><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button className="p-1 text-white/35 transition-colors hover:text-red-400" onClick={() => handleDeleteUser(u)}><span className="material-symbols-outlined text-lg">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  )}
                </div>
                <div className="border-t border-white/10 px-6 py-3 text-[10px] font-medium text-white/30">
                  Showing {filteredUsers.length} users
                </div>
              </div>

              {/* Recent Activity Side Section */}
              <div className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold tracking-tight text-white">Recent Activity</h3>
                  <span className="material-symbols-outlined text-[#22c55e] text-xl">history</span>
                </div>
                <div className="space-y-6 flex-1">
                  {isLoading ? (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <SkeletonText lines={2} />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <SkeletonText lines={2} />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1">
                          <SkeletonText lines={2} />
                        </div>
                      </div>
                    </div>
                  ) : recentApplications.length === 0 ? (
                    <p className="text-sm text-white/45">No recent application activity.</p>
                  ) : (
                    recentApplications.map((app) => {
                      const status = app.status || 'UNKNOWN';
                      const isFinal = status === 'FINALIZED';
                      const isEds = status === 'EDS';
                      const isScrutiny = status === 'UNDER_SCRUTINY';
                      const icon = isFinal ? 'task_alt' : isEds ? 'report' : isScrutiny ? 'pending_actions' : 'description';
                      const color = isFinal ? 'text-emerald-500' : isEds ? 'text-red-500' : isScrutiny ? 'text-amber-500' : 'text-blue-500';
                      const bg = isFinal ? 'bg-emerald-500/12' : isEds ? 'bg-red-500/12' : isScrutiny ? 'bg-amber-500/12' : 'bg-blue-500/12';

                      return (
                        <div key={app.id} className="flex gap-4 group cursor-default">
                          <div className={`size-10 shrink-0 rounded-full ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <span className="material-symbols-outlined !text-xl">{icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="truncate text-sm font-bold text-white">{app.project_name || `Application ${String(app.id).slice(0, 8)}`}</p>
                            <p className="truncate text-[10px] text-white/35">
                              {formatStatusLabel(status)} • #{String(app.id).slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-auto flex flex-col items-center justify-between gap-4 border-t border-white/10 px-8 py-6 text-xs text-white/30 md:flex-row">
            <p>© 2024 Ministry of Environment, Forest and Climate Change. All Rights Reserved.</p>
            <div className="flex gap-6 uppercase tracking-widest font-bold">
              <a className="transition-colors hover:text-[#22c55e]" href="#">Privacy Policy</a>
              <a className="transition-colors hover:text-[#22c55e]" href="#">Terms of Service</a>
              <a className="transition-colors hover:text-[#22c55e]" href="#">Help Desk</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#0a140a] shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-white">Create New User</h3>
                <p className="text-sm text-white/40">Only administrators can create new user accounts.</p>
              </div>
              <button
                className="text-white/35 transition-colors hover:text-white"
                onClick={() => setShowCreateModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Full Name *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    required
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Email Address *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Password *</label>
                  <div className="relative">
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 pr-12 text-sm text-white"
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={newUserForm.password}
                      onChange={(e) => setNewUserForm((f) => ({ ...f, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition-colors hover:text-[#22c55e]"
                      title={showCreatePassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showCreatePassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/70">Organization</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    value={newUserForm.organization}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/70">Phone</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Assign Role *</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    value={newUserForm.role_name}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, role_name: e.target.value }))}
                  >
                    <option value="PP">Project Proponent (PP)</option>
                    <option value="RQP">Registered Qualified Person (RQP)</option>
                    <option value="SCRUTINY">Scrutiny Officer</option>
                    <option value="MOM">Minutes of Meeting (MoM)</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-white/55 transition-colors hover:text-white"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-emerald-400 px-6 py-2 text-sm font-bold text-[#062706] shadow-lg shadow-[#22c55e]/20 transition-all disabled:cursor-not-allowed disabled:opacity-70 hover:scale-[1.02]"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg overflow-hidden rounded-[28px] border border-white/10 bg-[#0a140a] shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-white">Edit User</h3>
                <p className="text-sm text-white/40">Update profile fields and assigned role.</p>
              </div>
              <button
                className="text-white/35 transition-colors hover:text-white"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleUpdateUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Full Name *</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    required
                    value={editUserForm.full_name}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/70">Organization</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    value={editUserForm.organization}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-white/70">Phone</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-semibold text-white/70">Assigned Role *</label>
                  <select
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] p-2.5 text-sm text-white"
                    value={editUserForm.role_name}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, role_name: e.target.value }))}
                  >
                    <option value="PP">Project Proponent (PP)</option>
                    <option value="RQP">Registered Qualified Person (RQP)</option>
                    <option value="SCRUTINY">Scrutiny Officer</option>
                    <option value="MOM">Minutes of Meeting (MoM)</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-white/55 transition-colors hover:text-white"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#22c55e] to-emerald-400 px-6 py-2 text-sm font-bold text-[#062706] shadow-lg shadow-[#22c55e]/20 transition-all disabled:cursor-not-allowed disabled:opacity-70 hover:scale-[1.02]"
                >
                  {isUpdating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPortalDashboard;
