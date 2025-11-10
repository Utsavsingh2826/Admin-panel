import {
  FETCH_PROMOCODES_REQUEST,
  FETCH_PROMOCODES_SUCCESS,
  FETCH_PROMOCODES_FAILURE,
  FETCH_PROMOCODE_REQUEST,
  FETCH_PROMOCODE_SUCCESS,
  FETCH_PROMOCODE_FAILURE,
  CREATE_PROMOCODE_REQUEST,
  CREATE_PROMOCODE_SUCCESS,
  CREATE_PROMOCODE_FAILURE,
  UPDATE_PROMOCODE_REQUEST,
  UPDATE_PROMOCODE_SUCCESS,
  UPDATE_PROMOCODE_FAILURE,
  DELETE_PROMOCODE_REQUEST,
  DELETE_PROMOCODE_SUCCESS,
  DELETE_PROMOCODE_FAILURE,
  TOGGLE_PROMOCODE_STATUS_REQUEST,
  TOGGLE_PROMOCODE_STATUS_SUCCESS,
  TOGGLE_PROMOCODE_STATUS_FAILURE,
  CLEAR_PROMOCODE_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface PromoCode {
  _id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  description?: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePromoCodeData {
  code: string;
  discountPercent: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdatePromoCodeData {
  discountPercent?: number;
  description?: string;
  isActive?: boolean;
}

// Fetch all promo codes
export const fetchPromoCodes = (page = 1, limit = 10, search = '', status = '') => async (dispatch: any) => {
  dispatch({ type: FETCH_PROMOCODES_REQUEST });

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
    });

    const response = await api.get(`/promocodes?${params.toString()}`);
    dispatch({
      type: FETCH_PROMOCODES_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch promo codes';
    dispatch({
      type: FETCH_PROMOCODES_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch single promo code
export const fetchPromoCode = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_PROMOCODE_REQUEST });

  try {
    const response = await api.get(`/promocodes/${id}`);
    dispatch({
      type: FETCH_PROMOCODE_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch promo code';
    dispatch({
      type: FETCH_PROMOCODE_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Create promo code
export const createPromoCode = (promoCodeData: CreatePromoCodeData) => async (dispatch: any) => {
  dispatch({ type: CREATE_PROMOCODE_REQUEST });

  try {
    const response = await api.post('/promocodes', promoCodeData);
    dispatch({
      type: CREATE_PROMOCODE_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to create promo code';
    dispatch({
      type: CREATE_PROMOCODE_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Update promo code
export const updatePromoCode = (id: string, promoCodeData: UpdatePromoCodeData) => async (dispatch: any) => {
  dispatch({ type: UPDATE_PROMOCODE_REQUEST });

  try {
    const response = await api.put(`/promocodes/${id}`, promoCodeData);
    dispatch({
      type: UPDATE_PROMOCODE_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to update promo code';
    dispatch({
      type: UPDATE_PROMOCODE_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Delete promo code
export const deletePromoCode = (id: string) => async (dispatch: any) => {
  dispatch({ type: DELETE_PROMOCODE_REQUEST });

  try {
    await api.delete(`/promocodes/${id}`);
    dispatch({
      type: DELETE_PROMOCODE_SUCCESS,
      payload: id,
    });
    return true;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to delete promo code';
    dispatch({
      type: DELETE_PROMOCODE_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Toggle promo code status
export const togglePromoCodeStatus = (id: string) => async (dispatch: any) => {
  dispatch({ type: TOGGLE_PROMOCODE_STATUS_REQUEST });

  try {
    const response = await api.patch(`/promocodes/${id}/toggle-status`);
    dispatch({
      type: TOGGLE_PROMOCODE_STATUS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to toggle promo code status';
    dispatch({
      type: TOGGLE_PROMOCODE_STATUS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Clear errors
export const clearPromoCodeErrors = () => ({
  type: CLEAR_PROMOCODE_ERRORS,
});

