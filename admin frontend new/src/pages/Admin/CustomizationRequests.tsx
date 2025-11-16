import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  fetchCustomizationRequests,
  processOrder,
  CustomizationRequest,
  clearCustomizationRequestErrors,
} from '../../store/customizationRequests/actions';
import { toast } from 'react-toastify';

const CustomizationRequests: React.FC = () => {
  const dispatch = useDispatch();
  const { requests, loading, error, processingOrderId } = useSelector((state: RootState) => state.customizationRequests);
  const { user } = useSelector((state: RootState) => state.auth);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CustomizationRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<CustomizationRequest | null>(null);

  const canManageRequests = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCustomizationRequestErrors());
    }
  }, [error, dispatch]);

  const loadRequests = async () => {
    try {
      await dispatch(fetchCustomizationRequests() as any);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customization requests');
    }
  };

  const handleViewDetails = (request: CustomizationRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedRequest(null);
  };

  const handleProcessOrder = (request: CustomizationRequest) => {
    setProcessingRequest(request);
    setShowProcessModal(true);
  };

  const handleConfirmProcessOrder = async () => {
    if (!processingRequest) return;

    try {
      await dispatch(processOrder(processingRequest._id) as any);
      toast.success(`Order created successfully from customization request ${processingRequest.requestNumber}`);
      setShowProcessModal(false);
      setProcessingRequest(null);
      await loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process order');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
      case 'approved':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
      case 'in_review':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customization Requests</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Manage customization requests with completed partial payments
          </p>
        </div>
      </div>

      {loading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm dark:bg-slate-900/70">
          <i className="fas fa-palette text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 dark:text-slate-400">No customization requests found</p>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-2">
            Only requests with completed partial payments are shown here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg dark:bg-slate-900/70"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{request.requestNumber}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <i className="fas fa-gem w-4"></i>
                  <span>{request.category} - {request.subCategory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <i className="fas fa-ring w-4"></i>
                  <span>{request.jewelryType} - {request.stylingName}</span>
                </div>
                {request.contactInfo && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <i className="fas fa-user w-4"></i>
                    <span>{request.contactInfo.firstName} {request.contactInfo.lastName}</span>
                  </div>
                )}
                {request.finalPrice && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                    <i className="fas fa-rupee-sign w-4"></i>
                    <span>₹{request.finalPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {request.referenceImages && request.referenceImages.length > 0 && (
                <div className="mb-4">
                  <img
                    src={request.referenceImages[0]}
                    alt={request.title}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-800">
                <span className="text-xs text-gray-500 dark:text-slate-400">
                  {formatDate(request.requestedAt)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <i className="fas fa-eye mr-1"></i>
                    View
                  </button>
                  {canManageRequests && (
                    <button
                      onClick={() => handleProcessOrder(request)}
                      disabled={processingOrderId === request._id}
                      className="rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400 dark:bg-teal-500 dark:hover:bg-teal-600"
                    >
                      {processingOrderId === request._id ? (
                        <>
                          <i className="fas fa-circle-notch mr-1 animate-spin"></i>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-shopping-cart mr-1"></i>
                          Process Order
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedRequest.title}
              </h3>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-300"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Request Number</p>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.requestNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Status</p>
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Category</p>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.category} - {selectedRequest.subCategory}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">Jewelry Type</p>
                  <p className="text-gray-900 dark:text-white">{selectedRequest.jewelryType} - {selectedRequest.stylingName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Description</p>
                <p className="text-gray-900 dark:text-white">{selectedRequest.description}</p>
              </div>

              {selectedRequest.contactInfo && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Contact Information</p>
                  <div className="grid grid-cols-2 gap-4">
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Name:</span> {selectedRequest.contactInfo.firstName} {selectedRequest.contactInfo.lastName}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Email:</span> {selectedRequest.contactInfo.email}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Phone:</span> {selectedRequest.contactInfo.phoneNumber}
                    </p>
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">Address:</span> {selectedRequest.contactInfo.address}, {selectedRequest.contactInfo.city}, {selectedRequest.contactInfo.state} {selectedRequest.contactInfo.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {selectedRequest.finalPrice && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Pricing</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{selectedRequest.finalPrice.toLocaleString('en-IN')}</p>
                </div>
              )}

              {selectedRequest.referenceImages && selectedRequest.referenceImages.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-2">Reference Images</p>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedRequest.referenceImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Reference ${idx + 1}`} className="rounded-lg object-cover h-32 w-full" />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseDetails}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Close
                </button>
                {canManageRequests && (
                  <button
                    onClick={() => {
                      handleCloseDetails();
                      handleProcessOrder(selectedRequest);
                    }}
                    className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
                  >
                    <i className="fas fa-shopping-cart mr-2"></i>
                    Process Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Order Confirmation Modal */}
      {showProcessModal && processingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl dark:bg-slate-900">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-500/20">
                  <i className="fas fa-shopping-cart text-2xl text-teal-600 dark:text-teal-400"></i>
                </div>
              </div>
              <h3 className="mb-2 text-center text-xl font-semibold text-gray-900 dark:text-white">
                Process Order?
              </h3>
              <p className="mb-6 text-center text-gray-600 dark:text-slate-400">
                This will create an order in the Orders database from customization request <strong>{processingRequest.requestNumber}</strong>. Continue?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setProcessingRequest(null);
                  }}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmProcessOrder}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-400"
                >
                  {loading ? 'Processing...' : 'Process Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizationRequests;

