import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchMetalPrices,
  updateMetalPrice,
  clearMetalPriceErrors,
  MetalKey,
} from '../../store/metalPrices/actions';
import { toast } from 'react-toastify';

interface MetalConfigItem {
  key: MetalKey;
  label: string;
  description: string;
  accent: string;
  icon: string;
}

const MetalPrices: React.FC = () => {
  const dispatch = useDispatch();
  const { metals, loading, updatingKey, error } = useSelector((state: RootState) => state.metalPrices);
  const [editingKey, setEditingKey] = useState<MetalKey | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [inputError, setInputError] = useState<string>('');

  const metalConfig = useMemo<MetalConfigItem[]>(
    () => [
      {
        key: 'gold',
        label: 'Gold (24K)',
        description: 'Per gram valuation for 24 karat gold.',
        accent: 'from-amber-50 to-amber-100 ring-amber-200',
        icon: 'fas fa-coins text-amber-500',
      },
      {
        key: 'silver',
        label: 'Silver',
        description: 'Standard bullion silver rate per gram.',
        accent: 'from-gray-50 to-gray-100 ring-gray-200',
        icon: 'fas fa-gem text-gray-500',
      },
      {
        key: 'platinum',
        label: 'Platinum',
        description: 'Latest platinum price per gram.',
        accent: 'from-indigo-50 to-indigo-100 ring-indigo-200',
        icon: 'fas fa-ring text-indigo-500',
      },
      {
        key: 'titanium',
        label: 'Titanium',
        description: 'High-grade titanium per gram value.',
        accent: 'from-slate-50 to-slate-100 ring-slate-200',
        icon: 'fas fa-industry text-slate-500',
      },
    ],
    []
  );

  const loadMetalPrices = async (showToast = false) => {
    try {
      const result = await dispatch(fetchMetalPrices() as any);
      console.log('Metal Prices loaded:', result);
      console.log('Current metals state:', metals);
      if (showToast) {
        toast.success('Metal prices refreshed');
      }
    } catch (err: any) {
      console.error('Error loading metal prices:', err);
      toast.error(err.message || 'Failed to load metal prices');
    }
  };

  useEffect(() => {
    loadMetalPrices();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMetalPriceErrors());
    }
  }, [error, dispatch]);

  const handleEdit = (key: MetalKey) => {
    const metal = metals[key];
    setEditingKey(key);
    setInputValue(metal?.value?.toString() ?? '0');
    setInputError('');
  };

  const handleCancel = () => {
    setEditingKey(null);
    setInputValue('');
    setInputError('');
  };

  const validateValue = (value: string) => {
    if (!value.trim()) {
      return 'Price is required';
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 'Price must be a number';
    }
    if (parsed < 0) {
      return 'Price must be a non-negative value';
    }
    return '';
  };

  const handleSave = async () => {
    if (!editingKey) return;

    const validationMessage = validateValue(inputValue);
    if (validationMessage) {
      setInputError(validationMessage);
      return;
    }

    const metal = metals[editingKey];
    if (!metal) {
      toast.error('Metal entry not found');
      return;
    }

    try {
      await dispatch(updateMetalPrice(editingKey, metal._id, Number(inputValue)) as any);
      toast.success(`${metalConfig.find((item) => item.key === editingKey)?.label || 'Metal'} price updated`);
      handleCancel();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update metal price');
    }
  };

  const isSaving = (key: MetalKey) => updatingKey === key;

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
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

  const formatPrice = (value?: number | null) => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString('en-IN', {
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Metal Prices</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Manage trading prices used across inventory valuations and pricing models.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => loadMetalPrices(true)}
            disabled={loading}
            className="flex items-center rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 dark:border-teal-500/60 dark:text-teal-200 dark:hover:bg-teal-500/20"
          >
            <i className="fas fa-sync mr-2"></i>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading && !editingKey ? (
        renderSkeleton()
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {metalConfig.map((metal) => {
            const metalData = metals[metal.key];
            const currentlyEditing = editingKey === metal.key;

            return (
              <div
                key={metal.key}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${metal.accent} p-[1px] shadow-sm transition-shadow hover:shadow-lg dark:ring-1 dark:ring-slate-800/60`}
              >
                <div className="h-full rounded-2xl bg-white p-6 dark:bg-slate-900/80">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">{metal.description}</p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{metal.label}</h3>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-inner dark:bg-slate-800/80">
                      <i className={`${metal.icon} text-xl`}></i>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {currentlyEditing ? (
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          New Price (per gram)
                        </label>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">₹</span>
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
                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Current Price</p>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">₹{formatPrice(metalData?.value)}</span>
                          <span className="text-xs font-medium text-gray-400 dark:text-slate-500">per gram</span>
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
                          disabled={isSaving(metal.key)}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving(metal.key)}
                          className="flex items-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:hover:bg-teal-500"
                        >
                          {isSaving(metal.key) ? (
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
                        onClick={() => handleEdit(metal.key)}
                        className="flex items-center rounded-lg border border-teal-600 px-4 py-2 text-sm font-semibold text-teal-600 transition-colors hover:bg-teal-50 dark:border-teal-500/60 dark:text-teal-200 dark:hover:bg-teal-500/20"
                      >
                        <i className="fas fa-edit mr-2"></i>
                        Edit Price
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MetalPrices;

