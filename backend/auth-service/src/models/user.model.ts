export interface Admin {
    roleType: string;
  }
  
  export interface Customer {
    orderHistory: string[];
  }
  
  export interface Driver {
    vehicleType: string;
    vehicleNumber: string;
    availabilityStatus: boolean;
    assignedOrders: string[];
  }
  
  export interface RestaurantOwner {
    restaurantName: string;
    restaurantAddress: string;
    restaurantLicenseNumber: string;
    restaurantDocuments: string;
  }
  
  export interface User {
    id?: string;
    firstName: string;
    lastName: string;
    address: string;
    longitude: number;
    latitude: number;
    email: string;
    contactNumber: string;
    userType: 'admin' | 'customer' | 'driver' | 'restaurantOwner';
  }
  
  export type UserWithDetails = User & (Admin | Customer | Driver | RestaurantOwner);
  