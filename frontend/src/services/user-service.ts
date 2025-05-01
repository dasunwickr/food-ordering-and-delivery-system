import api from '@/lib/axios';
import { setCookie } from 'cookies-next';
import { API_URL, AUTH_API, USER_URL } from '@/services/index';
import { getClientIdentifier } from '@/utils/ip-address';

// Types
export interface CuisineType {
  id: string;
  name: string;
}

export interface RestaurantType {
  id: string;
  type: string;
  capacity: number;
}

export interface VehicleType {
  id: string;
  type: string;
  capacity: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  phone?: string;
  userType: 'admin' | 'customer' | 'restaurant' | 'driver';
}

// Registration types
export interface RegisterCommonData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  profilePictureUrl?: string | null;
}

export interface RestaurantRegistrationData extends RegisterCommonData {
  restaurantName: string;
  licenseNumber: string;
  restaurantTypeId: string;
  cuisineTypeIds: string[];
  operatingHours: Array<{
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  }>;
  documents: Array<{
    name: string;
    url: string;
  }>;
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DriverRegistrationData extends RegisterCommonData {
  vehicleTypeId: string;
  licensePlate: string;
  documents: Array<{
    name: string;
    url: string;
  }>;
  location: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface CustomerRegistrationData extends RegisterCommonData {
  location?: string;
  locationCoordinates?: {
    lat: number;
    lng: number;
  };
}

// Extended user type with location for internal use
export interface ExtendedUserData extends Partial<User> {
  location?: { lat: number; lng: number; address?: string };
  locationCoordinates?: { lat: number; lng: number; address?: string };
  [key: string]: any;
}

// User related API calls
export const userService = {
  // Get the current user profile
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Get userId from localStorage or cookie
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      
      if (!userId) {
        console.log('No userId found in localStorage or cookies');
        return null;
      }
      
      // Debug the request before sending
      console.log(`Fetching user with ID: ${userId}`);

      // Use proper API path based on our Nginx config
      const response = await api.get<User>(`${USER_URL}/users/${userId}`);
      
      // If successful, also store in localStorage for offline access
      if (response.data && typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error fetching current user:', error);
      
      // Check if we have user data in localStorage as fallback
      if (typeof window !== 'undefined') {
        try {
          const userProfile = localStorage.getItem('userProfile');
          if (userProfile) {
            console.log('Using cached userProfile from localStorage');
            return JSON.parse(userProfile) as User;
          }
        } catch (e) {
          console.error('Error parsing userProfile from localStorage:', e);
        }
      }
      
      // If this is a 404, the user ID might be invalid or the user service might be down
      if (error.response && error.response.status === 404) {
        console.error('User not found or user service unavailable');
        // Clear potentially invalid user ID
        if (typeof window !== 'undefined') {
          // Don't automatically clear - this could be a temporary service outage
          // localStorage.removeItem('userId');
        }
      }
      
      return null;
    }
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const response = await api.get<User>(`${USER_URL}/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  },

  // User login
  login: async (email: string, password: string): Promise<any> => {
    try {
      const clientInfo = await getClientIdentifier();

      interface AuthResponse {
        token: string;
        sessionToken?: string;
        userId: string;
        sessionId?: string;
        userType?: string;
      }

      const response = await api.post<AuthResponse>(`${AUTH_API}/auth/signin`, {
        email,
        password,
        device: clientInfo.userAgent,
        ipAddress: clientInfo.ip
      });

      console.log('Auth response in user-service:', response.data);

      const token = response.data.token || response.data.sessionToken;
      const sessionId = response.data.sessionId;
      const authServiceUserId = response.data.userId;
      const userType = response.data.userType?.toLowerCase();

      if (!token || !authServiceUserId) {
        throw new Error('Invalid authentication response');
      }

      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
        localStorage.setItem('userId', authServiceUserId);
        if (userType) {
          localStorage.setItem('userType', userType);
        }
        if (sessionId) {
          localStorage.setItem('sessionId', sessionId);
        }
      }

      // Set cookies
      setCookie('authToken', token, { maxAge: 30 * 24 * 60 * 60, path: '/' });
      setCookie('userId', authServiceUserId, { maxAge: 30 * 24 * 60 * 60, path: '/' });
      if (userType) {
        setCookie('userType', userType, { maxAge: 30 * 24 * 60 * 60, path: '/' });
      }
      if (sessionId) {
        setCookie('sessionId', sessionId, { maxAge: 30 * 24 * 60 * 60, path: '/' });
      }

      // Fetch user profile for additional data but don't overwrite critical auth info
      try {
        const userResponse = await api.get(`${USER_URL}/users/email/${email}`);
        if (userResponse.data) {
          localStorage.setItem('userProfile', JSON.stringify(userResponse.data));
        }
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue even if profile fetch fails - we have the essential auth data
      }

      return {
        ...response.data,
        userType: userType // Ensure we return the normalized userType
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      
      if (sessionId) {
        try {
          await api.post('/session-service/sessions/invalidate', { sessionId });
          console.log('Session invalidated');
        } catch (sessionError) {
          console.error('Error invalidating session:', sessionError);
          // Continue with logout even if session invalidation fails
        }
      }

      if (typeof window !== 'undefined') {
        // Clear auth data from localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        localStorage.removeItem('sessionId');
        // Clear user profile data
        localStorage.removeItem('userProfile');
      }

      // Clear cookies
      document.cookie = 'authToken=; Max-Age=0; path=/;';
      document.cookie = 'userId=; Max-Age=0; path=/;';
      document.cookie = 'userType=; Max-Age=0; path=/;';
      document.cookie = 'sessionId=; Max-Age=0; path=/;';
    } catch (err) {
      console.error('Error during logout:', err);
    }
  },

  getCuisineTypes: async (): Promise<CuisineType[]> => {
    try {
      const response = await api.get<CuisineType[]>(`${USER_URL}/cuisine-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cuisine types:', error);
      throw error;
    }
  },

  getRestaurantTypes: async (): Promise<RestaurantType[]> => {
    try {
      const response = await api.get<RestaurantType[]>(`${USER_URL}/restaurant-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant types:', error);
      throw error;
    }
  },

  getVehicleTypes: async (): Promise<VehicleType[]> => {
    try {
      const response = await api.get<VehicleType[]>(`${USER_URL}/vehicle-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
      throw error;
    }
  },

  getAdmins: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`${USER_URL}/users/type/ADMIN`);
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  getRestaurants: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`${USER_URL}/users/type/RESTAURANT`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },

