import {
  FETCH_CUSTOMIZATION_REQUESTS_REQUEST,
  FETCH_CUSTOMIZATION_REQUESTS_SUCCESS,
  FETCH_CUSTOMIZATION_REQUESTS_FAILURE,
  FETCH_CUSTOMIZATION_REQUEST_REQUEST,
  FETCH_CUSTOMIZATION_REQUEST_SUCCESS,
  FETCH_CUSTOMIZATION_REQUEST_FAILURE,
  PROCESS_ORDER_REQUEST,
  PROCESS_ORDER_SUCCESS,
  PROCESS_ORDER_FAILURE,
  CLEAR_CUSTOMIZATION_REQUEST_ERRORS,
} from './actionTypes';
import { CustomizationRequest } from './actions';

interface CustomizationRequestsState {
  requests: CustomizationRequest[];
  currentRequest: CustomizationRequest | null;
  loading: boolean;
  error: string | null;
  processingOrderId: string | null;
}

const initialState: CustomizationRequestsState = {
  requests: [],
  currentRequest: null,
  loading: false,
  error: null,
  processingOrderId: null,
};

export const customizationRequestsReducer = (state = initialState, action: any): CustomizationRequestsState => {
  switch (action.type) {
    case FETCH_CUSTOMIZATION_REQUESTS_REQUEST:
    case FETCH_CUSTOMIZATION_REQUEST_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case FETCH_CUSTOMIZATION_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        requests: action.payload,
        error: null,
      };

    case FETCH_CUSTOMIZATION_REQUEST_SUCCESS:
      return {
        ...state,
        loading: false,
        currentRequest: action.payload,
        error: null,
      };

    case PROCESS_ORDER_REQUEST:
      return {
        ...state,
        loading: true,
        processingOrderId: action.payload || null,
        error: null,
      };

    case PROCESS_ORDER_SUCCESS:
      return {
        ...state,
        loading: false,
        processingOrderId: null,
        // Remove the processed request from the list
        requests: state.requests.filter((req) => req._id !== action.payload.customizationRequest._id),
        error: null,
      };

    case FETCH_CUSTOMIZATION_REQUESTS_FAILURE:
    case FETCH_CUSTOMIZATION_REQUEST_FAILURE:
    case PROCESS_ORDER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        processingOrderId: null,
      };

    case CLEAR_CUSTOMIZATION_REQUEST_ERRORS:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

