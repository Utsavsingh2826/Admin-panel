import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
}

const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d' | 'fy'>('30d');
  const [stats] = useState({
    totalProducts: 474196,
    totalOrders: 1247,
    totalCustomers: 892,
    totalRevenue: 2456789,
    lowStockItems: 23,
    pendingOrders: 45,
    avgOrderValue: 19870,
  });

  const [recentOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Gold Ring · 18kt',
      amount: 25000,
      status: 'pending',
      date: '2024-01-15',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Diamond Earrings · VVS1',
      amount: 45000,
      status: 'completed',
      date: '2024-01-14',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      product: 'Silver Bracelet',
      amount: 15000,
      status: 'processing',
      date: '2024-01-13',
    },
  ]);

  const [lowStockProducts] = useState<LowStockProduct[]>([
    {
      id: 'BR1-RD-1-18-LGEFVVS-6',
      name: 'Gold Bracelet · 18kt',
      category: 'Bracelets',
      stock: 2,
      threshold: 5,
    },
    {
      id: 'ER1-18-LGEFVVS',
      name: 'Diamond Earrings · 18kt',
      category: 'Earrings',
      stock: 1,
      threshold: 10,
    },
    {
      id: 'ENG1-CUS-30-18-LGEFVVS',
      name: 'Engagement Ring · Cushion',
      category: 'Rings',
      stock: 3,
      threshold: 8,
    },
  ]);

  const getStatusStyles = (status: string) => {
    const styleMap: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
      processing: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
      cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
    };
    return styleMap[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const greeting = useMemo(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const timeframeOptions = [
    { id: 'today', label: 'Today' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: 'fy', label: 'FY 24-25' },
  ] as const;

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      delta: '+4.2% WoW',
      icon: 'fas fa-circle-dollar-to-slot',
      accent: 'from-teal-500 to-emerald-500',
    },
    {
      label: 'Total Orders',
      value: formatNumber(stats.totalOrders),
      delta: '+12 new today',
      icon: 'fas fa-receipt',
      accent: 'from-indigo-500 to-blue-500',
    },
    {
      label: 'Active Customers',
      value: formatNumber(stats.totalCustomers),
      delta: '+3.8% retention',
      icon: 'fas fa-user-group',
      accent: 'from-purple-500 to-fuchsia-500',
    },
    {
      label: 'Avg. Order Value',
      value: formatCurrency(stats.avgOrderValue),
      delta: '+₹550 vs last week',
      icon: 'fas fa-gem',
      accent: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-500 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-100/80">Jewellery Intelligence</p>
            <h1 className="text-3xl font-semibold md:text-4xl">
              {greeting}, {user?.name || 'Admin'}
            </h1>
            <p className="max-w-2xl text-sm text-teal-100/90">
              Monitor operational health, inventory trends, and customer engagement with curated insights built for premium jewelry operations.
            </p>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-wide text-teal-100/80">System Status</p>
            <div className="mt-2 flex items-baseline gap-3 text-2xl font-semibold">
              ₹{formatNumber(stats.totalRevenue)}
              <span className="text-sm text-teal-100/80">in managed assets</span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-teal-100/70">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
              All integrations operational
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-teal-100/80">
          {timeframeOptions.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTimeframe(id)}
              className={`rounded-full px-4 py-1.5 transition ${
                timeframe === id
                  ? 'bg-white/90 text-teal-700 shadow-sm'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <div
            key={card.label}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70"
          >
            <div className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${card.accent} opacity-30 blur-2xl transition group-hover:opacity-40`} />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
                <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">{card.delta}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800/70 dark:text-slate-200">
                <i className={`${card.icon} text-lg`}></i>
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Alerts & Highlights */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-amber-200/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-amber-500/30 dark:bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-300">Inventory alert</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stats.lowStockItems} SKUs below threshold</h2>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
              <i className="fas fa-exclamation-triangle"></i>
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-xl border border-slate-200/60 px-4 py-3 transition hover:border-teal-500/40 dark:border-slate-800/70 dark:hover:border-teal-500/30">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{product.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                </div>
                <div className="text-right">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${product.stock <= 2 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200'}`}>
                    {product.stock} in stock
                  </span>
                  <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">Target ≥ {product.threshold}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-600 dark:bg-amber-400 dark:hover:bg-amber-300 dark:text-slate-900">
            Review replenishment plan
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-300">Order operations</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stats.pendingOrders} orders pending action</h2>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-200">
              <i className="fas fa-clock"></i>
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-xl border border-slate-200/60 px-4 py-3 transition hover:border-teal-500/40 dark:border-slate-800/70 dark:hover:border-teal-500/30">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{order.customer}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{order.product}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.amount)}</p>
                  <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusStyles(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 dark:bg-sky-400 dark:hover:bg-sky-300 dark:text-slate-900">
            View fulfillment queue
          </button>
        </div>
      </section>

      {/* Recent Orders Table */}
      <section className="rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm transition hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/70">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/70">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sales pipeline</p>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Orders</h2>
          </div>
          <button className="rounded-full border border-slate-200/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200">
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-900/90 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3">Order</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {recentOrders.map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{order.id}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{order.product}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(order.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-teal-400 dark:hover:text-teal-200">
                        View
                      </button>
                      <button className="rounded-full border border-slate-200/70 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-amber-500 hover:text-amber-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-200">
                        Hold
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
