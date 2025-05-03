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
// This should match your API Gateway setting
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
const TIMEOUT = 30000; // Increased to 30 seconds timeout

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
const DEBUG = true; // Always enable for now to help with debugging

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
  console.error('API Error:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    url: error.config?.url
  });
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

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    logResponse(response);
    return response;
  },
  async (error) => {
    logError(error);
    
    // Create more detailed error information
    if (!error.response) {
      error.userMessage = 'Network error: Unable to connect to the server. Please check your internet connection or verify that the backend services are running.';
    } else {
      // Handle common status codes with more detailed messages
      switch (error.response.status) {
        case 400:
          error.userMessage = `Bad request: ${error.response.data?.error || 'Please check your data'}`;
          break;
        case 401:
          error.userMessage = 'Authentication required. Please sign in again.';
          break;
        case 403:
          error.userMessage = 'Access denied: You do not have permission to access this resource.';
          break;
        case 404:
          error.userMessage = `Resource not found: ${error.config?.url}. The service might be unavailable.`;
          break;
        case 500:
          error.userMessage = 'Internal server error. Our team has been notified.';
          break;
        case 502:
        case 503:
        case 504:
          error.userMessage = 'Service unavailable. This could be due to maintenance or high traffic.';
          break;
        default:
          error.userMessage = `Error ${error.response.status}: ${error.response.data?.message || 'An unexpected error occurred'}`;
      }
    }
    
    // Add the user message to the error object
    error.message = error.userMessage || error.message;
    
    return Promise.reject(error);
  }
);

export default api;