import {
  FETCH_ORDERS_REQUEST,
  FETCH_ORDERS_SUCCESS,
  FETCH_ORDERS_FAILURE,
  FETCH_ORDER_REQUEST,
  FETCH_ORDER_SUCCESS,
  FETCH_ORDER_FAILURE,
  UPDATE_ORDER_STATUS_REQUEST,
  UPDATE_ORDER_STATUS_SUCCESS,
  UPDATE_ORDER_STATUS_FAILURE,
  CREATE_SHIPMENT_REQUEST,
  CREATE_SHIPMENT_SUCCESS,
  CREATE_SHIPMENT_FAILURE,
  CLEAR_ORDER_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface OrderItem {
  lineId: string;
  productId?: string;
  sku?: string;
  name: string;
  productType: string;
  category: string;
  category1: string;
  category2: string;
  category3: string;
  centerStoneShape: string;
  quantity: number;
  unitPrice: {
    currency: string;
    amount: number;
  };
  metal?: {
    material: string;
    color?: string;
    karat?: string;
    finish?: string;
  };
  centerStone?: {
    type: string;
    shape: string;
    carat?: number;
    color?: string;
    clarity?: string;
    cut?: string;
    certifiedBy?: string;
    certificateNo?: string;
  };
  sideStones?: Array<{
    type: string;
    shape: string;
    carat?: number;
    color?: string;
    clarity?: string;
  }>;
  dimensions?: {
    ringSize?: string;
    braceletLengthMM?: number;
    bangleSize?: string;
    chainLengthIn?: number;
    pendantBailSizeMM?: number;
    earringSubtype?: string;
  };
  customization?: {
    engraving?: {
      text: string;
      font?: string;
      position?: string;
      language?: string;
    };
    uploadedDesignId?: string;
    buildConfigId?: string;
    notes?: string;
  };
  compliance?: {
    hallmark?: boolean;
    bisNumber?: string;
  };
  grossWeightG?: number;
  netGoldWeightG?: number;
  fulfillment?: {
    status: string;
    warehouseId?: string;
    serialNumber?: string;
    producedAt?: string;
    readyAt?: string;
  };
  images?: string[];
  lineTotals: {
    subtotal: {
      currency: string;
      amount: number;
    };
    discount?: {
      currency: string;
      amount: number;
    };
    tax?: {
      currency: string;
      amount: number;
    };
    total: {
      currency: string;
      amount: number;
    };
  };
}

export interface Order {
  _id: string;
  number: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  customer: {
    id?: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName?: string;
  };
  status: string;
  orderStatus: string;
  orderType: 'normal' | 'customized';
  items: OrderItem[];
  shippingAddress: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    name: string;
    phone?: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  pricing: {
    currency: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
  };
  subtotal: number;
  gst: number;
  shippingCharge: number;
  totalAmount: number;
  payment: {
    method: string;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  shipping: {
    method?: string;
    carrier?: string;
    service?: string;
    trackingNumber?: string;
    shippedAt?: string;
    eta?: string;
  };
  trackingNumber?: string;
  courierService?: string;
  statusHistory?: Array<{
    status: string;
    date: string;
    note?: string;
  }>;
  images?: Array<{
    url: string;
    publicId?: string;
    uploadedAt?: string;
    source?: string;
    alt?: string;
  }>;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  estimatedDeliveryDate?: string;
  orderedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const fetchOrders = () => async (dispatch: any) => {
  dispatch({ type: FETCH_ORDERS_REQUEST });

  try {
    const response = await api.get('/orders');
    console.log('✅ Orders fetched successfully:', response.data);
    
    // Ensure we have an array
    const ordersData = Array.isArray(response.data.data) ? response.data.data : [];
    
    dispatch({
      type: FETCH_ORDERS_SUCCESS,
      payload: ordersData,
    });
    return ordersData;
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
    console.error('Error response:', error.response);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    // Extract error message from various possible locations
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error?.message ||
      error.message || 
      `Failed to fetch orders${error.response?.status ? ` (Status: ${error.response.status})` : ''}`;
    
    dispatch({
      type: FETCH_ORDERS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const fetchOrder = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_ORDER_REQUEST });

  try {
    const response = await api.get(`/orders/${id}`);
    dispatch({
      type: FETCH_ORDER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch order';
    dispatch({
      type: FETCH_ORDER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const updateOrderStatus = (id: string, status: string, note?: string) => async (dispatch: any) => {
  dispatch({ type: UPDATE_ORDER_STATUS_REQUEST });

  try {
    const response = await api.put(`/orders/${id}/status`, { status, note });
    dispatch({
      type: UPDATE_ORDER_STATUS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to update order status';
    dispatch({
      type: UPDATE_ORDER_STATUS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const createShipment = (id: string) => async (dispatch: any) => {
  dispatch({ type: CREATE_SHIPMENT_REQUEST, payload: id });

  try {
    const response = await api.post(`/orders/${id}/create-shipment`);
    // Log the response for debugging
    console.log('Frontend - Shipment Response:', JSON.stringify(response.data, null, 2));
    dispatch({
      type: CREATE_SHIPMENT_SUCCESS,
      payload: response.data.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || 'Failed to create shipment';
    dispatch({
      type: CREATE_SHIPMENT_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const clearOrderErrors = () => ({
  type: CLEAR_ORDER_ERRORS,
});

