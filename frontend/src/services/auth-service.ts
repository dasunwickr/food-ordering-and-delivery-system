import axios from 'axios';
import { ForgotPasswordFormData, LoginFormData, NewPasswordFormData, RegistrationFormData } from '@/validators/auth';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { AUTH_API, USER_URL } from '@/services/index';
import { getClientIpAddress } from '@/utils/ip-address';
import { toast } from 'sonner';

// Configure axios defaults for CORS handling
axios.defaults.withCredentials = true;

// Interface for authentication responses
interface AuthResponse {
  message: string;
  userId?: string;
  sessionId?: string;
  token?: string;
  sessionToken?: string; 
  success?: boolean;
  error?: string;
  userType?: string;
}

export async function signIn(data: LoginFormData): Promise<AuthResponse> {
  try {
    // Get IP address and device info using our client service
    const device = navigator.userAgent;
    const ipAddress = await getClientIpAddress();

    // Debug the request payload
    console.log('Sign-in request payload:', {
      email: data.email,
      password: '***hidden***',
      device: device.substring(0, 50) + '...',
      ipAddress
    });

    // Fix: Change endpoint from sign-in to signin to match backend route
    const response = await axios.post<AuthResponse>(`${AUTH_API}/auth/signin`, {
      ...data,
      device,
      ipAddress,
    });

    // Debug log to identify the response structure
    console.log('Auth API Response:', {
      token: response.data.token || response.data.sessionToken, 
      userId: response.data.userId,
      sessionId: response.data.sessionId,
      userType: response.data.userType
    });

    // Extract token properly from response (server sends as either token or sessionToken)
    const token = response.data.token || response.data.sessionToken;
    const userId = response.data.userId;
    const sessionId = response.data.sessionId;
    const userType = response.data.userType;

    // Store auth data in localStorage if we have the essential data
    if (token && userId) {
      // First, store the auth data
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', userId);
        
        if (userType) {
          localStorage.setItem('userType', userType.toLowerCase());
        }
        
        // Also store sessionId if available
        if (sessionId) {
          localStorage.setItem('sessionId', sessionId);
        }
      }

      // Also set cookies for server-side auth (middleware)
      setCookie('authToken', token, { 
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/' 
      });
      setCookie('userId', userId, { 
        maxAge: 30 * 24 * 60 * 60,
        path: '/' 
      });
      
      if (userType) {
        setCookie('userType', userType.toLowerCase(), { 
          maxAge: 30 * 24 * 60 * 60,
          path: '/' 
        });
      }
      
      // Store sessionId in cookie if available
      if (sessionId) {
        setCookie('sessionId', sessionId, { 
          maxAge: 30 * 24 * 60 * 60,
          path: '/' 
        });
      }

      // Fetch user profile data from user service and store it
      try {
        // Use our axios instance from lib/axios instead of direct fetch
        // This ensures consistent headers, error handling, and base URL
        const api = (await import('@/lib/axios')).default;
        const userResponse = await api.get(`${USER_URL}/users/email/${data.email}`);
        
        if (userResponse.data) {
          // Store the complete user profile
          localStorage.setItem('userProfile', JSON.stringify(userResponse.data));
          console.log('User profile data stored in localStorage:', userResponse.data);
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        
        // Fallback approach if the first one fails
        try {
          const fallbackResponse = await axios.get(`${USER_URL}/users/email/${data.email}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (fallbackResponse.data) {
            localStorage.setItem('userProfile', JSON.stringify(fallbackResponse.data));
            console.log('User profile data stored using fallback method:', fallbackResponse.data);
          }
        } catch (fallbackError) {
          console.error('Fallback user profile fetch also failed:', fallbackError);
        }
      }
    } else {
      console.error('Missing essential auth data in response:', response.data);
    }

    // Return original response with normalized token field
    return {
      ...response.data,
      token: token // Ensure token is consistently available in this field
    };
  } catch (error: any) {
    // More detailed error logging and display error with Sonner toast
    if (error.response) {
      console.error('Sign-in error response data:', error.response.data);
      console.error('Sign-in error response status:', error.response.status);
    }
    
    const errorMsg = error.response?.data?.error || error.message;
    toast.error(errorMsg);

    return {
      message: 'Authentication failed',
      error: errorMsg,
    };
  }
}

export async function signUp(data: RegistrationFormData): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/auth/signup`, data);
    return response.data;
  } catch (error: any) {
    // Display error with Sonner toast
    const errorMsg = error.response?.data?.error || error.message;
    toast.error(errorMsg);
    
    return {
      message: 'Registration failed',
      error: errorMsg,
    };
  }
}

// Request password reset
export async function forgotPassword(email: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/auth/forgot-password`, { email });
    return response.data;
  } catch (error: any) {
    // Display error with Sonner toast
    const errorMsg = error.response?.data?.error || error.message;
    toast.error(errorMsg);
    
    return {
      message: 'Failed to process password reset request',
      error: errorMsg,
    };
  }
}

// Verify OTP
export async function verifyOtp(email: string, otp: string): Promise<AuthResponse> {
  try {
    const response = await axios.post<AuthResponse>(`${AUTH_API}/auth/verify-otp`, { email, otp });
    return response.data;
  } catch (error: any) {
    // Display error with Sonner toast
    const errorMsg = error.response?.data?.error || error.message;
    toast.error(errorMsg);
    
    return {
      message: 'OTP verification failed',
      error: errorMsg,
    };
  }
}

// Reset password with OTP
export async function resetPassword(email: string, newPassword: string): Promise<AuthResponse> {
  try {
    // Get IP address using our client service
    const ipAddress = await getClientIpAddress();
    
    const response = await axios.post<AuthResponse>(`${AUTH_API}/auth/reset-password`, {
      email,
      newPassword,
      ipAddress,
    });
    return response.data;
  } catch (error: any) {
    console.error('Reset password error:', error.response?.data || error);
    
    // Display error with Sonner toast
    const errorMsg = error.response?.data?.error || error.message;
    toast.error(errorMsg);
    
    return {
      message: 'Password reset failed',
      error: errorMsg,
    };
  }
}

// Log out user
export function signOut(): void {
  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    localStorage.removeItem('sessionId'); 
  }

  // Clear cookies
  deleteCookie('authToken');
  deleteCookie('userId');
  deleteCookie('userType');
  deleteCookie('sessionId'); 
  
  // Show toast notification for sign out
  toast.success('You have been signed out successfully');
  
  console.log('User signed out');
}

/**
 * Check if the user is authenticated
 * @returns boolean indicating whether the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for auth token in cookie or localStorage
  const token = getCookie('authToken') || localStorage.getItem('authToken');
  return !!token;
};

/**
 * Get the current user's type (admin, customer, restaurant, driver)
 * @returns string representing the user type, or undefined if not found
 */
export const getUserType = (): string | undefined => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  // Try to get user type from cookie first, then fallback to localStorage
  const userType = getCookie('userType') || localStorage.getItem('userType');
  return userType?.toString().toLowerCase();
};

/**
 * Check if the current user has the required user type
 * @param requiredType - Required user type or array of allowed user types
 * @returns boolean indicating whether the user has the required type
 */
export const hasUserType = (requiredType: string | string[]): boolean => {
  const currentUserType = getUserType();
  if (!currentUserType) return false;
  
  if (Array.isArray(requiredType)) {
    return requiredType.map(t => t.toLowerCase()).includes(currentUserType.toLowerCase());
  }
  
  return currentUserType.toLowerCase() === requiredType.toLowerCase();
};

/**
 * Check if an email address already exists in the system
 * @param email - Email address to check
 * @returns Promise with a boolean indicating if the email exists and any error message
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; error?: string }> {
  try {
    // Validate email format first
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        exists: false,
        error: 'Invalid email format'
      };
    }
    
    console.log('Checking if email exists:', email);
    
    // Call the auth service API endpoint
    const response = await axios.get<{ exists: boolean }>(`${AUTH_API}/auth/email/${encodeURIComponent(email)}/exists`);
    
    console.log('Email check response:', response.data);
    
    return {
      exists: response.data.exists,
    };
  } catch (error: any) {
    console.error('Error checking email existence:', error);
    
    // Handle common error cases
    if (error.response) {
      if (error.response.status === 404) {
        // 404 typically means the email doesn't exist
        return { exists: false };
      }
      
      return {
        exists: false,
        error: error.response.data?.message || 'Error checking email'
      };
    }
    
    return {
      exists: false,
      error: error.message || 'Unable to check email existence'
    };
  }
}

/**
 * Check if a route is accessible to the current user
 * @param route - Route to check access for
 * @returns boolean indicating whether the user can access the route
 */
export const canAccessRoute = (route: string): boolean => {
  // Extract the root path segment
  const pathSegment = route.split('/')[1].toLowerCase();
  const userType = getUserType();
  
  // Map of routes to required user types
  const routePermissions: Record<string, string> = {
    'admin': 'admin',
    'customer': 'customer',
    'restaurant': 'restaurant',
    'driver': 'driver',
  };
  
  const requiredType = routePermissions[pathSegment];
  
  // If no specific requirement for this route, or user type matches requirement
  if (!requiredType || !userType) {
    return true;
  }
  
  return userType === requiredType;
};