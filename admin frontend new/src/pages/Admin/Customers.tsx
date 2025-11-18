import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchCustomers,
  toggleCustomerStatus,
  Customer,
  clearCustomerErrors,
} from '../../store/customers/actions';
import { toast } from 'react-toastify';

const Customers: React.FC = () => {
  const dispatch = useDispatch();
  const { customers, loading, error, total, page, pages } = useSelector((state: RootState) => state.customers);
  const { user } = useSelector((state: RootState) => state.auth);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const canManageCustomers = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadCustomers();
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCustomerErrors());
    }
  }, [error, dispatch]);

  const loadCustomers = async () => {
    try {
      await dispatch(fetchCustomers(currentPage, 20, searchTerm, statusFilter) as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customers');
    }
  };

  const toggleCustomerDetails = (customerId: string) => {
    const newExpanded = new Set(expandedCustomers);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedCustomers(newExpanded);
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedCustomer(null);
  };

  const handleToggleStatus = async (customer: Customer) => {
    if (!window.confirm(`Are you sure you want to ${customer.isActive ? 'deactivate' : 'activate'} this customer?`)) {
      return;
    }

    try {
      await dispatch(toggleCustomerStatus(customer._id) as any);
      toast.success(`Customer ${customer.isActive ? 'deactivated' : 'activated'} successfully`);
      await loadCustomers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle customer status');
    }
  };

  const formatDate = (date: string | number | Date | null | undefined): string => {
    if (!date) return 'N/A';
    try {
      const dateObj = typeof date === 'number' ? new Date(date) : new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
      : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200';
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
            Manage your customer database ({total} total customers)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name, email, or phone..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <i className="fas fa-circle-notch fa-spin text-3xl text-teal-600"></i>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 p-12 text-center">
          <i className="fas fa-users text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-slate-400">No customers found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-800">
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Customer
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Contact
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Orders
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Status
                  </th>
                  <th className="w-[10%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Referral
                  </th>
                  <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Last Login
                  </th>
                  <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                {customers.map((customer) => {
                  const isExpanded = expandedCustomers.has(customer._id);
                  const displayName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || customer.email;
                  
                  return (
                    <React.Fragment key={customer._id}>
                      <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleCustomerDetails(customer._id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                            </button>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {displayName}
                              </div>
                              {customer.email && (
                                <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
                                  {customer.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {customer.phone ? (
                            <div className="text-sm text-gray-900 dark:text-white">{customer.phone}</div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {customer.orders?.length || 0}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(customer.isActive)}`}
                          >
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {customer.isVerified && (
                            <div className="mt-1">
                              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                                <i className="fas fa-check-circle mr-1"></i>Verified
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {customer.referralCode ? (
                            <div className="text-xs">
                              <div className="text-gray-900 dark:text-white font-mono">
                                {customer.referralCode}
                              </div>
                              {customer.referralCount ? (
                                <div className="text-gray-500 dark:text-slate-400">
                                  {customer.referralCount} referrals
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {formatDate(customer.lastLogin)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewDetails(customer)}
                              className="px-3 py-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition-colors"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {canManageCustomers && (
                              <button
                                onClick={() => handleToggleStatus(customer)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                                  customer.isActive
                                    ? 'text-amber-600 hover:text-amber-700 dark:text-amber-400'
                                    : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                                }`}
                                title={customer.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`fas fa-${customer.isActive ? 'ban' : 'check'}`}></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50 dark:bg-slate-800/30">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Customer Information
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Name: </span>
                                    <span className="text-gray-900 dark:text-white">{displayName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Email: </span>
                                    <span className="text-gray-900 dark:text-white">{customer.email}</span>
                                  </div>
                                  {customer.phone && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Phone: </span>
                                      <span className="text-gray-900 dark:text-white">{customer.phone}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Status: </span>
                                    <span className={customer.isActive ? 'text-emerald-600' : 'text-gray-600'}>
                                      {customer.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Verified: </span>
                                    <span className={customer.isVerified ? 'text-emerald-600' : 'text-gray-600'}>
                                      {customer.isVerified ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Orders & Activity
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Total Orders: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {customer.orders?.length || 0}
                                    </span>
                                  </div>
                                  {customer.availableOffers !== undefined && customer.availableOffers > 0 && (
                                    <div>
                                      <span className="text-gray-500 dark:text-slate-400">Available Offers: </span>
                                      <span className="text-gray-900 dark:text-white">
                                        {customer.availableOffers}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Last Login: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {formatDate(customer.lastLogin)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 dark:text-slate-400">Member Since: </span>
                                    <span className="text-gray-900 dark:text-white">
                                      {formatDate(customer.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                  Referral Program
                                </h4>
                                <div className="space-y-1 text-xs">
                                  {customer.referralCode ? (
                                    <>
                                      <div>
                                        <span className="text-gray-500 dark:text-slate-400">Referral Code: </span>
                                        <span className="text-gray-900 dark:text-white font-mono">
                                          {customer.referralCode}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500 dark:text-slate-400">Referrals: </span>
                                        <span className="text-gray-900 dark:text-white">
                                          {customer.referralCount || 0}
                                        </span>
                                      </div>
                                      {customer.totalReferralEarnings !== undefined && customer.totalReferralEarnings > 0 && (
                                        <div>
                                          <span className="text-gray-500 dark:text-slate-400">Total Earnings: </span>
                                          <span className="text-gray-900 dark:text-white">
                                            {formatCurrency(customer.totalReferralEarnings)}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">No referral code</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-slate-300">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, total)} of {total} customers
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(pages, prev + 1))}
                  disabled={currentPage === pages}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Customer Details: {selectedCustomer.name || selectedCustomer.email}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Name: </span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedCustomer.name || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Email: </span>
                    <span className="text-gray-900 dark:text-white">{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Phone: </span>
                      <span className="text-gray-900 dark:text-white">{selectedCustomer.phone}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Status: </span>
                    <span className={selectedCustomer.isActive ? 'text-emerald-600' : 'text-gray-600'}>
                      {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Verified: </span>
                    <span className={selectedCustomer.isVerified ? 'text-emerald-600' : 'text-gray-600'}>
                      {selectedCustomer.isVerified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-slate-400">Member Since: </span>
                    <span className="text-gray-900 dark:text-white">{formatDate(selectedCustomer.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                    Recent Orders ({selectedCustomer.orders.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedCustomer.orders.slice(0, 5).map((order: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-900 dark:text-white font-semibold">
                            {order.orderNumber || order._id}
                          </span>
                          <span className="text-gray-500 dark:text-slate-400">
                            {order.totalAmount ? formatCurrency(order.totalAmount) : 'N/A'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                          Status: {order.orderStatus || 'N/A'} | {formatDate(order.orderedAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Referral Info */}
              {selectedCustomer.referralCode && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">Referral Program</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Referral Code: </span>
                      <span className="text-gray-900 dark:text-white font-mono">{selectedCustomer.referralCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-slate-400">Total Referrals: </span>
                      <span className="text-gray-900 dark:text-white">{selectedCustomer.referralCount || 0}</span>
                    </div>
                    {selectedCustomer.totalReferralEarnings !== undefined && selectedCustomer.totalReferralEarnings > 0 && (
                      <div>
                        <span className="text-gray-500 dark:text-slate-400">Total Earnings: </span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(selectedCustomer.totalReferralEarnings)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
