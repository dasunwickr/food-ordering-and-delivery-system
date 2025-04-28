import axios from 'axios';

// Simple custom types
type RequestConfig = {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
  method?: string;
  url?: string;
  data?: any;
};

// Environment configuration
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
const TIMEOUT = 15000; // 15 seconds timeout

// Create basic request configuration
const getRequestConfig = (): RequestConfig => ({
  baseURL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Include cookies with cross-origin requests
});

// Create Axios instance with default configuration
const api = axios.create(getRequestConfig());

// Enable/disable debug logging
const DEBUG = process.env.NODE_ENV !== 'production';

// Simple logger
const logRequest = (config: any) => {
  if (DEBUG) {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data
    });
  }
};

const logResponse = (response: any) => {
  if (DEBUG) {
    console.log('API Response:', response.status, response.data);
  }
};

const logError = (error: any) => {
  console.error('API Error:', error);
};

// Request interceptor to attach auth token
api.interceptors.request.use((config) => {
  // Get the token from localStorage if in browser environment
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('authToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Log request details
  logRequest(config);
  
  return config;
}, (error) => {
  logError(error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  async (error) => {
    logError(error);
    
    // Add user-friendly messages based on common errors
    if (!error.response) {
      error.userMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else {
      // Handle common status codes
      switch (error.response.status) {
        case 400:
          error.userMessage = 'Invalid request. Please check your data.';
          break;
        case 401:
          error.userMessage = 'Authentication required. Please sign in.';
          // Handle sign out on auth errors
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            window.location.href = '/sign-in';
          }
          break;
        case 403:
          error.userMessage = 'You do not have permission to access this resource.';
          break;
        case 404:
          error.userMessage = 'The requested resource was not found.';
          break;
        case 500:
          error.userMessage = 'An internal server error occurred. Please try again later.';
          break;
        default:
          error.userMessage = 'An error occurred with the API request.';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;