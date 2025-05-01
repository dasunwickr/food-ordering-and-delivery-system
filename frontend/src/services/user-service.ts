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


export interface ExtendedUserData extends Partial<User> {
  location?: { lat: number; lng: number; address?: string };
  locationCoordinates?: { lat: number; lng: number; address?: string };
  [key: string]: any;
}

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
        }
      }
      
      return null;
    }
  },

 
  getUserById: async (id: string): Promise<User | null> => {
    try {
      const response = await api.get<User>(`${USER_URL}/users/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user with ID ${id}:`, error);
      return null;
    }
  },

 
  login: async (email: string, password: string): Promise<any> => {
    try {
      try {
        console.log(`Checking if email exists before login: ${email}`);
        // Use only the auth-service endpoint for email existence check
        const emailCheckResponse = await api.get<{ exists: boolean }>(`${AUTH_API}/auth/email/${email}/exists`);
        if (!emailCheckResponse.data.exists) {
          // If email doesn't exist, throw a specific error that the UI can handle nicely
          throw new Error('No account found with this email. Please create an account first.');
        }
      } catch (checkError: any) {
        // Only throw if it's specifically a "no account found" error
        if (checkError.message && checkError.message.includes('No account found')) {
          throw checkError;
        }
        // Otherwise continue with login attempt - this handles cases where the email check endpoint fails
      }

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
      
      // Handle specific error cases for better user experience
      if (error.message && error.message.includes('No account found')) {
        throw new Error('No account found with this email. Please sign up first.');
      } else if (error.response?.status === 401 || 
                (error.response?.data?.error && error.response?.data?.error.includes('Invalid credentials'))) {
        throw new Error('Invalid email or password. Please check your credentials.');
      }
      
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
      // Check if email already exists before registration - use only auth-service endpoint
      try {
        console.log(`Checking if email exists before registration: ${data.email}`);
        const authCheckResponse = await api.get<{ exists: boolean }>(`${AUTH_API}/auth/email/${data.email}/exists`);
        if (authCheckResponse.data && authCheckResponse.data.exists) {
          throw new Error('This email is already registered.');
        }
      } catch (checkError: any) {
        if (checkError.message && checkError.message.includes('This email is already registered')) {
          throw checkError;
        }
      }

      const response = await api.post(`${AUTH_API}/auth/signup`, registrationData);

      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/sign-in';
      }

      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed. Please try again.';

      if (errorMessage.includes('Email already exists') || errorMessage.includes('already in use') || errorMessage.includes('already registered') || error.response?.status === 409) {
        throw new Error('This email is already registered.');
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
      const currentUser = await api.get<User>(`${USER_URL}/users/${id}`);
      console.log('Current user data:', currentUser.data);
      
      // Create a properly formatted user data object that matches the backend expectations
      const mergedUserData: any = { ...currentUser.data };
      
      // Get userType from localStorage if available
      const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
      if (userType) {
        mergedUserData.userType = userType.toUpperCase();
        console.log('Adding userType from localStorage:', userType.toUpperCase());
      }
      
      // Map standard user fields
      Object.keys(userData).forEach(key => {
        if (key !== 'location' && key !== 'locationCoordinates') {
          mergedUserData[key] = (userData as any)[key];
        }
      });
      
      // Handle phone/contactNumber mapping
      if ('phone' in userData) {
        mergedUserData.contactNumber = userData.phone;
      }
      
      // Handle location data properly according to backend format
      if ('location' in userData && userData.location) {
        console.log('Location data detected in update:', userData.location);
        
        // For CUSTOMER user type, format location as {x, y} instead of {lng, lat}
        mergedUserData.location = {
          x: userData.location.lng,
          y: userData.location.lat 
        };
        
        // If an address is provided, add it to the location data
        if ('address' in userData.location) {
          mergedUserData.locationAddress = userData.location.address;
        }
      } else if ('locationCoordinates' in userData && userData.locationCoordinates) {
        // Alternative location format handling
        mergedUserData.location = {
          x: userData.locationCoordinates.lng,
          y: userData.locationCoordinates.lat
        };
        
        if ('address' in userData.locationCoordinates) {
          mergedUserData.locationAddress = userData.locationCoordinates.address;
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
      
      try {
        await api.delete(`${AUTH_API}/auth/users/${userId}`);
        console.log('Auth details also deleted for user:', userId);
      } catch (authError) {
        console.error('Error deleting auth details:', authError);
      }
      
      try {
        await api.post(`${API_URL}/session-service/sessions/invalidate/user/${userId}`);
        console.log('User sessions invalidated for deleted user:', userId);
      } catch (sessionError) {
        console.error('Error invalidating sessions for deleted user:', sessionError);
      }
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
      const clientInfo = await getClientIdentifier();

      const user = await userService.getCurrentUser();
      if (!user || !user.email) {
        throw new Error('Unable to retrieve current user information');
      }
      
      try {
        await api.post(`${AUTH_API}/auth/signin`, {
          email: user.email,
          password: currentPassword,
          device: clientInfo.userAgent,
          ipAddress: clientInfo.ip
        });
      } catch (error: any) {
        console.error('Password verification failed:', error);
        throw new Error('Current password is incorrect');
      }
      
      
      try {
        await api.post(`${AUTH_API}/auth/change-password`, {
          userId,
          currentPassword,
          newPassword,
          device: clientInfo.userAgent,
          ipAddress: clientInfo.ip
        });
      } catch (error: any) {
        console.error('Error changing password:', error);
        
        throw new Error('Password change functionality is not properly configured on the server. Please contact administrator.');
      }
      
      console.log('Password reset successful');
      
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
  },

  // Check if email exists
  checkEmailExists: async (email: string): Promise<boolean> => {
    console.log(`Checking if email exists: ${email}`);
    try {
      // Use only the auth-service endpoint with properly encoded email
      const encodedEmail = encodeURIComponent(email.trim());
      const authResponse = await api.get<{ exists: boolean }>(`${AUTH_API}/auth/email/${encodedEmail}/exists`);
      return authResponse.data.exists;
    } catch (error) {
      console.error('Error checking email existence with auth-service:', error);
      // If the check fails, return false to allow the operation to continue
      // The server-side validation will catch any conflicts
      return false;
    }
  }
};

export default userService;
