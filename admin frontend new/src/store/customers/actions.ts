import {
  FETCH_CUSTOMERS_REQUEST,
  FETCH_CUSTOMERS_SUCCESS,
  FETCH_CUSTOMERS_FAILURE,
  FETCH_CUSTOMER_REQUEST,
  FETCH_CUSTOMER_SUCCESS,
  FETCH_CUSTOMER_FAILURE,
  UPDATE_CUSTOMER_REQUEST,
  UPDATE_CUSTOMER_SUCCESS,
  UPDATE_CUSTOMER_FAILURE,
  TOGGLE_CUSTOMER_STATUS_REQUEST,
  TOGGLE_CUSTOMER_STATUS_SUCCESS,
  TOGGLE_CUSTOMER_STATUS_FAILURE,
  CLEAR_CUSTOMER_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface Customer {
  _id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  phone?: string;
  isVerified?: boolean;
  role: 'customer';
  address?: {
    shippingAddress?: {
      sameAsBilling?: boolean;
    };
  };
  orders?: any[];
  wishlist?: any[];
  gifts?: any[];
  isActive: boolean;
  availableOffers?: number;
  referredBy?: {
    _id: string;
    name?: string;
    email?: string;
    referralCode?: string;
  } | null;
  refDiscount?: number;
  referralCount?: number;
  totalReferralEarnings?: number;
  usedPromoCodes?: any[];
  usedReferralCodes?: any[];
  lastLogin?: number | string | null;
  referralCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCustomerData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  isVerified?: boolean;
  availableOffers?: number;
  refDiscount?: number;
  address?: {
    shippingAddress?: {
      sameAsBilling?: boolean;
    };
  };
}

// Fetch all customers
export const fetchCustomers = (page = 1, limit = 20, search = '', status = '') => async (dispatch: any) => {
  dispatch({ type: FETCH_CUSTOMERS_REQUEST });

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await api.get(`/customers?${params.toString()}`);
    dispatch({
      type: FETCH_CUSTOMERS_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch customers';
    dispatch({
      type: FETCH_CUSTOMERS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch single customer
export const fetchCustomer = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_CUSTOMER_REQUEST });

  try {
    const response = await api.get(`/customers/${id}`);
    dispatch({
      type: FETCH_CUSTOMER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch customer';
    dispatch({
      type: FETCH_CUSTOMER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Update customer
export const updateCustomer = (id: string, data: UpdateCustomerData) => async (dispatch: any) => {
  dispatch({ type: UPDATE_CUSTOMER_REQUEST });

  try {
    const response = await api.put(`/customers/${id}`, data);
    dispatch({
      type: UPDATE_CUSTOMER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to update customer';
    dispatch({
      type: UPDATE_CUSTOMER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Toggle customer status
export const toggleCustomerStatus = (id: string) => async (dispatch: any) => {
  dispatch({ type: TOGGLE_CUSTOMER_STATUS_REQUEST });

  try {
    const response = await api.patch(`/customers/${id}/toggle-status`);
    dispatch({
      type: TOGGLE_CUSTOMER_STATUS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to toggle customer status';
    dispatch({
      type: TOGGLE_CUSTOMER_STATUS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Clear errors
export const clearCustomerErrors = () => ({
  type: CLEAR_CUSTOMER_ERRORS,
});


