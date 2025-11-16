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
import { Order } from './actions';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  updatingStatusId: string | null;
  creatingShipmentId: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  updatingStatusId: null,
  creatingShipmentId: null,
};

export const ordersReducer = (state = initialState, action: any): OrdersState => {
  switch (action.type) {
    case FETCH_ORDERS_REQUEST:
    case FETCH_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_ORDERS_SUCCESS:
      return {
        ...state,
        loading: false,
        orders: action.payload,
        error: null,
      };

    case FETCH_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        currentOrder: action.payload,
        error: null,
      };

    case UPDATE_ORDER_STATUS_REQUEST:
      return {
        ...state,
        updatingStatusId: action.payload || null,
        error: null,
      };

    case UPDATE_ORDER_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        updatingStatusId: null,
        orders: state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        ),
        currentOrder: state.currentOrder?._id === action.payload._id ? action.payload : state.currentOrder,
        error: null,
      };

    case CREATE_SHIPMENT_REQUEST:
      return {
        ...state,
        creatingShipmentId: action.payload || null,
        error: null,
      };

    case CREATE_SHIPMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        creatingShipmentId: null,
        orders: state.orders.map((order) =>
          order._id === action.payload.order._id ? action.payload.order : order
        ),
        currentOrder: state.currentOrder?._id === action.payload.order._id ? action.payload.order : state.currentOrder,
        error: null,
      };

    case CREATE_SHIPMENT_FAILURE:
      return {
        ...state,
        loading: false,
        creatingShipmentId: null,
        error: action.payload,
      };

    case FETCH_ORDERS_FAILURE:
    case FETCH_ORDER_FAILURE:
    case UPDATE_ORDER_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        updatingStatusId: null,
        creatingShipmentId: null,
      };

    case CLEAR_ORDER_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

