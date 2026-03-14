import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import adminService from '../services/adminService';
import { getApiErrorMessage } from '../services/api';

const roleStyles = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  PP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  RQP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SCRUTINY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MOM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const roleLabels = {
  ADMIN: 'Administrator',
  PP: 'Project Proponent',
  RQP: 'Registered Qualified Person',
  SCRUTINY: 'Scrutiny Officer',
  MOM: 'Minutes of Meeting',
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

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString));
};

const AdminPortalDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout } = useAuth();

  const [users, setUsers] = useState([]);
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

    const loadUsers = async () => {
      try {
        const data = await adminService.getUsers();
        if (isActive) setUsers(data);
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to load users.'));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadUsers();
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

  const roleCounts = users.reduce((acc, u) => {
    (u.roles || []).forEach((r) => {
      acc[r.name] = (acc[r.name] || 0) + 1;
    });
    return acc;
  }, {});

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

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-primary/10 flex flex-col shrink-0">
          <Link to="/" className="p-6 flex items-center gap-3 border-b border-primary/5">
            <div className="size-10 bg-primary flex items-center justify-center rounded-lg text-white">
              <span className="material-symbols-outlined">account_balance</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-primary font-bold text-lg leading-tight">PARIVESH 3.0</h1>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Admin Portal</p>
            </div>
          </Link>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white transition-all" to="/admin/dashboard">
              <span className="material-symbols-outlined">group</span>
              <span className="font-medium">Users</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" to="/admin/stats">
              <span className="material-symbols-outlined">dashboard_customize</span>
              <span className="font-medium">Dashboard Stats</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" to="/pp/applications">
              <span className="material-symbols-outlined">description</span>
              <span className="font-medium">Applications</span>
            </Link>
            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" to="/admin/sidebar">
              <span className="material-symbols-outlined">public</span>
              <span className="font-medium">System View</span>
            </Link>
            <div className="pt-4 pb-2">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Configuration</p>
            </div>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" href="#">
              <span className="material-symbols-outlined">settings</span>
              <span className="font-medium">System Settings</span>
            </a>
            <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all" href="#">
              <span className="material-symbols-outlined">description</span>
              <span className="font-medium">Audit Logs</span>
            </a>
          </nav>
          <div className="p-4 border-t border-primary/5">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                {getInitials(user?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <button className="text-slate-400 hover:text-red-500 transition-colors" onClick={handleLogout} title="Logout">
                <span className="material-symbols-outlined text-xl">logout</span>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">Total Users</p>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Active</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{users.length}</p>
                  <p className="text-slate-400 text-sm">Registered</p>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">By Role</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.entries(roleCounts).map(([role, count]) => (
                    <span key={role} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${roleStyles[role] || 'bg-slate-100 text-slate-600'}`}>
                      {role}: {count}
                    </span>
                  ))}
                  {Object.keys(roleCounts).length === 0 && (
                    <span className="text-slate-400 text-sm">No users yet</span>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="text-slate-500 text-sm font-medium">Active Sessions</p>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{users.filter(u => u.is_active).length}</p>
                  <p className="text-slate-400 text-sm">Active accounts</p>
                </div>
              </div>
            </div>

            {/* User Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-primary/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">All Users</h3>
                <div className="relative w-full sm:w-80">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                  <input
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-slate-900 dark:text-slate-100"
                    placeholder="Search by name, email, or role..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[11px] font-bold tracking-widest">
                      <th className="px-6 py-4">User Details</th>
                      <th className="px-6 py-4">Assigned Roles</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {isLoading ? (
                      <tr>
                        <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan="5">
                          <div className="flex items-center justify-center gap-3">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            Loading users...
                          </div>
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td className="px-6 py-8 text-center text-sm text-slate-500" colSpan="5">
                          {searchQuery ? 'No users match your search.' : 'No users found.'}
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs uppercase">
                                {getInitials(u.full_name)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-slate-100">{u.full_name}</p>
                                <p className="text-xs text-slate-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {(u.roles || []).map((r) => (
                                <span
                                  key={r.id}
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${roleStyles[r.name] || 'bg-slate-100 text-slate-600'}`}
                                >
                                  {roleLabels[r.name] || r.name}
                                </span>
                              ))}
                              {(!u.roles || u.roles.length === 0) && (
                                <span className="text-xs text-slate-400">No roles</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`size-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(u.created_at)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                className="text-slate-400 hover:text-primary p-1 transition-colors"
                                title="Edit user"
                                onClick={() => handleOpenEditModal(u)}
                              >
                                <span className="material-symbols-outlined text-xl">edit</span>
                              </button>
                              <button
                                className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                title="Delete user"
                                onClick={() => handleDeleteUser(u)}
                              >
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-primary/5 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Showing {filteredUsers.length} of {users.length} users
                </p>
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
