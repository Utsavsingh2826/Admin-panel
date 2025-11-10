import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoCodeStatus,
  PromoCode,
  CreatePromoCodeData,
  UpdatePromoCodeData,
} from '../../store/promocodes/actions';
import { toast } from 'react-toastify';

const PromoCodes: React.FC = () => {
  const dispatch = useDispatch();
  const { promoCodes, loading, error, total, page, pages } = useSelector((state: RootState) => state.promoCodes);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: '',
    discountPercent: 0,
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadPromoCodes();
  }, [currentPage, searchTerm, statusFilter]);

  const loadPromoCodes = async () => {
    try {
      await dispatch(fetchPromoCodes(currentPage, 10, searchTerm, statusFilter) as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load promo codes');
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

  const handleOpenModal = (promoCode?: PromoCode) => {
    if (promoCode) {
      setEditingPromoCode(promoCode);
      setFormData({
        code: promoCode.code,
        discountPercent: promoCode.discountPercent,
        description: promoCode.description || '',
        isActive: promoCode.isActive,
      });
    } else {
      setEditingPromoCode(null);
      setFormData({
        code: '',
        discountPercent: 0,
        description: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromoCode(null);
    setFormData({
      code: '',
      discountPercent: 0,
      description: '',
      isActive: true,
    });
  };

  const handleOpenDetailsModal = (promoCode: PromoCode) => {
    setSelectedPromoCode(promoCode);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPromoCode(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPromoCode) {
        const updateData: UpdatePromoCodeData = {
          discountPercent: formData.discountPercent,
          description: formData.description,
          isActive: formData.isActive,
        };
        await dispatch(updatePromoCode(editingPromoCode._id, updateData) as any);
        toast.success('Promo code updated successfully');
      } else {
        await dispatch(createPromoCode(formData) as any);
        toast.success('Promo code created successfully');
      }
      handleCloseModal();
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code?')) {
      return;
    }
    try {
      await dispatch(deletePromoCode(id) as any);
      toast.success('Promo code deleted successfully');
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete promo code');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this promo code?`)) {
      return;
    }
    try {
      await dispatch(togglePromoCodeStatus(id) as any);
      toast.success(`Promo code ${action}d successfully`);
      loadPromoCodes();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} promo code`);
    }
  };

  const activeCount = useMemo(() => promoCodes.filter((promo) => promo.isActive).length, [promoCodes]);
  const inactiveCount = useMemo(() => promoCodes.filter((promo) => !promo.isActive).length, [promoCodes]);

  const summaryCards = [
    { label: 'Total Codes', value: total, icon: 'fas fa-ticket', accent: 'from-teal-500 to-emerald-500' },
    { label: 'Active', value: activeCount, icon: 'fas fa-bolt', accent: 'from-emerald-500 to-teal-500' },
    { label: 'Inactive', value: inactiveCount, icon: 'fas fa-power-off', accent: 'from-slate-500 to-slate-700' },
    { label: 'Average Discount', value: promoCodes.length ? `${Math.round(promoCodes.reduce((sum, promo) => sum + promo.discountPercent, 0) / promoCodes.length)}%` : '—', icon: 'fas fa-percent', accent: 'from-amber-500 to-orange-500' },
  ];

  const statusBadge = (isActive: boolean) =>
    isActive
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200'
      : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-200';

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition dark:border-slate-800/80 dark:bg-slate-900/80 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-teal-600 dark:text-teal-300">Marketing Engine</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Promo Codes</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Govern campaign incentives and seasonal offers that drive acquisition and retention.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Promo Code
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by code"
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
          </select>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
            <span>Total Codes</span>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">{total}</span>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm transition hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80">
        {loading ? (
          <div className="px-6 py-16 text-center text-slate-500 dark:text-slate-400">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></div>
            <p className="mt-3 text-sm">Loading promo codes…</p>
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center text-rose-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto no-scrollbar">
              <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Discount</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Created By</th>
                    <th className="px-6 py-3">Created At</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {promoCodes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No promo codes found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    promoCodes.map((promoCode) => (
                      <tr key={promoCode._id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                        <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{promoCode.code}</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{promoCode.discountPercent}%</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {promoCode.description ? promoCode.description : <span className="text-slate-400 dark:text-slate-500">Not provided</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(promoCode.isActive)}`}>
                              {promoCode.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              onClick={() => handleToggleStatus(promoCode._id, promoCode.isActive)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full border transition ${
                                promoCode.isActive
                                  ? 'border-teal-500 bg-teal-500/80'
                                  : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                                  promoCode.isActive ? 'translate-x-[22px]' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{promoCode.createdBy?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                          {promoCode.createdAt ? new Date(promoCode.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleOpenDetailsModal(promoCode)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleOpenModal(promoCode)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-500 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(promoCode._id)}
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-500 hover:text-rose-700 dark:border-slate-700 dark:hover:border-rose-400"
                            >
                              Delete
                            </button>
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
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingPromoCode ? 'Edit Promo Code' : 'Create New Promo Code'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Code</label>
                <input
                  type="text"
                  required
                  disabled={!!editingPromoCode}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:disabled:bg-slate-800"
                  placeholder="SUMMER2024"
                  pattern="[A-Z0-9]+"
                  minLength={3}
                  maxLength={20}
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Uppercase letters and numbers only</p>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Discount Percent</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  maxLength={500}
                />
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-teal-500 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400">
                <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                Active promo code
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
                  {editingPromoCode ? 'Update Promo Code' : 'Create Promo Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedPromoCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur">
          <div className="no-scrollbar max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/95 shadow-xl dark:border-slate-700 dark:bg-slate-900/95">
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4 dark:border-slate-800/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Promo Code Details</h3>
              <button onClick={handleCloseDetailsModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4 px-6 py-5 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Code</p>
                  <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{selectedPromoCode.code}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Discount</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{selectedPromoCode.discountPercent}%</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">{selectedPromoCode.description || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                  <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(selectedPromoCode.isActive)}`}>
                    {selectedPromoCode.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Created By</p>
                  <p className="mt-1 text-slate-700 dark:text-slate-300">
                    {selectedPromoCode.createdBy?.name || 'N/A'} ({selectedPromoCode.createdBy?.email || 'N/A'})
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/70 p-4 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-300">
                <p>
                  Created:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedPromoCode.createdAt ? new Date(selectedPromoCode.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </p>
                <p className="mt-1">
                  Updated:{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {selectedPromoCode.updatedAt ? new Date(selectedPromoCode.updatedAt).toLocaleString() : 'N/A'}
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
    </div>
  );
};

export default PromoCodes;

