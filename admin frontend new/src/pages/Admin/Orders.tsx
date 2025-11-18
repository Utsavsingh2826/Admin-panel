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
    // Check if shipment already exists
    if (order.shipping?.trackingNumber || order.trackingNumber) {
      toast.warning(`Shipment already exists for this order. Docket Number: ${order.shipping?.trackingNumber || order.trackingNumber}`);
      return;
    }

    if (!window.confirm(`Create shipment for order ${order.number}? This will schedule pickup for tomorrow at 4 PM.`)) {
      return;
    }

    try {
      const response = await dispatch(createShipment(order._id) as any);
      // Extract docket number from response - Sequel API uses docket_number (snake_case)
      // Response structure: { data: { order: {...}, shipment: { docket_number: "..." } } }
      const docketNumber = 
        response?.data?.shipment?.docket_number ||  // Sequel API response format (snake_case)
        response?.data?.shipment?.docketNumber ||   // Fallback camelCase
        response?.data?.data?.docket_number ||      // Direct from Sequel response
        response?.data?.data?.docketNumber ||
        response?.data?.order?.shipping?.trackingNumber ||
        response?.data?.order?.trackingNumber ||
        response?.data?.order?.metadata?.sequelDocketNumber ||
        'N/A';
      
      console.log('Frontend - Full response:', JSON.stringify(response, null, 2));
      console.log('Frontend - Extracted docket number:', docketNumber);
      
      if (docketNumber !== 'N/A') {
        toast.success(`Shipment created successfully! Docket Number: ${docketNumber}`);
      } else {
        toast.success('Shipment created successfully!');
      }
      // Reload orders to get updated order with tracking number
      await loadOrders();
    } catch (error: any) {
      console.error('Frontend - Shipment creation error:', error);
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
        <div className="w-full">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800">
                <th className="w-[12%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Order #
                </th>
                <th className="w-[15%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Customer
                </th>
                <th className="w-[12%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden lg:table-cell">
                  Items
                </th>
                <th className="w-[10%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Amount
                </th>
                <th className="w-[10%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                  Status
                </th>
                <th className="w-[10%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden md:table-cell">
                  Payment
                </th>
                <th className="w-[10%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 hidden lg:table-cell">
                  Date
                </th>
                <th className="w-[21%] px-2 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
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
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOrderDetails(order._id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                          >
                            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                              {order.number}
                            </div>
                            {order.orderType === 'customized' && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                                Custom
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                          {order.customer.email}
                        </div>
                        {order.customer.phone && (
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                            {order.customer.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 hidden lg:table-cell">
                        <div className="text-xs text-gray-900 dark:text-white">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                          {order.items[0]?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <div className="text-xs font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount || order.pricing?.total || 0)}
                        </div>
                        {order.pricing?.discount && order.pricing.discount > 0 && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            -{formatCurrency(order.pricing.discount)}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize truncate max-w-full ${getStatusColor(order.status)}`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-2 py-4 hidden md:table-cell">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize truncate max-w-full ${getPaymentStatusColor(order.payment?.status || order.paymentStatus || 'pending')}`}
                        >
                          {order.payment?.status || order.paymentStatus || 'pending'}
                        </span>
                        {order.payment?.transactionId && (
                          <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                            {order.payment.transactionId.substring(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-4 hidden lg:table-cell text-xs text-gray-500 dark:text-slate-400">
                        {formatDate(order.orderedAt)}
                      </td>
                      <td className="px-2 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="rounded border border-gray-300 px-2 py-1 text-[10px] font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {canManageOrders && (
                            <>
                              {!order.shipping?.trackingNumber && !order.trackingNumber && (
                                <button
                                  onClick={() => handleCreateShipment(order)}
                                  disabled={creatingShipmentId === order._id}
                                  className="rounded bg-blue-600 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600"
                                  title="Create Shipment"
                                >
                                  {creatingShipmentId === order._id ? (
                                    <i className="fas fa-circle-notch animate-spin"></i>
                                  ) : (
                                    <i className="fas fa-truck"></i>
                                  )}
                                </button>
                              )}
                              {(order.shipping?.trackingNumber || order.trackingNumber) && (
                                <div className="text-[10px] text-gray-500 dark:text-slate-400 truncate max-w-[80px]" title={`Docket: ${order.shipping?.trackingNumber || order.trackingNumber}`}>
                                  <i className="fas fa-check-circle text-emerald-600"></i>
                                  {String(order.shipping?.trackingNumber || order.trackingNumber).substring(0, 6)}...
                                </div>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(order)}
                                disabled={updatingStatusId === order._id}
                                className="rounded bg-teal-600 px-2 py-1 text-[10px] font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:bg-teal-500 dark:hover:bg-teal-600"
                                title="Update Status"
                              >
                                {updatingStatusId === order._id ? (
                                  <i className="fas fa-circle-notch animate-spin"></i>
                                ) : (
                                  <i className="fas fa-edit"></i>
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-slate-800/30">
                        <td colSpan={8} className="px-2 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-full">
                            {/* Order Items Details */}
                            <div className="md:col-span-2 min-w-0">
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Order Items
                              </h4>
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700"
                                  >
                                    <div className="flex justify-between items-start mb-1.5 gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-xs text-gray-900 dark:text-white truncate">
                                          {item.name}
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                                          {item.category} {item.category1 && `- ${item.category1}`}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className="font-semibold text-xs text-gray-900 dark:text-white">
                                          {formatCurrency(item.unitPrice.amount, item.unitPrice.currency)}
                                        </p>
                                        <p className="text-[10px] text-gray-500 dark:text-slate-400">
                                          Qty: {item.quantity}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
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
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-2">
                                Order Information
                              </h4>
                              <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-slate-700 space-y-2 max-h-96 overflow-y-auto">
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Shipping Address</p>
                                  <p className="text-xs text-gray-900 dark:text-white mt-0.5 break-words">
                                    {order.shippingAddress.line1}
                                    <br />
                                    {order.shippingAddress.city}, {order.shippingAddress.state}
                                    <br />
                                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                  </p>
                                </div>
                                {(order.shipping?.trackingNumber || order.trackingNumber) && (
                                  <div>
                                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Tracking Number (Docket)</p>
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5 break-all">
                                      {order.shipping?.trackingNumber || order.trackingNumber}
                                    </p>
                                    {(order.shipping?.carrier || order.courierService) && (
                                      <p className="text-[10px] text-gray-500 dark:text-slate-400">
                                        Carrier: {order.shipping?.carrier || order.courierService}
                                      </p>
                                    )}
                                    {order.metadata?.sequelDocketPrint && (
                                      <a
                                        href={order.metadata.sequelDocketPrint}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] text-teal-600 hover:text-teal-700 dark:text-teal-400 mt-0.5 inline-block"
                                      >
                                        <i className="fas fa-download mr-1"></i>
                                        Download Docket
                                      </a>
                                    )}
                                  </div>
                                )}
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Payment Method</p>
                                  <p className="text-xs text-gray-900 dark:text-white mt-0.5 capitalize">
                                    {order.payment?.method || order.paymentMethod || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Pricing Breakdown</p>
                                  <div className="mt-1.5 space-y-0.5 text-[10px]">
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
                                  <p className="text-[10px] text-gray-500 dark:text-slate-400">Timeline</p>
                                  <div className="mt-1.5 space-y-0.5 text-[10px]">
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
                                    <p className="text-[10px] text-gray-500 dark:text-slate-400">Notes</p>
                                    <p className="text-xs text-gray-900 dark:text-white mt-0.5 break-words">{order.notes}</p>
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

              {/* Shipping & Tracking */}
              {(selectedOrder.shipping?.trackingNumber || selectedOrder.trackingNumber) && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Shipping & Tracking</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Docket Number:</span> {selectedOrder.shipping?.trackingNumber || selectedOrder.trackingNumber}
                    </p>
                    {(selectedOrder.shipping?.carrier || selectedOrder.courierService) && (
                      <p className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold">Carrier:</span> {selectedOrder.shipping?.carrier || selectedOrder.courierService}
                      </p>
                    )}
                    {selectedOrder.shipping?.eta && (
                      <p className="text-gray-600 dark:text-slate-400">
                        <span className="font-semibold">Estimated Delivery:</span> {selectedOrder.shipping.eta}
                      </p>
                    )}
                    {selectedOrder.metadata?.sequelDocketPrint && (
                      <a
                        href={selectedOrder.metadata.sequelDocketPrint}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 mt-2"
                      >
                        <i className="fas fa-download"></i>
                        Download Docket PDF
                      </a>
                    )}
                  </div>
                </div>
              )}

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
