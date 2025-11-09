import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGIN_2FA_REQUIRED,
  VERIFY_2FA_REQUEST,
  VERIFY_2FA_SUCCESS,
  VERIFY_2FA_FAILURE,
  RESEND_2FA_REQUEST,
  RESEND_2FA_SUCCESS,
  RESEND_2FA_FAILURE,
  LOGOUT,
  INITIALIZE_AUTH,
  CLEAR_ERRORS
} from './actionTypes';

export interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  requires2FA: boolean;
  tempToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  requires2FA: false,
  tempToken: null,
  user: null
};

type AuthAction =
  | { type: typeof LOGIN_REQUEST }
  | { type: typeof LOGIN_SUCCESS; payload: { id: string; email: string; name: string; role: string } }
  | { type: typeof LOGIN_FAILURE; payload: string }
  | { type: typeof LOGIN_2FA_REQUIRED; payload: { tempToken: string; message: string } }
  | { type: typeof VERIFY_2FA_REQUEST }
  | { type: typeof VERIFY_2FA_SUCCESS; payload: { id: string; email: string; name: string; role: string } }
  | { type: typeof VERIFY_2FA_FAILURE; payload: string }
  | { type: typeof RESEND_2FA_REQUEST }
  | { type: typeof RESEND_2FA_SUCCESS; payload: string }
  | { type: typeof RESEND_2FA_FAILURE; payload: string }
  | { type: typeof LOGOUT }
  | { type: typeof INITIALIZE_AUTH }
  | { type: typeof CLEAR_ERRORS };

const authReducer = (state = initialState, action: AuthAction): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
        requires2FA: false,
        tempToken: null
      };
    
    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
        requires2FA: false,
        tempToken: null,
        user: action.payload
      };

    case LOGIN_2FA_REQUIRED:
      return {
        ...state,
        loading: false,
        error: null,
        requires2FA: true,
        tempToken: action.payload.tempToken
      };
    
    case LOGIN_FAILURE:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        requires2FA: false,
        tempToken: null,
        user: null
      };

    case VERIFY_2FA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case VERIFY_2FA_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        error: null,
        requires2FA: false,
        tempToken: null,
        user: action.payload
      };

    case VERIFY_2FA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case RESEND_2FA_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case RESEND_2FA_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null
      };

    case RESEND_2FA_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
        requires2FA: false,
        tempToken: null
      };
    
    case INITIALIZE_AUTH:
      // Check if user is already authenticated from localStorage
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          return {
            ...state,
            isAuthenticated: true,
            user
          };
        } catch {
          return state;
        }
      }
      return state;
    
    case CLEAR_ERRORS:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

export default authReducer;

