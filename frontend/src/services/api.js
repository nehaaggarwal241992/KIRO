import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add authentication headers
api.interceptors.request.use(
  (config) => {
    // Get user ID from localStorage or context
    const userId = localStorage.getItem('userId');
    if (userId) {
      config.headers['x-user-id'] = userId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - redirect to login or clear auth
          localStorage.removeItem('userId');
          localStorage.removeItem('userRole');
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.error?.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.error?.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.error?.message);
          break;
        default:
          console.error('API error:', data.error?.message);
      }
      
      // Return structured error
      return Promise.reject({
        status,
        message: data.error?.message || 'An error occurred',
        code: data.error?.code,
        field: data.error?.field,
      });
    } else if (error.request) {
      // Network error
      return Promise.reject({
        status: 0,
        message: 'Network error - please check your connection',
        code: 'NETWORK_ERROR',
      });
    } else {
      // Other error
      return Promise.reject({
        status: 0,
        message: error.message || 'An unexpected error occurred',
        code: 'UNKNOWN_ERROR',
      });
    }
  }
);

export default api;