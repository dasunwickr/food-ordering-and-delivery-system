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

// Extended user interfaces for specific user types
export interface RestaurantUser extends User {
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantLicenseNumber?: string;
  restaurantType?: { id: string; type: string; capacity: number };
  restaurantTypeId?: string;
  cuisineTypes?: Array<{ id: string; name: string }>;
  cuisineTypeIds?: string[];
  restaurantDocuments?: Array<{ name: string; url: string }>;
  location?: { lat: number; lng: number; } | { x: number; y: number; };
  openingTime?: Array<{ 
    day: string; 
    openingTime: string; 
    closingTime: string; 
    isOpen: boolean; 
  }>;
  contactNumber?: string;
  status?: string;
  isActive?: boolean;
}

export interface DriverUser extends User {
  vehicleTypeId?: string;
  vehicleType?: { id: string; type: string; capacity: number } | string;
  vehicleNumber?: string;
  vehicleDocuments?: Array<{ name: string; url: string }>;
  location?: { lat: number; lng: number } | { x: number; y: number };
  driverStatus?: string;
  isActive?: boolean;
  contactNumber?: string;
}

export interface CustomerUser extends User {
  location?: { lat: number; lng: number } | { x: number; y: number };
  contactNumber?: string;
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

/**
 * Geocode an address to get lat/long coordinates
 */
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  if (!address || address.trim() === '') {
    return null;
  }
  
  try {
    // Use the OpenStreetMap Nominatim geocoding service
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
      {
        headers: {
          'Accept': 'application/json',
          // Adding a user-agent to comply with Nominatim usage policy
          'User-Agent': 'food-ordering-and-delivery-system'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

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
      // Check if the user ID is valid
      if (!id || typeof id !== 'string' || id.trim() === '') {
        console.warn('Invalid user ID provided to getUserById:', id);
        return null;
      }

      // First check localStorage for cached user data with this ID
      if (typeof window !== 'undefined') {
        try {
          const cachedUsers = localStorage.getItem(`cachedUser_${id}`);
          if (cachedUsers) {
            console.log(`Using cached data for user ${id}`);
            return JSON.parse(cachedUsers);
          }
        } catch (cacheError) {
          console.warn('Error reading from cache:', cacheError);
        }
      }

      console.log(`Fetching user with ID: ${id}`);
      const response = await api.get<User>(`${USER_URL}/users/${id}`);
      
      // Cache this user for future use
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`cachedUser_${id}`, JSON.stringify(response.data));
        } catch (cacheError) {
          console.warn('Error caching user data:', cacheError);
        }
      }
      
