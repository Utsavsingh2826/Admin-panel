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
import { Product } from './actions';

interface ProductsState {
  products: Product[];
  currentProduct: Product | null;
  categories: {
    categories: string[];
    subCategories: string[];
  };
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: ProductsState = {
  products: [],
  currentProduct: null,
  categories: {
    categories: [],
    subCategories: [],
  },
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

export const productsReducer = (state = initialState, action: any): ProductsState => {
  switch (action.type) {
    case FETCH_PRODUCTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PRODUCTS_SUCCESS:
      return {
        ...state,
        loading: false,
        products: action.payload.data || [],
        total: action.payload.total || 0,
        page: action.payload.page || 1,
        pages: action.payload.pages || 1,
        error: null,
      };

    case FETCH_PRODUCTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        currentProduct: action.payload,
        error: null,
      };

    case FETCH_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CREATE_PRODUCT_REQUEST:
    case UPDATE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case CREATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: [action.payload, ...state.products],
        error: null,
      };

    case UPDATE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        ),
        currentProduct:
          state.currentProduct?._id === action.payload._id
            ? action.payload
            : state.currentProduct,
        error: null,
      };

    case CREATE_PRODUCT_FAILURE:
    case UPDATE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case DELETE_PRODUCT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case DELETE_PRODUCT_SUCCESS:
      return {
        ...state,
        loading: false,
        products: state.products.filter((product) => product._id !== action.payload),
        currentProduct:
          state.currentProduct?._id === action.payload ? null : state.currentProduct,
        error: null,
      };

    case DELETE_PRODUCT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_CATEGORIES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CATEGORIES_SUCCESS:
      return {
        ...state,
        loading: false,
        categories: action.payload,
        error: null,
      };

    case FETCH_CATEGORIES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_PRODUCT_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};


