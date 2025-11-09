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
import api from '../../utils/api';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface Verify2FACredentials {
  tempToken: string;
  code: string;
}

// Initialize authentication state from localStorage
export const initializeAuth = () => ({
  type: INITIALIZE_AUTH as typeof INITIALIZE_AUTH
});

// Login action - calls backend API
export const login = (credentials: LoginCredentials) => async (dispatch: any) => {
  console.log('🚀 Login action called with:', { email: credentials.email });
  dispatch({ type: LOGIN_REQUEST });

  try {
    console.log('📡 Making API call to /auth/login');
    const response = await api.post('/auth/login', credentials);
    console.log('✅ Login response received:', response.data);
    const { requires2FA, tempToken, message } = response.data;

    if (requires2FA && tempToken) {
      dispatch({
        type: LOGIN_2FA_REQUIRED,
        payload: { tempToken, message }
      });
      return { requires2FA: true, tempToken, message };
    } else {
      // No 2FA required (shouldn't happen with our setup, but handle it)
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({
        type: LOGIN_SUCCESS,
        payload: user
      });
      return { success: true, user };
    }
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('❌ Error response:', error.response?.data);
    const message = error.response?.data?.error || error.message || 'Login failed';
    dispatch({
      type: LOGIN_FAILURE,
      payload: message
    });
    throw new Error(message);
  }
};

// Verify 2FA action
export const verify2FA = (credentials: Verify2FACredentials) => async (dispatch: any) => {
  dispatch({ type: VERIFY_2FA_REQUEST });

  try {
    const response = await api.post('/auth/verify-2fa', credentials);
    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    dispatch({
      type: VERIFY_2FA_SUCCESS,
      payload: user
    });
    return { success: true, user };
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Verification failed';
    dispatch({
      type: VERIFY_2FA_FAILURE,
      payload: message
    });
    throw new Error(message);
  }
};

// Resend 2FA code action
export const resend2FA = (tempToken: string) => async (dispatch: any) => {
  dispatch({ type: RESEND_2FA_REQUEST });

  try {
    const response = await api.post('/auth/resend-2fa', { tempToken });
    dispatch({
      type: RESEND_2FA_SUCCESS,
      payload: response.data.message
    });
    return { success: true, message: response.data.message };
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to resend code';
    dispatch({
      type: RESEND_2FA_FAILURE,
      payload: message
    });
    throw new Error(message);
  }
};

// Logout action
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return {
  type: LOGOUT as typeof LOGOUT
  };
};

// Clear errors action
export const clearErrors = () => ({
  type: CLEAR_ERRORS as typeof CLEAR_ERRORS
});