  getDrivers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`${USER_URL}/users/type/DRIVER`);
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  getCustomers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>(`${USER_URL}/users/type/CUSTOMER`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },

  register: async (data: CustomerRegistrationData | RestaurantRegistrationData | DriverRegistrationData, userType: 'customer' | 'restaurant' | 'driver'): Promise<any> => {
    const registrationData: any = {
      email: data.email,
      password: data.password,
      userType: userType.toUpperCase(),
      profile: {
        firstName: data.firstName,
        lastName: data.lastName,
        contactNumber: data.phone,
        profilePictureUrl: data.profilePictureUrl || undefined,
      }
    };

    if (userType === 'restaurant' && 'restaurantName' in data) {
      Object.assign(registrationData.profile, {
        restaurantName: data.restaurantName,
        restaurantLicenseNumber: data.licenseNumber,
        restaurantTypeId: data.restaurantTypeId,
        cuisineTypeIds: data.cuisineTypeIds,
        restaurantDocuments: data.documents,
        restaurantAddress: data.location,
        location: data.locationCoordinates,
        openingTime: data.operatingHours.map(hours => ({
          day: hours.day,
          openingTime: hours.openTime,
          closingTime: hours.closeTime,
          isOpen: hours.isOpen
        }))
      });
    } else if (userType === 'driver' && 'vehicleTypeId' in data) {
      Object.assign(registrationData.profile, {
        vehicleTypeId: data.vehicleTypeId,
        vehicleNumber: data.licensePlate,
        vehicleDocuments: data.documents,
        location: data.locationCoordinates
      });
    } else if (userType === 'customer') {
      if ('locationCoordinates' in data && data.locationCoordinates) {
        Object.assign(registrationData.profile, {
          location: data.locationCoordinates
        });
      }
    }

    try {
      try {
        interface EmailExistsResponse {
          exists: boolean;
        }
        const checkResponse = await api.get<EmailExistsResponse>(`${USER_URL}/users/email/${data.email}/exists`);
        if (checkResponse.data && checkResponse.data.exists) {
          throw new Error('This email is already registered. <a href="/sign-in" className="text-blue-600 hover:underline">Sign in instead?</a>');
        }
      } catch (checkError: any) {
        if (checkError.message.includes('This email is already registered')) {
          throw checkError;
        }
      }

      // Fix: Update the signup endpoint to use the correct API path
      const response = await api.post(`${AUTH_API}/auth/signup`, registrationData);

      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/sign-in';
      }

      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed. Please try again.';

      if (errorMessage.includes('Email already exists') || errorMessage.includes('already in use') || error.response?.status === 409) {
        throw new Error('This email is already registered. <a href="/sign-in" class="text-blue-600 hover:underline">Sign in instead?</a>');
      }

      throw new Error(errorMessage);
    }
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>(`${USER_URL}/users`, userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User> | ExtendedUserData): Promise<User> => {
    console.log('Updating user with data:', userData);
    
    try {
      // First, get the existing user to ensure we have the complete object
      const currentUser = await api.get<User>(`${USER_URL}/users/${id}`);
      console.log('Current user data:', currentUser.data);
      
      // Create a merged object with current data plus updates
      const mergedUserData = { ...currentUser.data };
      
      // Update the merged object with the new data
      Object.keys(userData).forEach(key => {
        if (key !== 'location') {
          (mergedUserData as any)[key] = (userData as any)[key];
        }
      });
      
      // Special handling for location data
      if ('location' in userData && userData.location) {
        console.log('Location data detected in update:', userData.location);
        
        // Customer location in Spring Data expects a Point object format
        if (mergedUserData.userType?.toUpperCase() === 'CUSTOMER') {
          (mergedUserData as any).location = {
            x: userData.location.lng,
            y: userData.location.lat
          };
          
          // Store the address in a separate field for UI display
          if ('address' in userData.location) {
            (mergedUserData as any).locationAddress = userData.location.address;
          }
        }
      }
      
      console.log('Sending updated user data to backend:', mergedUserData);
      const response = await api.put<User>(`${USER_URL}/users/${id}`, mergedUserData);
      console.log('User update successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
      throw error;
    }
  },

  updateProfileImage: async (userId: string, imageUrl: string): Promise<User> => {
    const response = await api.put<User>(`${USER_URL}/users/${userId}/profile-picture`, { profilePictureUrl: imageUrl });
    return response.data;
  },

  deleteUser: async (userId: string, userType: string): Promise<void> => {
    try {
      await api.request({ method: 'DELETE', url: `${USER_URL}/users/${userId}`, data: { userType: userType.toUpperCase() } });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  createRestaurantType: async (restaurantType: Omit<RestaurantType, 'id'>): Promise<RestaurantType> => {
    try {
      const response = await api.post<RestaurantType>(`${USER_URL}/restaurant-types`, restaurantType);
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant type:', error);
      throw error;
    }
  },

  updateRestaurantType: async (restaurantType: RestaurantType): Promise<RestaurantType> => {
    try {
      const response = await api.put<RestaurantType>(`${USER_URL}/restaurant-types/${restaurantType.id}`, { type: restaurantType.type, capacity: restaurantType.capacity });
      return response.data;
    } catch (error) {
      console.error('Error updating restaurant type:', error);
      throw error;
    }
  },

  deleteRestaurantType: async (id: string): Promise<void> => {
    try {
      await api.delete(`${USER_URL}/restaurant-types/${id}`);
    } catch (error) {
      console.error('Error deleting restaurant type:', error);
      throw error;
    }
  },

  resetPassword: async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Get device info and IP address for security logging
      const clientInfo = await getClientIdentifier();

      // First, get the user's email
      const user = await userService.getCurrentUser();
      if (!user || !user.email) {
        throw new Error('Unable to retrieve current user information');
      }
      
      // Verify current password by attempting a login (but don't store the new tokens)
      try {
        await api.post(`${AUTH_API}/auth/signin`, {
          email: user.email,
          password: currentPassword,
          device: clientInfo.userAgent,
          ipAddress: clientInfo.ip
        });
        // If we get here, password was correct
      } catch (error: any) {
        // If login fails, the current password is incorrect
        console.error('Password verification failed:', error);
        throw new Error('Current password is incorrect');
      }
      
      // For an authenticated user changing their own password
      // We need to use a different approach than the OTP-based reset-password
      // Since we don't have a specific endpoint for authenticated password changes,
      // we'll need to directly update the user in the auth service
      
      try {
        // Call custom endpoint for authenticated user password change
        await api.post(`${AUTH_API}/auth/change-password`, {
          userId,
          currentPassword,
          newPassword,
          device: clientInfo.userAgent,
          ipAddress: clientInfo.ip
        });
      } catch (error: any) {
        console.error('Error changing password:', error);
        
        // If this specific endpoint doesn't exist, we need to create it on the backend
        // For now, show a more helpful error message
        throw new Error('Password change functionality is not properly configured on the server. Please contact administrator.');
      }
      
      console.log('Password reset successful');
      
      // Invalidate other sessions for security
      try {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          try {
            await api.post(`${AUTH_API}/auth/invalidate-other-sessions`, { 
              userId, 
              sessionId,
              ipAddress: clientInfo.ip
            });
            console.log('Other sessions invalidated for security');
          } catch (otherError) {
            // Try alternative endpoint
            await api.post(`${API_URL}/session-service/sessions/invalidate/other`, {
              userId,
              ipAddress: clientInfo.ip
            });
            console.log('Other sessions invalidated for security (alternative endpoint)');
          }
        }
      } catch (sessionError) {
        console.error('Error invalidating other sessions:', sessionError);
        // Continue even if session invalidation fails
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      if (error.response?.status === 401) {
        throw new Error('Current password is incorrect');
      }
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Password reset failed. Please try again.');
    }
  },

  // Change password for authenticated users
  changePassword: async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // Get device info and IP address for security logging
      const clientInfo = await getClientIdentifier();

      // Call the backend endpoint for changing the password
      await api.post(`${AUTH_API}/auth/change-password`, {
        userId,
        currentPassword,
        newPassword,
        device: clientInfo.userAgent,
        ipAddress: clientInfo.ip
      });

      console.log('Password change successful');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        throw new Error('Current password is incorrect');
      }
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Password change failed. Please try again.');
    }
  },

  createVehicleType: async (vehicleType: Omit<VehicleType, 'id'>): Promise<VehicleType> => {
    try {
      const response = await api.post<VehicleType>(`${USER_URL}/vehicle-types`, vehicleType);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      throw error;
    }
  },

  updateVehicleType: async (vehicleType: VehicleType): Promise<VehicleType> => {
    try {
      const response = await api.put<VehicleType>(`${USER_URL}/vehicle-types/${vehicleType.id}`, { type: vehicleType.type, capacity: vehicleType.capacity });
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      throw error;
    }
  },

  deleteVehicleType: async (id: string): Promise<void> => {
    try {
      await api.delete(`${USER_URL}/vehicle-types/${id}`);
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
      throw error;
    }
  },

  createCuisineType: async (cuisineType: Omit<CuisineType, 'id'>): Promise<CuisineType> => {
    try {
      const response = await api.post<CuisineType>(`${USER_URL}/cuisine-types`, cuisineType);
      return response.data;
    } catch (error) {
      console.error('Error creating cuisine type:', error);
      throw error;
    }
  },

  updateCuisineType: async (cuisineType: CuisineType): Promise<CuisineType> => {
    try {
      const response = await api.put<CuisineType>(`${USER_URL}/cuisine-types/${cuisineType.id}`, { name: cuisineType.name });
      return response.data;
    } catch (error) {
      console.error('Error updating cuisine type:', error);
      throw error;
    }
  },

  deleteCuisineType: async (id: string): Promise<void> => {
    try {
      await api.delete(`${USER_URL}/cuisine-types/${id}`);
    } catch (error) {
      console.error('Error deleting cuisine type:', error);
      throw error;
    }
  }
};

export default userService;
