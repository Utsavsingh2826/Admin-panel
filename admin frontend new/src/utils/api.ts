import axios from 'axios';

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? '/api' : 'http://localhost:5000/api');

console.log('🔧 API Base URL configured:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🌐 API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  (error) => {
    const fullUrl = error.config ? `${error.config.baseURL}${error.config.url}` : 'Unknown URL';
    console.error('❌ API Response Error:', {
      method: error.config?.method?.toUpperCase(),
      url: fullUrl,
      status: error.response?.status,
      message: error.message,
      code: error.code,
      isNetworkError: !error.response
    });
    
    if (error.code === 'ECONNREFUSED' || error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('🚨 Backend server is not reachable!');
      console.error('   Full URL attempted:', fullUrl);
      console.error('   Base URL:', API_URL);
      console.error('   Please ensure:');
      console.error('   1. Backend server is running on port 5000');
      console.error('   2. Run: cd "admin backend new" && npm run dev');
      console.error('   3. Check browser console for CORS errors');
      console.error('   4. Try accessing: http://localhost:5000/health in browser');
      
      // Show user-friendly error
      alert('Cannot connect to backend server!\n\nPlease ensure:\n1. Backend is running on port 5000\n2. Check console for details');
    }
    
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

