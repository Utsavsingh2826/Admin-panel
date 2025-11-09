import React, { useState } from 'react';
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
  const [stats] = useState({
    totalProducts: 474196,
    totalOrders: 1247,
    totalCustomers: 892,
    totalRevenue: 2456789,
    lowStockItems: 23,
    pendingOrders: 45
  });

  const [recentOrders] = useState<Order[]>([
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Gold Ring - 18kt',
      amount: 25000,
      status: 'pending',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Diamond Earrings',
      amount: 45000,
      status: 'completed',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      product: 'Silver Bracelet',
      amount: 15000,
      status: 'processing',
      date: '2024-01-13'
    }
  ]);

  const [lowStockProducts] = useState<LowStockProduct[]>([
    {
      id: 'BR1-RD-1-18-LGEFVVS-6',
      name: 'Gold Bracelet - 18kt',
      category: 'Bracelets',
      stock: 2,
      threshold: 5
    },
    {
      id: 'ER1-18-LGEFVVS',
      name: 'Diamond Earrings - 18kt',
      category: 'Earrings',
      stock: 1,
      threshold: 10
    },
    {
      id: 'ENG1-CUS-30-18-LGEFVVS',
      name: 'Engagement Ring - Cushion',
      category: 'Rings',
      stock: 3,
      threshold: 8
    }
  ]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return badges[status] || 'bg-gray-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-1">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your jewelry business today.
            </p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.totalProducts)}</h3>
              <p className="text-teal-100">Total Products</p>
            </div>
            <i className="fas fa-gem text-5xl opacity-30"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.totalOrders)}</h3>
              <p className="text-green-100">Total Orders</p>
            </div>
            <i className="fas fa-shopping-cart text-5xl opacity-30"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.totalCustomers)}</h3>
              <p className="text-blue-100">Total Customers</p>
            </div>
            <i className="fas fa-users text-5xl opacity-30"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="text-yellow-100">Total Revenue</p>
            </div>
            <i className="fas fa-rupee-sign text-5xl opacity-30"></i>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-yellow-200 shadow-sm">
          <div className="bg-yellow-500 text-white px-6 py-4 rounded-t-lg">
            <h5 className="font-semibold mb-0">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Low Stock Alert
            </h5>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {stats.lowStockItems} products are running low on stock
            </p>
            <div className="space-y-3 mb-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-semibold text-gray-800">{product.name}</div>
                    <small className="text-gray-500">{product.category}</small>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                    product.stock <= 2 ? 'bg-red-500' : 'bg-yellow-500'
                  }`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              View All Low Stock Items
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-blue-200 shadow-sm">
          <div className="bg-blue-500 text-white px-6 py-4 rounded-t-lg">
            <h5 className="font-semibold mb-0">
              <i className="fas fa-clock mr-2"></i>
              Pending Orders
            </h5>
          </div>
          <div className="p-6">
            <p className="text-gray-600 mb-4">
              {stats.pendingOrders} orders are pending processing
            </p>
            <div className="space-y-3 mb-4">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="font-semibold text-gray-800">{order.customer}</div>
                    <small className="text-gray-500">{order.product}</small>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{formatCurrency(order.amount)}</div>
                    <span className={`${getStatusBadge(order.status)} text-white px-2 py-1 rounded-full text-xs`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
              View All Pending Orders
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h5 className="font-semibold text-gray-800 mb-0">
            <i className="fas fa-shopping-cart mr-2 text-teal-600"></i>
            Recent Orders
          </h5>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-800">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-700">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <i className="fas fa-gem text-teal-600 mr-2"></i>
                      <span className="text-gray-700">{order.product}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-800">{formatCurrency(order.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`${getStatusBadge(order.status)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-teal-600 hover:text-teal-700 focus:outline-none">
                      <i className="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
