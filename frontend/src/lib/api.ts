import axios from "axios";

// Create API instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (401, 403, network errors)
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      window.location.href = "/sign-up";
    }
    
    return Promise.reject(error);
  }
);

// Auth service APIs
export const authApi = {
  signIn: async (email: string, password: string) => {
    const response = await api.post("/api/auth/signin", { email, password });
    return response.data;
  },
  
  signUp: async (userData: any) => {
    const response = await api.post("/auth/signup", userData);
    return response.data;
  },
  
  forgotPassword: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },
  
  verifyResetToken: async (token: string) => {
    try {
      const response = await api.get(`/auth/verify-reset-token/${token}`);
      return { valid: true, data: response.data };
    } catch (error) {
      console.error("Error verifying reset token:", error);
      return { valid: false, error };
    }
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post("/auth/reset-password", { token, newPassword });
    return response.data;
  },
};

// User service APIs
export const userApi = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put("/users/profile", profileData);
    return response.data;
  },
};

