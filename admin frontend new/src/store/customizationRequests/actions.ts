import {
  FETCH_CUSTOMIZATION_REQUESTS_REQUEST,
  FETCH_CUSTOMIZATION_REQUESTS_SUCCESS,
  FETCH_CUSTOMIZATION_REQUESTS_FAILURE,
  FETCH_CUSTOMIZATION_REQUEST_REQUEST,
  FETCH_CUSTOMIZATION_REQUEST_SUCCESS,
  FETCH_CUSTOMIZATION_REQUEST_FAILURE,
  PROCESS_ORDER_REQUEST,
  PROCESS_ORDER_SUCCESS,
  PROCESS_ORDER_FAILURE,
  CLEAR_CUSTOMIZATION_REQUEST_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface CustomizationRequestImage {
  url: string;
  publicId: string;
}

export interface CustomizationRequest {
  _id: string;
  requestId: string;
  userId: string;
  requestNumber: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  jewelryType: string;
  stylingName: string;
  referenceImages: string[];
  inspirationImages: string[];
  designImages: string[];
  diamondShape?: string;
  diamondSize?: string;
  diamondColor?: string;
  diamondClarity?: string;
  diamondOrigin?: string;
  metalType?: string;
  metalKarat?: string;
  metalColor?: string;
  ringSize?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
  };
  engraving?: {
    text: string;
    font: string;
    position: string;
  };
  specialInstructions?: string;
  budgetRange?: {
    min: number;
    max: number;
  };
  contactInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  estimatedPrice?: number;
  finalPrice?: number;
  priceBreakdown?: {
    basePrice: number;
    diamondPrice: number;
    metalPrice: number;
    customizationFee: number;
    engravingFee: number;
    gst: number;
    total: number;
  };
  status: string;
  partialPaymentStatus: string;
  progress: number;
  messages: Array<{
    sender: 'user' | 'admin';
    message: string;
    timestamp: string;
    attachments?: string[];
  }>;
  adminNotes?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  completedAt?: string;
  estimatedDelivery?: string;
  estimatedDeliveryDay?: string;
  actualDelivery?: string;
  customData?: Record<string, any>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export const fetchCustomizationRequests = () => async (dispatch: any) => {
  dispatch({ type: FETCH_CUSTOMIZATION_REQUESTS_REQUEST });

  try {
    const response = await api.get('/customization-requests');
    dispatch({
      type: FETCH_CUSTOMIZATION_REQUESTS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch customization requests';
    dispatch({
      type: FETCH_CUSTOMIZATION_REQUESTS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const fetchCustomizationRequest = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_CUSTOMIZATION_REQUEST_REQUEST });

  try {
    const response = await api.get(`/customization-requests/${id}`);
    dispatch({
      type: FETCH_CUSTOMIZATION_REQUEST_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch customization request';
    dispatch({
      type: FETCH_CUSTOMIZATION_REQUEST_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const processOrder = (id: string) => async (dispatch: any) => {
  dispatch({ type: PROCESS_ORDER_REQUEST });

  try {
    const response = await api.post(`/customization-requests/${id}/process-order`);
    dispatch({
      type: PROCESS_ORDER_SUCCESS,
      payload: response.data.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to process order';
    dispatch({
      type: PROCESS_ORDER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const clearCustomizationRequestErrors = () => ({
  type: CLEAR_CUSTOMIZATION_REQUEST_ERRORS,
});

