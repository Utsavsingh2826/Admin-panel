import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';

interface PriceItem {
  id: string;
  label: string;
  field: string;
  value: number | null;
  description: string;
  accent: string;
  icon: string;
  category: 'labour' | 'expense' | 'tax';
}

const Prices: React.FC = () => {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const priceConfig: Omit<PriceItem, 'id' | 'value'>[] = [
    {
      label: 'Gold Labour Cost',
      field: 'labourCostGold',
      description: 'Labour cost for gold items',
      accent: 'from-amber-50 to-amber-100 ring-amber-200',
      icon: 'fas fa-tools text-amber-500',
      category: 'labour',
    },
    {
      label: 'Silver Labour Cost',
      field: 'labourCostSilver',
      description: 'Labour cost for silver items',
      accent: 'from-gray-50 to-gray-100 ring-gray-200',
      icon: 'fas fa-tools text-gray-500',
      category: 'labour',
    },
    {
      label: 'Platinum Labour Cost',
      field: 'labourCostPlatinum',
      description: 'Labour cost for platinum items',
      accent: 'from-indigo-50 to-indigo-100 ring-indigo-200',
      icon: 'fas fa-tools text-indigo-500',
      category: 'labour',
    },
    {
      label: 'Titanium Labour Cost',
      field: 'labourCostTitanium',
      description: 'Labour cost for titanium items',
      accent: 'from-slate-50 to-slate-100 ring-slate-200',
      icon: 'fas fa-tools text-slate-500',
      category: 'labour',
    },
    {
      label: 'Gold Expense',
      field: 'goldExpense',
      description: 'Additional expense for gold',
      accent: 'from-yellow-50 to-yellow-100 ring-yellow-200',
      icon: 'fas fa-dollar-sign text-yellow-500',
      category: 'expense',
    },
    {
      label: 'Silver Expense',
      field: 'silverExpense',
      description: 'Additional expense for silver',
      accent: 'from-gray-50 to-gray-100 ring-gray-200',
      icon: 'fas fa-dollar-sign text-gray-500',
      category: 'expense',
    },
    {
      label: 'Platinum Expense',
      field: 'platinumExpense',
      description: 'Additional expense for platinum',
      accent: 'from-indigo-50 to-indigo-100 ring-indigo-200',
      icon: 'fas fa-dollar-sign text-indigo-500',
      category: 'expense',
    },
    {
      label: 'Titanium Expense',
      field: 'titaniumExpense',
      description: 'Additional expense for titanium',
      accent: 'from-slate-50 to-slate-100 ring-slate-200',
      icon: 'fas fa-dollar-sign text-slate-500',
      category: 'expense',
    },
    {
      label: 'GST Value',
      field: 'gstValue',
      description: 'GST percentage value',
      accent: 'from-teal-50 to-teal-100 ring-teal-200',
      icon: 'fas fa-percentage text-teal-500',
      category: 'tax',
    },
  ];

  const loadPrices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/default-values');
      const allDocuments = response.data.allDocuments || [];

      // Map all documents to find matching fields
      const priceItems: PriceItem[] = priceConfig.map((config) => {
        const doc = allDocuments.find((d: any) => d[config.field] !== undefined && d[config.field] !== null);
        return {
          id: doc?._id || '',
          ...config,
          value: doc?.[config.field] || null,
        };
      });

      setPrices(priceItems);
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Failed to load prices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const handleEdit = (item: PriceItem) => {
    setEditingId(item.id);
    setInputValue(item.value?.toString() ?? '0');
    setInputError('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setInputValue('');
    setInputError('');
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Value is required';
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 'Value must be a number';
    }
    if (parsed < 0) {
      return 'Value must be a non-negative number';
    }
    return '';
  };

  const handleSave = async (item: PriceItem) => {
    const validationMessage = validateValue(inputValue);
    if (validationMessage) {
      setInputError(validationMessage);
      return;
    }

    try {
      setUpdatingId(item.id);
      await api.patch(`/default-values/${item.id}`, {
        [item.field]: Number(inputValue),
      });

      toast.success(`${item.label} updated successfully`);
      handleCancel();
      await loadPrices();
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.message || 'Failed to update price');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatPrice = (value?: number | null) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  };

  const groupPricesByCategory = (items: PriceItem[]) => {
    const grouped: Record<string, PriceItem[]> = {
      labour: [],
      expense: [],
      tax: [],
    };

    items.forEach((item) => {
      grouped[item.category].push(item);
    });

    return grouped;
  };

  const categoryLabels: Record<string, string> = {
    labour: 'Labour Costs',
    expense: 'Expenses',
    tax: 'Tax & Fees',
  };

  const groupedPrices = groupPricesByCategory(prices);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 dark:bg-slate-900/70 dark:ring-slate-800/70"
        >
          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700" />
          <div className="mt-6 h-4 w-32 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="mt-3 h-6 w-20 rounded bg-gray-200 dark:bg-slate-700" />
          <div className="mt-6 h-10 rounded bg-gray-200 dark:bg-slate-700" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prices</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Manage labour costs, expenses, and tax values used in pricing calculations.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadPrices()}
            disabled={loading}
            className="flex items-center rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 dark:border-teal-500/60 dark:text-teal-200 dark:hover:bg-teal-500/20"
          >
            <i className="fas fa-sync mr-2"></i>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        renderSkeleton()
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedPrices).map(([category, items]) => {
            if (items.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {categoryLabels[category]}
                </h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const currentlyEditing = editingId === item.id;
                    const isSaving = updatingId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${item.accent} p-[1px] shadow-sm transition-shadow hover:shadow-lg dark:ring-1 dark:ring-slate-800/60`}
                      >
                        <div className="h-full rounded-2xl bg-white p-6 dark:bg-slate-900/80">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">
                                {item.description}
                              </p>
                              <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-800/80">
                              <i className={`${item.icon} text-xl`}></i>
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            {currentlyEditing ? (
                              <div>
                                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                                  New Value
                                </label>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">
                                      {item.category === 'tax' ? '%' : '₹'}
                                    </span>
                                    <input
                                      type="number"
                                      min={0}
                                      step="0.01"
                                      value={inputValue}
                                      onChange={(event) => {
                                        setInputValue(event.target.value);
                                        if (inputError) {
                                          setInputError('');
                                        }
                                      }}
                                      className={`w-full rounded-lg border px-8 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${
                                        inputError ? 'border-red-400 dark:border-red-400/70' : 'border-gray-200'
                                      }`}
                                    />
                                  </div>
                                </div>
                                {inputError && <p className="mt-2 text-xs text-red-500 dark:text-red-300">{inputError}</p>}
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Current Value</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {item.category === 'tax' ? `${formatPrice(item.value)}%` : `₹${formatPrice(item.value)}`}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex items-center justify-between">
                            {currentlyEditing ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={handleCancel}
                                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/70"
                                  disabled={isSaving}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSave(item)}
                                  disabled={isSaving}
                                  className="flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:hover:bg-teal-500"
                                >
                                  {isSaving ? (
                                    <>
                                      <i className="fas fa-circle-notch mr-2 animate-spin"></i>
                                      Saving…
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-save mr-2"></i>
                                      Save
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleEdit(item)}
                                className="flex items-center rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50 dark:border-teal-500/60 dark:text-teal-200 dark:hover:bg-teal-500/20"
                              >
                                <i className="fas fa-edit mr-2"></i>
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Prices;

