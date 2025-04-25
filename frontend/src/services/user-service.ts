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

  // Register a new user (customer, restaurant, or driver)
  register: async (data: CustomerRegistrationData | RestaurantRegistrationData | DriverRegistrationData, userType: 'customer' | 'restaurant' | 'driver'): Promise<any> => {
    // Format data according to API expectations
    let formattedData: any = {
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

    // Add user type specific fields
    if (userType === 'restaurant') {
      const restaurantData = data as RestaurantRegistrationData;
      
      // Format operating hours to match the API expectations
      const formattedOperatingHours = restaurantData.operatingHours.map(hour => ({
        day: hour.day.charAt(0).toUpperCase() + hour.day.slice(1), // Capitalize first letter
        openingTime: hour.openTime,
        closingTime: hour.closeTime,
        isOpen: hour.isOpen
      }));

      // Handle location data
      const locationObj = restaurantData.locationCoordinates || { lat: 0, lng: 0 };

      // Add restaurant-specific fields to the profile
      formattedData.profile = {
        ...formattedData.profile,
        restaurantName: restaurantData.restaurantName,
        restaurantLicenseNumber: restaurantData.licenseNumber,
        restaurantTypeId: restaurantData.restaurantTypeId,
        cuisineTypeIds: restaurantData.cuisineTypeIds,
        restaurantDocuments: restaurantData.documents,
        restaurantAddress: restaurantData.location,
        location: locationObj,
        openingTime: formattedOperatingHours,
      };
    } 
    else if (userType === 'driver') {
      const driverData = data as DriverRegistrationData;
      
      // Handle location data
      const locationObj = driverData.locationCoordinates || { lat: 0, lng: 0 };

      // Add driver-specific fields to the profile
      formattedData.profile = {
        ...formattedData.profile,
        vehicleTypeId: driverData.vehicleTypeId,
        vehicleNumber: driverData.licensePlate,
        vehicleDocuments: driverData.documents,
        location: locationObj,
        driverStatus: "OFFLINE" 
      };
    }
    else if (userType === 'customer') {
      const customerData = data as CustomerRegistrationData;
      
      // Handle optional location data if present
      if (customerData.locationCoordinates) {
        formattedData.profile.location = customerData.locationCoordinates;
      }
    }

    console.log('Registration data:', formattedData);
    
    try {
      // Fix the endpoint path to match API gateway configuration
      const response = await api.post('/auth-service/auth/signup', formattedData);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<User>('/api/users', userData);
    return response.data;
  },

  // Update user profile
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/api/users/${id}`, userData);
    return response.data;
  },

  // Update profile image
  updateProfileImage: async (userId: string, imageUrl: string): Promise<User> => {
    const response = await api.patch<User>(`/api/users/${userId}/profile-image`, { profileImage: imageUrl });
    return response.data;
  }
};

export default userService;