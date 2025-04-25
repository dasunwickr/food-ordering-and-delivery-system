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

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  phone?: string;
  userType: 'admin' | 'customer' | 'restaurant' | 'driver';
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