import {
  FETCH_METAL_PRICES_REQUEST,
  FETCH_METAL_PRICES_SUCCESS,
  FETCH_METAL_PRICES_FAILURE,
  UPDATE_METAL_PRICE_REQUEST,
  UPDATE_METAL_PRICE_SUCCESS,
  UPDATE_METAL_PRICE_FAILURE,
  CLEAR_METAL_PRICE_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export type MetalKey = 'gold' | 'silver' | 'platinum' | 'titanium';

export interface MetalPrice {
  _id: string;
  key: MetalKey;
  field: string;
  value: number;
}

export interface MetalPricesResponse {
  gold: MetalPrice | null;
  silver: MetalPrice | null;
  platinum: MetalPrice | null;
  titanium: MetalPrice | null;
}

const metalFieldMap: Record<MetalKey, string> = {
  gold: 'goldValue24PerGram',
  silver: 'silverPricePerGram',
  platinum: 'platinumPricePerGram',
  titanium: 'titaniumPricePerGram',
};

export const fetchMetalPrices = () => async (dispatch: any) => {
  dispatch({ type: FETCH_METAL_PRICES_REQUEST });

  try {
    const response = await api.get('/default-values');
    dispatch({
      type: FETCH_METAL_PRICES_SUCCESS,
      payload: response.data.data as MetalPricesResponse,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch metal prices';
    dispatch({
      type: FETCH_METAL_PRICES_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

export const updateMetalPrice = (metalKey: MetalKey, id: string, value: number) => async (dispatch: any) => {
  dispatch({
    type: UPDATE_METAL_PRICE_REQUEST,
    payload: { metalKey },
  });

  try {
    const fieldName = metalFieldMap[metalKey];
    const response = await api.patch(`/default-values/${id}`, {
      [fieldName]: value,
    });

    dispatch({
      type: UPDATE_METAL_PRICE_SUCCESS,
      payload: response.data.data as MetalPrice,
    });

    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to update metal price';
    dispatch({
      type: UPDATE_METAL_PRICE_FAILURE,
      payload: { metalKey, message },
    });
    throw new Error(message);
  }
};

export const clearMetalPriceErrors = () => ({
  type: CLEAR_METAL_PRICE_ERRORS,
});
