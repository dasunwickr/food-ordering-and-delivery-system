import axios from 'axios';
import { ForgotPasswordFormData, LoginFormData, NewPasswordFormData, RegistrationFormData } from '@/validators/auth';
import { getClientIp } from '@/services/client.service';

// Updated API URL configuration to ensure consistent endpoint handling
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const AUTH_API = `${API_URL}/auth-service/auth`;

// Configure axios defaults for CORS handling
axios.defaults.withCredentials = true;

// Interface for authentication responses
interface AuthResponse {
  message: string;
  userId?: string;
  sessionId?: string;
  token?: string;
  success?: boolean;
  error?: string;
  userType?: string;
}

export async function signIn(data: LoginFormData): Promise<AuthResponse> {
  try {
    // Get IP address and device info using our client service
    const device = navigator.userAgent;
    const ipAddress = await getClientIp();

    const response = await axios.post<AuthResponse>(`${AUTH_API}/sign-in`, {
      ...data,
      device,
      ipAddress,
    });

    // Debug log to identify the response structure
    console.log('Auth API Response:', {
      token: response.data.token,
      userId: response.data.userId,
      sessionId: response.data.sessionId,
      userType: response.data.userType
    });

    // Store authentication data
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
        console.log('Stored userId in localStorage:', response.data.userId);
      }
      
      if (response.data.sessionId) {
        localStorage.setItem('sessionId', response.data.sessionId);
        console.log('Stored sessionId in localStorage:', response.data.sessionId);
      } else {
        console.warn('No sessionId in response to store in localStorage');
      }
      
      // Also set cookies for middleware access
      document.cookie = `authToken=${response.data.token}; path=/; samesite=strict;`;
      if (response.data.userType) document.cookie = `userType=${response.data.userType}; path=/; samesite=strict;`;
    }

    return response.data;
  } catch (error: any) {
    return {
      message: 'Authentication failed',
      error: error.response?.data?.error || error.message,
    };
  }
}

export async function signUp(data: RegistrationFormData): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/sign-up`, data);
    return response.data;
  } catch (error: any) {
    return {
      message: 'Registration failed',
      error: error.response?.data?.error || error.message,
    };
  }
}

// Request password reset
export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/forgot-password`, { email });
    return response.data;
  } catch (error: any) {
    return {
      message: 'Failed to process password reset request',
      error: error.response?.data?.error || error.message,
    };
  }
}

// Verify OTP
export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/verify-otp`, { email, otp });
    return response.data;
  } catch (error: any) {
    return {
      message: 'OTP verification failed',
      error: error.response?.data?.error || error.message,
    };
  }
}

// Reset password with OTP
export async function resetPassword(email: string, newPassword: string): Promise<AuthResponse> {
  try {
    // Get IP address using our client service
    const ipAddress = await getClientIp();
    
    const response = await axios.post<AuthResponse>(`${AUTH_API}/reset-password`, {
      email,
      newPassword,
      ipAddress,
    });
    return response.data;
  } catch (error: any) {
    console.error('Reset password error:', error.response?.data || error);
    return {
      message: 'Password reset failed',
      error: error.response?.data?.error || error.message,
    };
  }
}

// Log out user
export function signOut(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('sessionId');
  
  // Clear cookies
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'userType=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

// Check if user is logged in
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken');
}