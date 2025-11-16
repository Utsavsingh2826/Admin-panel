import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchOrders,
  updateOrderStatus,
  createShipment,
  Order,
  clearOrderErrors,
} from '../../store/orders/actions';
import { toast } from 'react-toastify';

const Orders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders, loading, error, updatingStatusId, creatingShipmentId } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');

  const canManageOrders = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderErrors());
    }
  }, [error, dispatch]);

  const loadOrders = async () => {
    try {
      await dispatch(fetchOrders() as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load orders');
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedOrder(null);
  };

  const handleUpdateStatus = (order: Order) => {
    setStatusOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setShowStatusModal(true);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!statusOrder) return;

    try {
      await dispatch(updateOrderStatus(statusOrder._id, newStatus, statusNote) as any);
      toast.success(`Order status updated to ${newStatus.replace('_', ' ')}`);
      setShowStatusModal(false);
      setStatusOrder(null);
      setNewStatus('');
      setStatusNote('');
      await loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleCreateShipment = async (order: Order) => {
    if (!window.confirm(`Create shipment for order ${order.number}? This will schedule pickup for tomorrow at 4 PM.`)) {
      return;
    }

    try {
      const response = await dispatch(createShipment(order._id) as any);
      toast.success(`Shipment created successfully! Docket Number: ${response.data.shipment.docketNumber}`);
      await loadOrders();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create shipment');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
      case 'confirmed':
      case 'in_production':
      case 'ready_for_dispatch':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200';
      case 'shipped':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200';
      case 'cancelled':
      case 'refunded':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
      case 'authorized':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
      case 'failed':
      case 'refunded':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200';
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in_production', label: 'In Production' },
    { value: 'ready_for_dispatch', label: 'Ready for Dispatch' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            View and manage all customer orders
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-teal-600 px-4 py-2 font-semibold text-teal-600 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 dark:border-teal-500/60 dark:text-teal-200 dark:hover:bg-teal-500/20"
        >
          <i className={`fas fa-sync ${loading ? 'animate-spin' : ''}`}></i>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-slate-900/70">
          <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-slate-400">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Order Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Customer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Items
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Payment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {orders.map((order) => {
                const isExpanded = expandedOrders.has(order._id);
                return (
                  <React.Fragment key={order._id}>
                    <tr
                      className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOrderDetails(order._id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-sm`}></i>
                          </button>
                          <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              {order.number}
                            </div>
                            {order.orderType === 'customized' && (
                              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                                Customized
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {order.customer.email}
                        </div>
                        {order.customer.phone && (
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {order.customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">
                          {order.items[0]?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount || order.pricing?.total || 0)}
                        </div>
                        {order.pricing?.discount && order.pricing.discount > 0 && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400">
                            Discount: {formatCurrency(order.pricing.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(order.status)}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatusColor(order.payment?.status || order.paymentStatus || 'pending')}`}
                        >
                          {order.payment?.status || order.paymentStatus || 'pending'}
                        </span>
                        {order.payment?.transactionId && (
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            {order.payment.transactionId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(order.orderedAt)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <i className="fas fa-eye mr-1"></i>
                            View
                          </button>
                          {canManageOrders && (
                            <>
                              {!order.shipping?.trackingNumber && (
                                <button
                                  onClick={() => handleCreateShipment(order)}
                                  disabled={creatingShipmentId === order._id}
                                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600"
                                >
                                  {creatingShipmentId === order._id ? (
                                    <>
                                      <i className="fas fa-circle-notch mr-1 animate-spin"></i>
                                      Creating...
                                    </>
                                  ) : (
                                    <>
                                      <i className="fas fa-truck mr-1"></i>
                                      Create Shipment
                                    </>
                                  )}
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(order)}
                                disabled={updatingStatusId === order._id}
                                className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:bg-teal-500 dark:hover:bg-teal-600"
                              >
                                {updatingStatusId === order._id ? (
                                  <i className="fas fa-circle-notch animate-spin"></i>
                                ) : (
                                  <>
                                    <i className="fas fa-edit mr-1"></i>
                                    Status
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-slate-800/30">
                        <td colSpan={8} className="px-4 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Order Items Details */}
                            <div className="md:col-span-2">
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                                Order Items
                              </h4>
                              <div className="space-y-3">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                          {item.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                          {item.category} {item.category1 && `- ${item.category1}`}
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                          {formatCurrency(item.unitPrice.amount, item.unitPrice.currency)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-slate-400">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                      {item.metal && (
                                        <div>
                                          <span className="text-gray-500 dark:text-slate-400">Metal: </span>
                                          <span className="text-gray-900 dark:text-white">
                                            {item.metal.material} {item.metal.karat} {item.metal.color}
                                          </span>
                                        </div>
                                      )}
                                      {item.centerStone && (
                                        <div>
                                          <span className="text-gray-500 dark:text-slate-400">Stone: </span>
                                          <span className="text-gray-900 dark:text-white">
                                            {item.centerStone.type} {item.centerStone.shape} {item.centerStone.carat}ct
                                          </span>
                                        </div>
                                      )}
                                      {item.dimensions?.ringSize && (
                                        <div>
                                          <span className="text-gray-500 dark:text-slate-400">Ring Size: </span>
                                          <span className="text-gray-900 dark:text-white">{item.dimensions.ringSize}</span>
                                        </div>
                                      )}
                                      {item.customization?.engraving && (
                                        <div className="col-span-2">
                                          <span className="text-gray-500 dark:text-slate-400">Engraving: </span>
                                          <span className="text-gray-900 dark:text-white">
                                            "{item.customization.engraving.text}"
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {item.images && item.images.length > 0 && (
                                      <div className="mt-3 flex gap-2">
                                        {item.images.slice(0, 3).map((img, imgIdx) => (
                                          <img
                                            key={imgIdx}
                                            src={img}
                                            alt={`${item.name} ${imgIdx + 1}`}
                                            className="h-16 w-16 rounded object-cover border border-gray-200 dark:border-slate-700"
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Information */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3">
                                Order Information
                              </h4>
                              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700 space-y-3">
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">Shipping Address</p>
                                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                                    {order.shippingAddress.line1}
                                    <br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                    <br />
                                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                  </p>
                                </div>
                                {order.shipping?.trackingNumber && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Tracking Number</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                                      {order.shipping.trackingNumber}
                                    </p>
                                    {order.shipping.carrier && (
                                      <p className="text-xs text-gray-500 dark:text-slate-400">
                                        Carrier: {order.shipping.carrier}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">Payment Method</p>
                                  <p className="text-sm text-gray-900 dark:text-white mt-1 capitalize">
                                    {order.payment?.method || order.paymentMethod || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">Pricing Breakdown</p>
                                  <div className="mt-2 space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-slate-400">Subtotal:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        {formatCurrency(order.pricing?.subtotal || order.subtotal || 0)}
                                      </span>
                                    </div>
                                    {order.pricing?.discount && order.pricing.discount > 0 && (
                                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                                        <span>Discount:</span>
                                        <span>-{formatCurrency(order.pricing.discount)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-slate-400">Shipping:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        {formatCurrency(order.pricing?.shipping || order.shippingCharge || 0)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600 dark:text-slate-400">Tax:</span>
                                      <span className="text-gray-900 dark:text-white">
                                        {formatCurrency(order.pricing?.tax || order.gst || 0)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 dark:border-slate-700 pt-1 mt-1">
                                      <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                                      <span className="font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(order.totalAmount || order.pricing?.total || 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 dark:text-slate-400">Timeline</p>
                                  <div className="mt-2 space-y-1 text-xs">
                                    <p className="text-gray-600 dark:text-slate-400">
                                      Ordered: {formatDate(order.orderedAt)}
                                    </p>
                                    {order.shippedAt && (
                                      <p className="text-gray-600 dark:text-slate-400">
                                        Shipped: {formatDate(order.shippedAt)}
                                      </p>
                                    )}
                                    {order.deliveredAt && (
                                      <p className="text-gray-600 dark:text-slate-400">
                                        Delivered: {formatDate(order.deliveredAt)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {order.notes && (
                                  <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Notes</p>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">{order.notes}</p>
                                  </div>
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
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Order Details - {selectedOrder.number}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Order Number</p>
                  <p className="text-gray-900 dark:text-white">{selectedOrder.number}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Order Type</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    selectedOrder.orderType === 'customized' 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200'
                  }`}>
                    {selectedOrder.orderType}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Status</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Payment Status</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getPaymentStatusColor(selectedOrder.payment?.status || selectedOrder.paymentStatus || 'pending')}`}>
                    {selectedOrder.payment?.status || selectedOrder.paymentStatus || 'pending'}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Customer Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-semibold">Name:</span> {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                  </p>
                  <p className="text-gray-900 dark:text-white">
                    <span className="font-semibold">Email:</span> {selectedOrder.customer.email}
                  </p>
                  {selectedOrder.customer.phone && (
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Phone:</span> {selectedOrder.customer.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Shipping Address</p>
                <p className="text-gray-900 dark:text-white">
                  {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}, {selectedOrder.shippingAddress.country}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Order Items</p>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {item.category} - {item.category1}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.unitPrice.amount, item.unitPrice.currency)} × {item.quantity}
                        </p>
                      </div>
                      {item.metal && (
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Metal: {item.metal.material} {item.metal.karat} {item.metal.color}
                        </p>
                      )}
                      {item.centerStone && (
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Stone: {item.centerStone.type} {item.centerStone.shape} {item.centerStone.carat}ct
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Pricing Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.pricing?.subtotal || selectedOrder.subtotal || 0)}</span>
                  </div>
                  {selectedOrder.pricing?.discount && selectedOrder.pricing.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Discount:</span>
                      <span className="text-gray-900 dark:text-white">-{formatCurrency(selectedOrder.pricing.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Shipping:</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.pricing?.shipping || selectedOrder.shippingCharge || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Tax (GST):</span>
                    <span className="text-gray-900 dark:text-white">{formatCurrency(selectedOrder.pricing?.tax || selectedOrder.gst || 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-slate-800">
                    <span className="font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(selectedOrder.totalAmount || selectedOrder.pricing?.total || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Timeline</p>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600 dark:text-slate-400">
                    <span className="font-semibold">Ordered:</span> {formatDate(selectedOrder.orderedAt)}
                  </p>
                  {selectedOrder.shippedAt && (
                    <p className="text-gray-600 dark:text-slate-400">
                      <span className="font-semibold">Shipped:</span> {formatDate(selectedOrder.shippedAt)}
                    </p>
                  )}
                  {selectedOrder.deliveredAt && (
                    <p className="text-gray-600 dark:text-slate-400">
                      <span className="font-semibold">Delivered:</span> {formatDate(selectedOrder.deliveredAt)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseDetails}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                {canManageOrders && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleUpdateStatus(selectedOrder);
                    }}
                    className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Update Status
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && statusOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Update Order Status
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Order Number
                  </label>
                  <p className="text-gray-900 dark:text-white">{statusOrder.number}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 p-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    placeholder="Add a note about this status change..."
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setStatusOrder(null);
                    setNewStatus('');
                    setStatusNote('');
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusUpdate}
                  disabled={loading || !newStatus}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
