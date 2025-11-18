import {
  FETCH_PRODUCTS_REQUEST,
  FETCH_PRODUCTS_SUCCESS,
  FETCH_PRODUCTS_FAILURE,
  FETCH_PRODUCT_REQUEST,
  FETCH_PRODUCT_SUCCESS,
  FETCH_PRODUCT_FAILURE,
  CREATE_PRODUCT_REQUEST,
  CREATE_PRODUCT_SUCCESS,
  CREATE_PRODUCT_FAILURE,
  UPDATE_PRODUCT_REQUEST,
  UPDATE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_FAILURE,
  DELETE_PRODUCT_REQUEST,
  DELETE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_FAILURE,
  FETCH_CATEGORIES_REQUEST,
  FETCH_CATEGORIES_SUCCESS,
  FETCH_CATEGORIES_FAILURE,
  CLEAR_PRODUCT_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface Product {
  _id: string;
  sku: string;
  variant?: string;
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  price: number;
  metal?: string;
  karat?: number;
  diamondShape?: string;
  diamondSize?: number;
  isGiftingAvailable?: boolean;
  isEngraving?: boolean;
  images?: {
    main?: string;
    sub?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductData {
  sku: string;
  variant?: string;
  title: string;
  description?: string;
  category: string;
  subCategory?: string;
  price: number;
  metal?: string;
  karat?: number;
  diamondShape?: string;
  diamondSize?: number;
  isGiftingAvailable?: boolean;
  isEngraving?: boolean;
  images?: {
    main?: string;
    sub?: string[];
  };
}

// Fetch all products
export const fetchProducts = (page = 1, limit = 20, search = '', category = '', subCategory = '') => async (dispatch: any) => {
  dispatch({ type: FETCH_PRODUCTS_REQUEST });

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(category && { category }),
      ...(subCategory && { subCategory }),
    });

    const response = await api.get(`/products?${params.toString()}`);
    dispatch({
      type: FETCH_PRODUCTS_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch products';
    dispatch({
      type: FETCH_PRODUCTS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch single product
export const fetchProduct = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_PRODUCT_REQUEST });

  try {
    const response = await api.get(`/products/${id}`);
    dispatch({
      type: FETCH_PRODUCT_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch product';
    dispatch({
      type: FETCH_PRODUCT_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Create product
export const createProduct = (data: CreateProductData) => async (dispatch: any) => {
  dispatch({ type: CREATE_PRODUCT_REQUEST });

  try {
    const response = await api.post('/products', data);
    dispatch({
      type: CREATE_PRODUCT_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to create product';
    dispatch({
      type: CREATE_PRODUCT_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Update product
export const updateProduct = (id: string, data: Partial<CreateProductData>) => async (dispatch: any) => {
  dispatch({ type: UPDATE_PRODUCT_REQUEST });

  try {
    const response = await api.put(`/products/${id}`, data);
    dispatch({
      type: UPDATE_PRODUCT_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to update product';
    dispatch({
      type: UPDATE_PRODUCT_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Delete product
export const deleteProduct = (id: string) => async (dispatch: any) => {
  dispatch({ type: DELETE_PRODUCT_REQUEST });

  try {
    await api.delete(`/products/${id}`);
    dispatch({
      type: DELETE_PRODUCT_SUCCESS,
      payload: id,
    });
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to delete product';
    dispatch({
      type: DELETE_PRODUCT_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch categories
export const fetchCategories = () => async (dispatch: any) => {
  dispatch({ type: FETCH_CATEGORIES_REQUEST });

  try {
    const response = await api.get('/products/categories');
    dispatch({
      type: FETCH_CATEGORIES_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch categories';
    dispatch({
      type: FETCH_CATEGORIES_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Clear errors
export const clearProductErrors = () => ({
  type: CLEAR_PRODUCT_ERRORS,
});