      return response.data;
    } catch (error: any) {
      // Log the error but make it a bit quieter for 404s which are expected in some cases
      if (error.response?.status === 404) {
        console.warn(`User with ID ${id} not found. Creating fallback data.`);
        
        // Create fallback data with placeholder info
        const fallbackUser: User = {
          id: id,
          email: `user-${id.substring(0, 6)}@example.com`,
          firstName: "User",
          lastName: id.substring(0, 6),
          userType: "customer",
          phone: "000-000-0000"
        };
        
        return fallbackUser;
      } else {
        console.error(`Error fetching user with ID ${id}:`, error);
        
        // Still return something to prevent UI crashes
        return {
          id: id,
          email: `unknown@example.com`,
          firstName: "Unknown",
          lastName: "User",
          userType: "customer",
          phone: "000-000-0000"
        };
      }
    }
  },

  // Get driver's current location 
  getDriverCurrentLocation: async (driverId: string): Promise<{lat: number, lng: number} | null> => {
    try {
      const driver = await userService.getUserById(driverId);
      if (driver && 'location' in driver) {
        // Check if we have location data in the expected format
        const location = driver.location as any; // Type assertion to avoid type errors
        if (location) {
          // The location structure in the database may be {x, y} coordinates 
          // or {lat, lng} based on the service implementation
          if (location.lat !== undefined && location.lng !== undefined) {
            return {
              lat: Number(location.lat),
              lng: Number(location.lng)
            };
          } else if (location.x !== undefined && location.y !== undefined) {
            // Convert from {x, y} to {lat, lng} format
            return {
              lat: Number(location.y), // y coordinate maps to latitude
              lng: Number(location.x)  // x coordinate maps to longitude
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.error(`Error fetching driver location for ID ${driverId}:`, error);
      return null;
    }
  },
  // Get vehicle details for a driver
  getDriverVehicleDetails: async (driverId: string): Promise<{type?: string, vehicleNumber?: string} | null> => {
    try {
      const driver = await userService.getUserById(driverId);
      if (driver) {
        // The driver object may have these properties directly, or they might be nested
        const vehicleDetails: {type?: string, vehicleNumber?: string} = {};
        const driverData = driver as any; // Type assertion to handle the dynamic properties
        
        if ('vehicleTypeId' in driverData && driverData.vehicleTypeId && typeof driverData.vehicleTypeId === 'string') {
          try {
            // Try to get the vehicle type from the vehicleTypeId
            const vehicleType = await userService.getVehicleTypeById(driverData.vehicleTypeId);
            if (vehicleType) {
              vehicleDetails.type = vehicleType.type;
            }
          } catch (vehicleTypeError) {
            console.error('Error fetching vehicle type:', vehicleTypeError);
          }
        }
        
        // Also look for direct vehicleType property
        if ('vehicleType' in driverData && driverData.vehicleType) {
          if (typeof driverData.vehicleType === 'string') {
            vehicleDetails.type = driverData.vehicleType;
          } else if (typeof driverData.vehicleType === 'object' && driverData.vehicleType !== null) {
            // It might be a reference to the VehicleType object
            const vehicleType = driverData.vehicleType as any;
            if ('type' in vehicleType) {
              vehicleDetails.type = String(vehicleType.type);
            }
          }
        }
        
        // Get the vehicle number (license plate)
        if ('vehicleNumber' in driverData && driverData.vehicleNumber) {
          vehicleDetails.vehicleNumber = String(driverData.vehicleNumber);
        }
        
        return Object.keys(vehicleDetails).length > 0 ? vehicleDetails : null;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching vehicle details for driver ID ${driverId}:`, error);
      return null;
    }
  },
  
  // Get a specific vehicle type by ID
  getVehicleTypeById: async (vehicleTypeId: string): Promise<VehicleType | null> => {
    try {
      const response = await api.get<VehicleType>(`${USER_URL}/vehicle-types/${vehicleTypeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching vehicle type with ID ${vehicleTypeId}:`, error);
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
    try {
      console.log('Updating profile image for user:', userId);
      console.log('New image URL:', imageUrl);
      
      // Get userType from localStorage if available
      const userType = typeof window !== 'undefined' ? localStorage.getItem('userType') : null;
      
      // Construct URL with query parameter instead of sending a JSON request body
      const url = `${USER_URL}/users/${userId}/profile-picture?profilePictureUrl=${encodeURIComponent(imageUrl)}`;
      
      if (userType) {
        console.log('Including userType in request:', userType.toUpperCase());
      }
      
      console.log('Sending profile image update request to:', url);
      const response = await api.put<User>(url);
      console.log('Profile image update successful:', response.data);
      
      // Update the cached profile data in localStorage
      if (response.data && typeof window !== 'undefined') {
        try {
          const userProfile = localStorage.getItem('userProfile');
          if (userProfile) {
            const profile = JSON.parse(userProfile);
            profile.profilePicture = imageUrl;
            profile.profilePictureUrl = imageUrl;
            profile.profileImage = imageUrl;
            localStorage.setItem('userProfile', JSON.stringify(profile));
            console.log('Updated profile image in localStorage');
          }
        } catch (e) {
          console.error('Error updating profile image in localStorage:', e);
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile image:', error);
      if (error.response?.data) {
        console.error('Error details:', error.response.data);
      }
      throw error;
    }
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
