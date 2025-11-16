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
import { PromoCode } from './actions';

interface PromoCodesState {
  promoCodes: PromoCode[];
  currentPromoCode: PromoCode | null;
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  pages: number;
}

const initialState: PromoCodesState = {
  promoCodes: [],
  currentPromoCode: null,
  loading: false,
  error: null,
  total: 0,
  page: 1,
  pages: 1,
};

export const promoCodesReducer = (state = initialState, action: any): PromoCodesState => {
  switch (action.type) {
    case FETCH_PROMOCODES_REQUEST:
    case FETCH_PROMOCODE_REQUEST:
    case CREATE_PROMOCODE_REQUEST:
    case UPDATE_PROMOCODE_REQUEST:
    case DELETE_PROMOCODE_REQUEST:
    case TOGGLE_PROMOCODE_STATUS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_PROMOCODES_SUCCESS:
      return {
        ...state,
        loading: false,
        promoCodes: action.payload.data,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
        error: null,
      };

    case FETCH_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        currentPromoCode: action.payload,
        error: null,
      };

    case CREATE_PROMOCODE_SUCCESS:
      return {
        ...state, 
        loading: false,
        promoCodes: [action.payload, ...state.promoCodes],
        error: null,
      };

    case UPDATE_PROMOCODE_SUCCESS:
    case TOGGLE_PROMOCODE_STATUS_SUCCESS:
      return {
        ...state,
        loading: false,
        promoCodes: state.promoCodes.map((promoCode) =>
          promoCode._id === action.payload._id ? action.payload : promoCode
        ),
        currentPromoCode: state.currentPromoCode?._id === action.payload._id ? action.payload : state.currentPromoCode,
        error: null,
      };

    case DELETE_PROMOCODE_SUCCESS:
      return {
        ...state,
        loading: false,
        promoCodes: state.promoCodes.filter((promoCode) => promoCode._id !== action.payload),
        error: null,
      };

    case FETCH_PROMOCODES_FAILURE:
    case FETCH_PROMOCODE_FAILURE:
    case CREATE_PROMOCODE_FAILURE:
    case UPDATE_PROMOCODE_FAILURE:
    case DELETE_PROMOCODE_FAILURE:
    case TOGGLE_PROMOCODE_STATUS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case CLEAR_PROMOCODE_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

