import api from '@/lib/axios';
import axios from 'axios';

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

// User related API calls
export const userService = {
  // Get the current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/users/me');
    return response.data;
  },

  // User login
  login: async (email: string, password: string): Promise<any> => {
    try {
      // Get device info
      const device = navigator.userAgent;
      
      interface AuthResponse {
        token: string;
        userId: string;
        sessionId: string;
        userType?: string;
      }
      
      const response = await api.post<AuthResponse>('/auth-service/auth/signin', {
        email,
        password,
        device,
        ipAddress: "127.0.0.1" // TODO: Replace with actual IP fetching logic
      });
      
      console.log('Auth response in user-service:', response.data);
      // Check if we're getting sessionId in the response
      if (response.data.sessionId) {
        console.log('SessionId received:', response.data.sessionId);
      } else {
        console.warn('No sessionId received in response:', response.data);
        // Check if it exists under a different property name
        console.log('Full response properties:', Object.keys(response.data));
      }
      
      const result = { ...response.data };
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        
        // Try to store sessionId if it exists
        if (response.data.sessionId) {
          localStorage.setItem('sessionId', response.data.sessionId);
          console.log('SessionId stored in localStorage:', response.data.sessionId);
        } else {
          console.warn('No sessionId available to store in localStorage');
        }
        
        // Get the user type after login
        try {
          interface UserResponse {
            userType: string;
            [key: string]: any;
          }
          
          const userResponse = await api.get<UserResponse>(`/user-service/users/email/${email}`);
          console.log('User response:', userResponse.data);
          
          if (userResponse.data && userResponse.data.userType) {
            result.userType = userResponse.data.userType;
            // Store standardized lowercase version
            const normalizedUserType = userResponse.data.userType.toLowerCase();
            result.userType = normalizedUserType;
            localStorage.setItem('userType', normalizedUserType);
          }
        } catch (userError) {
          console.error('Error fetching user details:', userError);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  // Logout function
  logout: async (): Promise<void> => {
    // Get the session ID to invalidate
    const sessionId = localStorage.getItem('sessionId');
    
    // Remove auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userType');
    
    // Remove cookies as well
    if (typeof document !== 'undefined') {
      // Use js-cookie if imported
      if (typeof window.Cookies !== 'undefined') {
        window.Cookies.remove('authToken');
        window.Cookies.remove('userId');
        window.Cookies.remove('sessionId');
        window.Cookies.remove('userType');
      } else {
        // Fallback to document.cookie
        document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'userType=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
    
    // Call backend to invalidate session
    if (sessionId) {
      try {
        await api.post('/session-service/api/sessions/invalidate', { sessionId });
      } catch (err) {
        console.error('Error invalidating session:', err);
      }
    }
  },

  // Get all cuisine types
  getCuisineTypes: async (): Promise<CuisineType[]> => {
    const response = await api.get<CuisineType[]>('/user-service/cuisine-types');
    return response.data;
  },

  // Get all restaurant types
  getRestaurantTypes: async (): Promise<RestaurantType[]> => {
    const response = await api.get<RestaurantType[]>('/user-service/restaurant-types');
    return response.data;
  },

  // Get all vehicle types for drivers
  getVehicleTypes: async (): Promise<VehicleType[]> => {
    const response = await api.get<VehicleType[]>('/user-service/vehicle-types');
    return response.data;
  },
  
  // Get all admin users
  getAdmins: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/user-service/users/type/ADMIN');
      return response.data;
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  },

  // Get all admin users
  getRestaurants: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/user-service/users/type/RESTAURANT');
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  },
  
  // Get all driver users
  getDrivers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/user-service/users/type/DRIVER');
      return response.data;
    } catch (error) {
      console.error('Error fetching drivers:', error);
      throw error;
    }
  },

  // Get all customer users
  getCustomers: async (): Promise<User[]> => {
    try {
      const response = await api.get<User[]>('/user-service/users/type/CUSTOMER');
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  },
  
  register: async (data: CustomerRegistrationData | RestaurantRegistrationData | DriverRegistrationData, userType: 'customer' | 'restaurant' | 'driver'): Promise<any> => {
    // Prepare the registration data for the backend
    const registrationData = {
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
    
    // Add type-specific data to the profile
    if (userType === 'restaurant' && 'restaurantName' in data) {
      Object.assign(registrationData.profile, {
        restaurantName: data.restaurantName,
        restaurantLicenseNumber: data.licenseNumber,
        restaurantTypeId: data.restaurantTypeId,
        cuisineTypeIds: data.cuisineTypeIds,
        restaurantDocuments: data.documents, // Backend expects restaurantDocuments
        restaurantAddress: data.location,
        location: data.locationCoordinates,
        // Ensure this matches the backend schema
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
        vehicleDocuments: data.documents, // Backend expects vehicleDocuments
        location: data.locationCoordinates
      });
    } else if (userType === 'customer') {
      // Basic customer data already added to the common profile section
      if ('locationCoordinates' in data && data.locationCoordinates) {
        Object.assign(registrationData.profile, {
          location: data.locationCoordinates
        });
      }
    }
    
    try {
      // Send registration data to backend
      const response = await api.post('/auth-service/auth/signup', registrationData);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error);
      throw error;
    }
  },
  
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/api/users', userData);
    return response.data;
  },
  
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/users/${id}`, userData);
    return response.data;
  },
  
  updateProfileImage: async (userId: string, imageUrl: string): Promise<User> => {
    const response = await api.put<User>(`/api/users/${userId}/profile-picture`, { profilePictureUrl: imageUrl });
    return response.data;
  },
  
  // Delete a user
  deleteUser: async (userId: string, userType: string): Promise<void> => {
    try {
      await api.request({
        method: 'DELETE',
        url: `/user-service/users/${userId}`,
        data: { userType: userType.toUpperCase() }
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default userService;