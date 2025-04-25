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
      
      // Get IP address (in a real app, this would often be captured on the server side)
      let ipAddress = '127.0.0.1';
      try {
        // This is optional and can be removed if you prefer to handle IP on the server
        const ipResponse = await axios.get<{ ip: string }>('https://api.ipify.org?format=json');
        ipAddress = ipResponse.data.ip;
      } catch (err) {
        console.warn('Could not detect IP address, using default');
      }
      
      interface AuthResponse {
        token: string;
        userId: string;
        sessionId: string;
      }
      
      const response = await api.post<AuthResponse>('/auth-service/auth/signin', {
        email,
        password,
        device,
        ipAddress
      });
      
      // Store token in localStorage for authentication
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('sessionId', response.data.sessionId);
      }
      
      return response.data;
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
      // Basic customer data already added to the common profile section
      if ('locationCoordinates' in data && data.locationCoordinates) {
        Object.assign(registrationData.profile, {
          location: data.locationCoordinates
        });
      }
    }
    
    // Send registration data to backend
    const response = await api.post('/auth-service/auth/signup', registrationData);
    return response.data;
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
  }
};

export default userService;