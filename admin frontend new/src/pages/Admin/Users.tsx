import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  unlockUser,
  resetPassword,
  User,
  CreateUserData,
  UpdateUserData,
  ResetPasswordData,
} from '../../store/users/actions';
import { toast } from 'react-toastify';

const roleStyleMap: Record<User['role'], string> = {
  superadmin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  manager: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  staff: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200',
};

const Users: React.FC = () => {
  const dispatch = useDispatch();
  const { users, loading, error, total, page, pages } = useSelector((state: RootState) => state.users);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    isActive: true,
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      await dispatch(fetchUsers(currentPage, 10, searchTerm, statusFilter, roleFilter) as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      isActive: true,
    });
  };

  const handleOpenDetailsModal = (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const handleOpenResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
    setShowResetPasswordModal(true);
  };

  const handleCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setSelectedUser(null);
    setPasswordData({
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await dispatch(updateUser(editingUser._id, updateData) as any);
        toast.success('User updated successfully');
      } else {
        await dispatch(createUser(formData) as any);
        toast.success('User created successfully');
      }
      handleCloseModal();
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await dispatch(deleteUser(id) as any);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }
    try {
      await dispatch(toggleUserStatus(id) as any);
      toast.success(`User ${action}d successfully`);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} user`);
    }
  };

  const handleUnlock = async (id: string) => {
    if (!window.confirm('Are you sure you want to unlock this account? Login attempts will be reset.')) {
      return;
    }
    try {
      await dispatch(unlockUser(id) as any);
      toast.success('User account unlocked successfully');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlock user');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      const resetData: ResetPasswordData = {
        newPassword: passwordData.newPassword,
      };
      await dispatch(resetPassword(selectedUser!._id, resetData) as any);
      toast.success('Password reset successfully');
      handleCloseResetPasswordModal();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    }
  };

  const isUserLocked = (user: User) => {
    return user.isLocked || (user.lockUntil && new Date(user.lockUntil) > new Date());
  };

  const renderStatusBadge = (user: User) => {
    const locked = isUserLocked(user);
    if (user.isActive && !locked) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
    }
    if (user.isActive && locked) {
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
    }
    if (!user.isActive && locked) {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200';
    }
    return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200';
  };

  const summaryCards = useMemo(
    () => [
      { label: 'Total Users', value: total, icon: 'fas fa-users', accent: 'from-teal-500 to-emerald-500' },
      { label: 'Active', value: users.filter((u) => u.isActive).length, icon: 'fas fa-user-check', accent: 'from-blue-500 to-indigo-500' },
      { label: 'Locked', value: users.filter((u) => isUserLocked(u)).length, icon: 'fas fa-user-lock', accent: 'from-amber-500 to-orange-500' },
      { label: 'New This Page', value: users.length, icon: 'fas fa-user-plus', accent: 'from-violet-500 to-purple-500' },
    ],
    [total, users]
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition dark:border-slate-800/80 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-600 dark:text-teal-300">User Directory</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Users Management</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Maintain access controls, reset credentials, and oversee your organization&apos;s team activity.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500"
        >
          <i className="fas fa-user-plus mr-2"></i>
          Add User
        </button>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70"
          >
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${card.accent} opacity-30 blur-2xl`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
                <i className={`${card.icon}`}></i>
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 pl-11 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            />
            <i className="fas fa-search absolute left-4 top-2.5 text-slate-400 dark:text-slate-500"></i>
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusFilter}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
          <select
            value={roleFilter}
            onChange={handleRoleFilter}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="">All Roles</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="staff">Staff</option>
          </select>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span>Total Records</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{total}</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm transition hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80">
        {loading ? (
          <div className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            <p className="mt-3 text-sm">Loading users…</p>
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-rose-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 text-left uppercase tracking-wider text-xs font-semibold text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Security</th>
                    <th className="px-6 py-3">Last Login</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No users found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    users.map((userItem) => (
                      <tr key={userItem._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-200">
                              <i className="fas fa-user"></i>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">{userItem.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">ID: {userItem._id.slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{userItem.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${roleStyleMap[userItem.role]}`}>
                            <i className="fas fa-id-badge"></i>
                            {userItem.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${renderStatusBadge(userItem)}`}>
                              {userItem.isActive ? (isUserLocked(userItem) ? 'Active · Locked' : 'Active') : isUserLocked(userItem) ? 'Inactive · Locked' : 'Inactive'}
                            </span>
                            {currentUser?._id !== userItem._id && (
                              <button
                                onClick={() => handleToggleStatus(userItem._id, userItem.isActive)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                                  userItem.isActive
                                    ? 'border-teal-500 bg-teal-500/80'
                                    : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
                                }`}
                              >
                                <span
                                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                    userItem.isActive ? 'translate-x-[22px]' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-xs">
                            {isUserLocked(userItem) ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-200">
                                <i className="fas fa-lock"></i> Locked
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                                <i className="fas fa-unlock"></i> Secure
                              </span>
                            )}
                            {userItem.loginAttempts > 0 && (
                              <p className="text-slate-500 dark:text-slate-400">Attempts: {userItem.loginAttempts}</p>
                            )}
                            {currentUser?._id !== userItem._id && isUserLocked(userItem) && (
                              <button
                                onClick={() => handleUnlock(userItem._id)}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-500 dark:text-teal-300"
                              >
                                Unlock account
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {userItem.lastLogin ? new Date(userItem.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetailsModal(userItem)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleOpenModal(userItem)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleOpenResetPasswordModal(userItem)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-200"
                            >
                              Reset
                            </button>
                            {currentUser?._id !== userItem._id && (
                              <button
                                onClick={() => handleDelete(userItem._id)}
                                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-500 hover:text-rose-700 dark:border-slate-700 dark:hover:border-rose-400"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex flex-col gap-4 border-t border-slate-200/80 px-6 py-4 text-sm text-slate-600 dark:border-slate-800/70 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
                <p>
                  Showing{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{(currentPage - 1) * 10 + 1}</span>–
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{Math.min(currentPage * 10, total)}</span> of{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-teal-500 hover:text-teal-600 disabled:opacity-40 dark:border-slate-700 dark:hover:border-teal-400 dark:hover:text-teal-200"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(pages, 5))].map((_, index) => {
                    let pageNum;
                    if (pages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= pages - 2) {
                      pageNum = pages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                          currentPage === pageNum
                            ? 'border-teal-500 bg-teal-50 text-teal-600 dark:border-teal-400 dark:bg-teal-500/20 dark:text-teal-200'
                            : 'border-slate-200 text-slate-500 hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                    disabled={currentPage === pages}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-teal-500 hover:text-teal-600 disabled:opacity-40 dark:border-slate-700 dark:hover:border-teal-400 dark:hover:text-teal-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="no-scrollbar max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Active user
              </label>
              <div className="flex justify-end gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="no-scrollbar max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">User Details</h3>
              <button onClick={handleCloseDetailsModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</p>
                  <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${roleStyleMap[selectedUser.role]}`}>
                    <i className="fas fa-id-card"></i>
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                  <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${renderStatusBadge(selectedUser)}`}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-4 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                <p>
                  Last login:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : 'Never'}
                  </span>
                </p>
                <p className="mt-1">
                  Created:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex justify-end border-t border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
              <button
                onClick={handleCloseDetailsModal}
                className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Reset Password</h3>
              <button onClick={handleCloseResetPasswordModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4 px-6 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                User: <span className="text-slate-900 dark:text-slate-100">{selectedUser.name}</span>
              </p>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  minLength={6}
                />
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-800/70">
                <button
                  type="button"
                  onClick={handleCloseResetPasswordModal}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

