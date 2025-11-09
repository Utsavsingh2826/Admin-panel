import { Middleware } from 'redux';
import { LOGIN_REQUEST, LOGIN_SUCCESS } from './actionTypes';
import { RootState, AppDispatch } from '../index';

// Simple middleware to handle login bypass
export const authMiddleware: Middleware<{}, RootState, AppDispatch> = (store) => (next) => (action: any) => {
  // Let LOGIN_REQUEST pass through to reducer (to set loading state)
  const result = next(action);
  
  if (action.type === LOGIN_REQUEST) {
    // Simulate a brief delay for better UX
    setTimeout(() => {
      const { email } = action.payload;
      
      // Bypass login - always succeed
      // Store token and user info in localStorage
      const token = 'bypass-token-' + Date.now();
      const user = {
        email,
        name: email.split('@')[0]
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Dispatch success action
      store.dispatch({
        type: LOGIN_SUCCESS,
        payload: user
      });
    }, 500); // 500ms delay to simulate API call
  }
  
  return result;
};

