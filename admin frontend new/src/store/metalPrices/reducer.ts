import {
  FETCH_METAL_PRICES_REQUEST,
  FETCH_METAL_PRICES_SUCCESS,
  FETCH_METAL_PRICES_FAILURE,
  UPDATE_METAL_PRICE_REQUEST,
  UPDATE_METAL_PRICE_SUCCESS,
  UPDATE_METAL_PRICE_FAILURE,
  CLEAR_METAL_PRICE_ERRORS,
} from './actionTypes';
import { MetalKey, MetalPrice, MetalPricesResponse } from './actions';

interface MetalPricesState {
  metals: Record<MetalKey, MetalPrice | null>;
  loading: boolean;
  updatingKey: MetalKey | null;
  error: string | null;
}

const initialState: MetalPricesState = {
  metals: {
    gold: null,
    silver: null,
    platinum: null,
    titanium: null,
  },
  loading: false,
  updatingKey: null,
  error: null,
};

export const metalPricesReducer = (state = initialState, action: any): MetalPricesState => {
  switch (action.type) {
    case FETCH_METAL_PRICES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_METAL_PRICES_SUCCESS:
      return {
        ...state,
        loading: false,
        metals: action.payload as MetalPricesResponse,
        error: null,
      };

    case FETCH_METAL_PRICES_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPDATE_METAL_PRICE_REQUEST:
      return {
        ...state,
        updatingKey: action.payload.metalKey as MetalKey,
        error: null,
      };

    case UPDATE_METAL_PRICE_SUCCESS: {
      const updatedMetal = action.payload as MetalPrice;
      return {
        ...state,
        updatingKey: null,
        metals: {
          ...state.metals,
          [updatedMetal.key]: updatedMetal,
        },
      };
    }

    case UPDATE_METAL_PRICE_FAILURE:
      return {
        ...state,
        updatingKey: null,
        error: action.payload.message,
      };

    case CLEAR_METAL_PRICE_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};
