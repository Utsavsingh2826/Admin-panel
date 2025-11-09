import React, { useState, useEffect } from 'react';
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (user: User) => {
    const locked = isUserLocked(user);
    if (user.isActive && !locked) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>;
    } else if (user.isActive && locked) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Active (Locked)</span>;
    } else if (!user.isActive && locked) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Inactive (Locked)</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Inactive</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        <button
          onClick={() => handleOpenModal()}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
        </div>
        <select
          value={statusFilter}
          onChange={handleStatusFilter}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </select>
        <select
          value={roleFilter}
          onChange={handleRoleFilter}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="">All Roles</option>
          <option value="superadmin">Superadmin</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <div className="flex items-center text-sm text-gray-600">
          Total: <span className="font-semibold ml-1">{total}</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Security
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                                <i className="fas fa-user text-teal-600"></i>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(user)}
                            {currentUser?._id !== user._id && (
                              <button
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                                  user.isActive ? 'bg-teal-600' : 'bg-gray-200'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    user.isActive ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {isUserLocked(user) ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-red-600">
                                  <i className="fas fa-lock mr-1"></i>Locked
                                </span>
                                {currentUser?._id !== user._id && (
                                  <button
                                    onClick={() => handleUnlock(user._id)}
                                    className="text-teal-600 hover:text-teal-800 text-xs"
                                  >
                                    Unlock
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-green-600">
                                <i className="fas fa-unlock mr-1"></i>Unlocked
                              </span>
                            )}
                            {user.loginAttempts > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Attempts: {user.loginAttempts}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenDetailsModal(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => handleOpenModal(user)}
                              className="text-teal-600 hover:text-teal-900"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => handleOpenResetPasswordModal(user)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Reset Password"
                            >
                              <i className="fas fa-key"></i>
                            </button>
                            {currentUser?._id !== user._id && (
                              <button
                                onClick={() => handleDelete(user._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                              >
                                <i className="fas fa-trash"></i>
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

            {/* Pagination */}
            {pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                    disabled={currentPage === pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(currentPage * 10, total)}</span> of{' '}
                      <span className="font-medium">{total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-left"></i>
                      </button>
                      {[...Array(Math.min(pages, 5))].map((_, i) => {
                        let pageNum;
                        if (pages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pages - 2) {
                          pageNum = pages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-teal-50 border-teal-500 text-teal-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                        disabled={currentPage === pages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <i className="fas fa-chevron-right"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {editingUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">User Details</h3>
              <button
                onClick={handleCloseDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900 mt-1">{selectedUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900 mt-1">{selectedUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">{getStatusBadge(selectedUser)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Security Status</label>
                <p className="mt-1">
                  {isUserLocked(selectedUser) ? (
                    <span className="text-red-600">
                      <i className="fas fa-lock mr-1"></i>Locked
                      {selectedUser.lockUntil && (
                        <span className="text-xs text-gray-500 ml-2">
                          Until: {new Date(selectedUser.lockUntil).toLocaleString()}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-green-600">
                      <i className="fas fa-unlock mr-1"></i>Unlocked
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">Login Attempts: {selectedUser.loginAttempts || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Login</label>
                <p className="text-gray-900 mt-1">
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Account Created</label>
                <p className="text-gray-900 mt-1">
                  {selectedUser.createdAt
                    ? new Date(selectedUser.createdAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleCloseDetailsModal}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Reset Password</h3>
              <button
                onClick={handleCloseResetPasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User: {selectedUser.name} ({selectedUser.email})
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  minLength={6}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  minLength={6}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseResetPasswordModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Reset Password
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

