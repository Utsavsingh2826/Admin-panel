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
import { Customer } from './actions';

interface CustomersState {
  customers: Customer[];
  currentCustomer: Customer | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: CustomersState = {
  customers: [],
  currentCustomer: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

export const customersReducer = (state = initialState, action: any): CustomersState => {
  switch (action.type) {
    case FETCH_CUSTOMERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CUSTOMERS_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: action.payload.data || [],
        total: action.payload.total || 0,
        page: action.payload.page || 1,
        pages: action.payload.pages || 1,
        error: null,
      };

    case FETCH_CUSTOMERS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case FETCH_CUSTOMER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CUSTOMER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentCustomer: action.payload,
        error: null,
      };

    case FETCH_CUSTOMER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_CUSTOMER_REQUEST:
    case TOGGLE_CUSTOMER_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case UPDATE_CUSTOMER_SUCCESS:
    case TOGGLE_CUSTOMER_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        customers: state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        ),
        currentCustomer:
          state.currentCustomer?._id === action.payload._id
            ? action.payload
            : state.currentCustomer,
        error: null,
      };

    case UPDATE_CUSTOMER_FAILURE:
    case TOGGLE_CUSTOMER_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_CUSTOMER_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};


