import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import { Skeleton, SkeletonCard, SkeletonTableRows, SkeletonText } from '../components/Skeleton';
import adminService from '../services/adminService';
import { getApiErrorMessage } from '../services/api';

const roleStyles = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  RQP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SCRUTINY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MOM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
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
        setUsers(usersData);
        setApplications(applicationsData);
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
    navigate('/login', { replace: true });
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
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] bg-slate-950 text-white flex flex-col shrink-0 border-r border-white/5 relative z-50">
          <Link to="/" className="p-6 flex items-center gap-3 border-b border-white/5 group">
            <div className="size-10 bg-primary/20 flex items-center justify-center rounded-lg text-primary transition-all group-hover:bg-primary/30 group-hover:shadow-[0_0_15px_rgba(23,207,109,0.3)]">
              <span className="material-symbols-outlined font-icon-bold text-2xl">account_balance</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white font-black text-lg leading-tight tracking-tight">PARIVESH 3.0</h1>
              <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold">Admin Portal</p>
            </div>
          </Link>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white font-bold transition-all shadow-lg shadow-primary/20" to="/admin/dashboard">
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm">User Management</span>
            </Link>
          </nav>

          <div className="p-4 bg-slate-900/50 border-t border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="size-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs border border-primary/20 shadow-[0_0_10px_rgba(23,207,109,0.1)]">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button className="text-slate-500 hover:text-red-400 transition-colors" onClick={handleLogout} title="Logout">
                <span className="material-symbols-outlined text-lg">logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-background-light dark:bg-background-dark">
          <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-primary/5 px-8 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">User Management</h2>
              <p className="text-sm text-slate-500">Manage system users, assign roles, and create new accounts.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-primary/20"
                onClick={() => setShowCreateModal(true)}
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
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Performance Snapshot</h3>
                <p className="text-sm text-slate-500">Track applications and pipeline health by timeframe.</p>
              </div>
              <div className="inline-flex rounded-xl border border-primary/10 bg-white p-1 shadow-sm dark:bg-slate-900">
                {RANGE_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStatsRange(option.key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                      statsRange === option.key
                        ? 'bg-primary text-white shadow'
                        : 'text-slate-600 hover:bg-primary/10 hover:text-primary dark:text-slate-300'
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
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Applications</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{totalApplications}</span>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">description</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                    <span className="material-symbols-outlined !text-xs">groups</span> Applicants: {totalApplicants}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Realtime total proposals in system</div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending Review</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{pendingApplications}</span>
                  </div>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-500 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">warning</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                    <span className="material-symbols-outlined !text-xs">report</span> EDS: {statusCounts.EDS || 0}
                  </span>
                </div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 15 Q 15 25, 30 18 T 50 30 T 75 15 T 100 35" fill="none" stroke="#ef4444" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Finalized</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{finalizedApplications}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">verified</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="flex items-center text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                    <span className="material-symbols-outlined !text-xs">check_circle</span> Completion: {completionRate}%
                  </span>
                </div>
                <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 40">
                  <path d="M0 35 L 20 28 L 40 32 L 60 18 L 80 22 L 100 5" fill="none" stroke="#10b981" strokeLinecap="round" strokeWidth="2"></path>
                </svg>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-primary/10 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Pipeline</span>
                    <span className="text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{statusCounts.UNDER_SCRUTINY || 0}</span>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-500 group-hover:scale-110 transition-transform duration-300">
                    <span className="material-symbols-outlined !text-3xl">pending_actions</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Submitted: {statusCounts.SUBMITTED || 0} • Referred: {statusCounts.REFERRED || 0}
                </div>
              </div>
                </>
              )}
            </div>            {/* User Table */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-5 border-b border-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">User Directory</h3>
                  <div className="relative w-full sm:w-80">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input
                      className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 dark:text-slate-100"
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
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest">
                        <th className="px-6 py-4">User Details</th>
                        <th className="px-6 py-4">Roles</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No users found.</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px] uppercase">
                                  {getInitials(u.full_name)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{u.full_name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {(u.roles || []).map((r) => (
                                  <span key={r.id} className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-black uppercase tracking-tighter ${roleStyles[r.name] || 'bg-slate-100 text-slate-600'}`}>
                                    {r.name}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button className="text-slate-400 hover:text-primary p-1 transition-colors" onClick={() => handleOpenEditModal(u)}><span className="material-symbols-outlined text-lg">edit</span></button>
                                <button className="text-slate-400 hover:text-red-500 p-1 transition-colors" onClick={() => handleDeleteUser(u)}><span className="material-symbols-outlined text-lg">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  )}
                </div>
                <div className="px-6 py-3 border-t border-primary/5 text-[10px] text-slate-400 font-medium">
                  Showing {filteredUsers.length} users
                </div>
              </div>

              {/* Recent Activity Side Section */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Activity</h3>
                  <span className="material-symbols-outlined text-primary text-xl">history</span>
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
                    <p className="text-sm text-slate-500">No recent application activity.</p>
                  ) : (
                    recentApplications.map((app) => {
                      const status = app.status || 'UNKNOWN';
                      const isFinal = status === 'FINALIZED';
                      const isEds = status === 'EDS';
                      const isScrutiny = status === 'UNDER_SCRUTINY';
                      const icon = isFinal ? 'task_alt' : isEds ? 'report' : isScrutiny ? 'pending_actions' : 'description';
                      const color = isFinal ? 'text-emerald-500' : isEds ? 'text-red-500' : isScrutiny ? 'text-amber-500' : 'text-blue-500';
                      const bg = isFinal ? 'bg-emerald-50 dark:bg-emerald-900/20' : isEds ? 'bg-red-50 dark:bg-red-900/20' : isScrutiny ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-blue-50 dark:bg-blue-900/20';

                      return (
                        <div key={app.id} className="flex gap-4 group cursor-default">
                          <div className={`size-10 shrink-0 rounded-full ${bg} ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <span className="material-symbols-outlined !text-xl">{icon}</span>
                          </div>
                          <div className="flex flex-col min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{app.project_name || `Application ${String(app.id).slice(0, 8)}`}</p>
                            <p className="text-[10px] text-slate-500 truncate">
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

          <footer className="mt-auto px-8 py-6 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-xs">
            <p>© 2024 Ministry of Environment, Forest and Climate Change. All Rights Reserved.</p>
            <div className="flex gap-6 uppercase tracking-widest font-bold">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
              <a className="hover:text-primary transition-colors" href="#">Help Desk</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-primary/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-primary/10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New User</h3>
                <p className="text-sm text-slate-500">Only administrators can create new user accounts.</p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowCreateModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleCreateUser}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    required
                    value={newUserForm.full_name}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Password *</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="password"
                    required
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, password: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    value={newUserForm.organization}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign Role *</label>
                  <select
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
          <div className="w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-primary/10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-primary/10">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Edit User</h3>
                <p className="text-sm text-slate-500">Update profile fields and assigned role.</p>
              </div>
              <button
                className="text-slate-400 hover:text-slate-600 transition-colors"
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
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    required
                    value={editUserForm.full_name}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, full_name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    value={editUserForm.organization}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                  <input
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    type="text"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Role *</label>
                  <select
                    className="w-full rounded-lg border border-primary/20 bg-slate-50 dark:bg-slate-800 p-2.5 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              <div className="flex justify-end gap-3 pt-4 border-t border-primary/10">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
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
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
