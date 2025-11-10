import {
  FETCH_USERS_REQUEST,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILURE,
  FETCH_USER_REQUEST,
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAILURE,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAILURE,
  DELETE_USER_REQUEST,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILURE,
  TOGGLE_USER_STATUS_REQUEST,
  TOGGLE_USER_STATUS_SUCCESS,
  TOGGLE_USER_STATUS_FAILURE,
  UNLOCK_USER_REQUEST,
  UNLOCK_USER_SUCCESS,
  UNLOCK_USER_FAILURE,
  RESET_PASSWORD_REQUEST,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
  CLEAR_USER_ERRORS,
} from './actionTypes';
import api from '../../utils/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'staff';
  isActive: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockUntil?: string | null;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'superadmin' | 'admin' | 'manager' | 'staff';
  isActive?: boolean;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'superadmin' | 'admin' | 'manager' | 'staff';
  isActive?: boolean;
}

export interface ResetPasswordData {
  newPassword: string;
}

// Fetch all users
export const fetchUsers = (page = 1, limit = 10, search = '', status = '', role = '') => async (dispatch: any) => {
  dispatch({ type: FETCH_USERS_REQUEST });

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
      ...(status && { status }),
      ...(role && { role }),
    });

    const response = await api.get(`/users?${params.toString()}`);
    dispatch({
      type: FETCH_USERS_SUCCESS,
      payload: response.data,
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch users';
    dispatch({
      type: FETCH_USERS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Fetch single user
export const fetchUser = (id: string) => async (dispatch: any) => {
  dispatch({ type: FETCH_USER_REQUEST });

  try {
    const response = await api.get(`/users/${id}`);
    dispatch({
      type: FETCH_USER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to fetch user';
    dispatch({
      type: FETCH_USER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Create user
export const createUser = (userData: CreateUserData) => async (dispatch: any) => {
  dispatch({ type: CREATE_USER_REQUEST });

  try {
    const response = await api.post('/users', userData);
    dispatch({
      type: CREATE_USER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to create user';
    dispatch({
      type: CREATE_USER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Update user
export const updateUser = (id: string, userData: UpdateUserData) => async (dispatch: any) => {
  dispatch({ type: UPDATE_USER_REQUEST });

  try {
    const response = await api.put(`/users/${id}`, userData);
    dispatch({
      type: UPDATE_USER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to update user';
    dispatch({
      type: UPDATE_USER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Delete user
export const deleteUser = (id: string) => async (dispatch: any) => {
  dispatch({ type: DELETE_USER_REQUEST });

  try {
    await api.delete(`/users/${id}`);
    dispatch({
      type: DELETE_USER_SUCCESS,
      payload: id,
    });
    return true;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to delete user';
    dispatch({
      type: DELETE_USER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Toggle user status
export const toggleUserStatus = (id: string) => async (dispatch: any) => {
  dispatch({ type: TOGGLE_USER_STATUS_REQUEST });

  try {
    const response = await api.patch(`/users/${id}/toggle-status`);
    dispatch({
      type: TOGGLE_USER_STATUS_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to toggle user status';
    dispatch({
      type: TOGGLE_USER_STATUS_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Unlock user
export const unlockUser = (id: string) => async (dispatch: any) => {
  dispatch({ type: UNLOCK_USER_REQUEST });

  try {
    const response = await api.patch(`/users/${id}/unlock`);
    dispatch({
      type: UNLOCK_USER_SUCCESS,
      payload: response.data.data,
    });
    return response.data.data;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to unlock user';
    dispatch({
      type: UNLOCK_USER_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Reset password
export const resetPassword = (id: string, passwordData: ResetPasswordData) => async (dispatch: any) => {
  dispatch({ type: RESET_PASSWORD_REQUEST });

  try {
    await api.patch(`/users/${id}/reset-password`, passwordData);
    dispatch({
      type: RESET_PASSWORD_SUCCESS,
    });
    return true;
  } catch (error: any) {
    const message = error.response?.data?.error || error.message || 'Failed to reset password';
    dispatch({
      type: RESET_PASSWORD_FAILURE,
      payload: message,
    });
    throw new Error(message);
  }
};

// Clear errors
export const clearUserErrors = () => ({
  type: CLEAR_USER_ERRORS,
});

