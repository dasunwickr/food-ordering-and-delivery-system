import api from '@/lib/axios';
import { userService } from './user-service';

export interface DeliveryStatus {
  PENDING: 'PENDING';
  ACCEPTED: 'ACCEPTED';
  IN_PROGRESS: 'IN_PROGRESS';
  DELIVERED: 'DELIVERED';
  CANCELLED: 'CANCELLED';
}

export interface IDelivery {
  _id?: string;
  orderId: string;
  driverId?: string;
  status: keyof DeliveryStatus;
  acceptedAt?: string;
  deliveredAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderDetails {
  customerId: string;
  customerDetails?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    contact?: string;
  };
  restaurantId: string;
  cartItems?: Array<{
    itemName?: string;
    quantity?: number;
    price?: number;
  }>;
  orderTotal?: number;
  deliveryFee?: number;
  totalAmount?: number;
  driverDetails?: {
    driverId?: string;
    driverName?: string;
    vehicleNumber?: string;
    latitude?: number;
    longitude?: number;
  };
  orderStatus?: string;
  [key: string]: unknown;
}

/**
 * Get all deliveries
 */
export const getAllDeliveries = async (): Promise<IDelivery[]> => {
  try {
    const response = await api.get<IDelivery[]>('/delivery-service/', {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch deliveries:', error);
    throw new Error('Failed to fetch deliveries');
  }
};

/**
 * Get deliveries for a specific customer
 */
export const getDeliveriesByCustomerId = async (customerId: string): Promise<IDelivery[]> => {
  try {
    const response = await api.get<IDelivery[]>(`/delivery-service/customer/${customerId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch customer deliveries:', error);
    throw new Error('Failed to fetch customer deliveries');
  }
};

/**
 * Get deliveries for a specific driver
 */
export const getDeliveriesByDriverId = async (driverId: string): Promise<IDelivery[]> => {
  try {
    const response = await api.get<IDelivery[]>(`/delivery-service/driver/${driverId}`, {
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch driver deliveries:', error);
    throw new Error('Failed to fetch driver deliveries');
  }
};

/**
 * Get deliveries for a specific restaurant
 */
export const getDeliveriesByRestaurantId = async (restaurantId: string): Promise<IDelivery[]> => {
  try {
    console.log(`Fetching deliveries for restaurant ID: ${restaurantId}`);
    const apiUrl = `/delivery-service/restaurant/${restaurantId}`;
    
    // Log axios configuration for debugging
    console.log('Axios config:', {
      baseURL: api.defaults.baseURL,
      headers: api.defaults.headers,
      timeout: api.defaults.timeout
    });
    
    // Include credentials for authentication cookies
    const response = await api.get<IDelivery[]>(apiUrl, {
      withCredentials: true,
      // Try to bypass cache to get fresh data
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    console.log('Restaurant deliveries response:', response);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to fetch restaurant deliveries:', error);
    
    // Enhanced error logging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    throw new Error(`Failed to fetch restaurant deliveries: ${error.message}`);
  }
};

/**
 * Get a specific delivery by ID
 */
export const getDeliveryById = async (deliveryId: string): Promise<IDelivery> => {
  try {
    const response = await api.get<IDelivery>(`/delivery-service/${deliveryId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch delivery:', error);
    throw new Error('Failed to fetch delivery');
  }
};

/**
 * Get delivery with order details
 */
export const getDeliveryWithOrderDetails = async (deliveryId: string): Promise<{ delivery: IDelivery; order: OrderDetails }> => {
  try {
    // Validate the deliveryId to prevent API calls with undefined ID
    if (!deliveryId) {
      console.error('Invalid delivery ID: deliveryId is undefined or empty');
      throw new Error('Invalid delivery ID: Cannot fetch delivery details with undefined ID');
    }
    
    const response = await api.get<{ delivery: IDelivery; order: OrderDetails }>(`/delivery-service/${deliveryId}/with-order`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch delivery with order details:', error);
    throw new Error('Failed to fetch delivery with order details');
  }
};

/**
 * Enhanced get delivery with order details including real-time driver data
 */
export const getDeliveryWithOrderDetailsAndDriverInfo = async (deliveryId: string): Promise<{ 
  delivery: IDelivery; 
  order: OrderDetails;
  driverLocation?: { lat: number; lng: number };
  vehicleDetails?: { type?: string; vehicleNumber?: string };
}> => {
  try {
    // Validate the deliveryId before proceeding
    if (!deliveryId) {
      console.error('Invalid delivery ID: deliveryId is undefined or empty');
      throw new Error('Invalid delivery ID: Cannot fetch delivery details with undefined ID');
    }
    
    // Default response structure with minimal data to prevent crashes
    const defaultResponse = {
      delivery: {
        _id: deliveryId,
        orderId: '',
        status: 'PENDING' as keyof DeliveryStatus
      },
      order: {
        customerId: '',
        restaurantId: '',
        orderStatus: 'Pending'
      }
    };
    
    // Try to get the basic delivery and order details
    try {
      const deliveryData = await getDeliveryWithOrderDetails(deliveryId);
      
      // Build response with driver info
      const response: { 
        delivery: IDelivery; 
        order: OrderDetails;
        driverLocation?: { lat: number; lng: number };
        vehicleDetails?: { type?: string; vehicleNumber?: string };
      } = {
        delivery: deliveryData.delivery,
        order: deliveryData.order
      };
      
      // Check if order has driver details (from order service database)
      if (deliveryData.order?.driverDetails?.driverId) {
        // Use driver location from order service if available
        if (deliveryData.order.driverDetails.latitude && deliveryData.order.driverDetails.longitude) {
          response.driverLocation = {
            lat: deliveryData.order.driverDetails.latitude,
            lng: deliveryData.order.driverDetails.longitude
          };
        }
        
        // Create vehicle details from order data
        if (deliveryData.order.driverDetails.vehicleNumber) {
          response.vehicleDetails = {
            vehicleNumber: deliveryData.order.driverDetails.vehicleNumber
          };
        }
        
        try {
          // Also try to get current live location from driver service
          const driverLocation = await userService.getDriverCurrentLocation(deliveryData.order.driverDetails.driverId);
          if (driverLocation) {
            response.driverLocation = driverLocation;
          }
          
          // Get additional vehicle details if not in the order
          if (!response.vehicleDetails?.vehicleNumber) {
            const vehicleDetails = await userService.getDriverVehicleDetails(deliveryData.order.driverDetails.driverId);
            if (vehicleDetails) {
              response.vehicleDetails = vehicleDetails;
            }
          }
        } catch (driverInfoError) {
          console.error('Error fetching driver information:', driverInfoError);
          // Continue without driver info if fetching fails
        }
      }
      // If order doesn't have driver details but delivery has driverId, try to use that
      else if (deliveryData.delivery?.driverId) {
        try {
          // Get the driver's current location
          const driverLocation = await userService.getDriverCurrentLocation(deliveryData.delivery.driverId);
          if (driverLocation) {
            response.driverLocation = driverLocation;
          }
          
          // Get the driver's vehicle details
          const vehicleDetails = await userService.getDriverVehicleDetails(deliveryData.delivery.driverId);
          if (vehicleDetails) {
            response.vehicleDetails = vehicleDetails;
          }
        } catch (driverInfoError) {
          console.error('Error fetching driver information:', driverInfoError);
          // Continue without driver info if fetching fails
        }
      }
      
      return response;
    } catch (detailsError) {
      console.error(`Error in getDeliveryWithOrderDetails for ID ${deliveryId}:`, detailsError);
      
      // Try fallback approach - get basic delivery and order separately
      try {
        // Try to get just the delivery first
        const delivery = await getDeliveryById(deliveryId);
        
        // If we have a delivery with an orderId, try to get the order directly
        if (delivery && delivery.orderId) {
          try {
            const orderResponse = await api.get(`/order-service/orders/${delivery.orderId}`);
            if (orderResponse.data) {
              // Type assertion or type checking for the response data
              const responseData = orderResponse.data as Record<string, unknown>;
              // Ensure the response has the required properties for OrderDetails
              const orderData: OrderDetails = {
                customerId: (responseData.customerId as string) || '',
                restaurantId: (responseData.restaurantId as string) || '',
                ...responseData
              };
              return {
                delivery,
                order: orderData
              };
            }
          } catch (orderError) {
            console.error(`Error fetching order for delivery ${deliveryId}:`, orderError);
          }
        }
      } catch (deliveryError) {
        console.error(`Error fetching delivery ${deliveryId}:`, deliveryError);
      }
      
      // If all attempts fail, return the default empty response 
      // to prevent UI crashes
      return defaultResponse;
    }
  } catch (error) {
    console.error('Failed to fetch delivery with enhanced driver details:', error);
    
    // Return a minimal response with the ID to prevent UI crashes
    return {
      delivery: {
        _id: deliveryId,
        orderId: '',
        status: 'PENDING' as keyof DeliveryStatus
      },
      order: {
        customerId: '',
        restaurantId: '',
        orderStatus: 'Pending'
      }
    };
  }
};

/**
 * Create a new delivery
 */
export const createDelivery = async (deliveryData: Partial<IDelivery>): Promise<IDelivery> => {
  try {
    const response = await api.post<IDelivery>('/delivery-service/', deliveryData);
    return response.data;
  } catch (error) {
    console.error('Failed to create delivery:', error);
    throw new Error('Failed to create delivery');
  }
};

/**
 * Update a delivery
 */
export const updateDelivery = async (
  deliveryId: string, 
  updateData: Partial<IDelivery>
): Promise<IDelivery> => {
  try {
    const response = await api.put<IDelivery>(`/delivery-service/${deliveryId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Failed to update delivery:', error);
    throw new Error('Failed to update delivery');
  }
};

/**
 * Delete a delivery
 */
export const deleteDelivery = async (deliveryId: string): Promise<void> => {
  try {
    await api.delete(`/delivery-service/${deliveryId}`);
  } catch (error) {
    console.error('Failed to delete delivery:', error);
    throw new Error('Failed to delete delivery');
  }
};

/**
 * Assign a driver to an order
 * This is a more flexible function that can handle orders with undefined orderIds
 */
export const assignDriverToOrder = async (
  orderId: string,
  driverId: string,
  driverName: string = "",
  vehicleNumber: string = ""
): Promise<IDelivery> => {
  try {
    console.log(`Assigning driver ${driverId} to order ${orderId}`);
    
    // Generate a non-empty ID if orderId is undefined/null/empty
    const validOrderId = orderId && orderId !== "undefined" && orderId !== "null" 
      ? orderId 
      : `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
    console.log(`Using ${validOrderId} as order ID for assignment`);

    try {
      // First try to update the order service directly
      const response = await api.post<any>(
        `/order-service/orders/${validOrderId}/assign-driver`,
        {
          driverId,
          driverName,
          vehicleNumber
        }
      );
      
      console.log('Driver successfully assigned through order service');
      
      // Then create or update the delivery entry in delivery service
      const deliveryResponse = await api.post<IDelivery>(
        `/delivery-service/order/${validOrderId}/assign-driver`,
        {
          driverId,
          driverName,
          vehicleNumber
        }
      );
      
      console.log('Delivery entry created/updated');
      return deliveryResponse.data;
    } catch (orderServiceError) {
      console.error('Error updating order service, trying delivery service directly:', orderServiceError);
      
      // If order service fails, try directly with delivery service
      const response = await api.post<IDelivery>(
        `/delivery-service/order/${validOrderId}/assign-driver`,
        {
          driverId,
          driverName,
          vehicleNumber
        }
      );
      
      console.log('Driver assigned through delivery service only');
      return response.data;
    }
  } catch (error) {
    console.error('Failed to assign driver to order:', error);
    throw new Error('Failed to assign driver to order');
  }
};

/**
 * Accept a delivery by a driver
 */
export const acceptDelivery = async (
  deliveryId: string | undefined, 
  driverId: string,
  driverName?: string,
  vehicleNumber?: string
): Promise<IDelivery> => {
  try {
    console.log('Accept delivery called with:', { deliveryId, driverId, driverName, vehicleNumber });
    
    // Validate deliveryId - ensure it's a valid string
    if (!deliveryId || typeof deliveryId !== 'string' || deliveryId === 'undefined' || deliveryId === 'null') {
      console.error('Invalid delivery ID in acceptDelivery:', deliveryId);
      throw new Error('Invalid delivery ID - please try again or refresh the page');
    }
    
    // Validate driverId
    if (!driverId) {
      throw new Error('Driver ID is required');
    }
    
    console.log(`Driver ${driverId} accepting delivery ${deliveryId}`);
    
    // Handle generated IDs specially
    if (deliveryId.startsWith('generated-')) {
      const orderId = deliveryId.replace('generated-', '');
      if (!orderId || orderId === 'undefined' || orderId === 'null') {
        throw new Error('Invalid order ID extracted from generated delivery ID');
      }
      
      console.log(`Using assign driver for generated delivery with orderId: ${orderId}`);
      return await assignDriverToOrder(orderId, driverId, driverName || '', vehicleNumber);
    }
    
    // Handle direct order IDs (when deliveryId is actually an orderId)
    if (deliveryId.startsWith('ORD-') || deliveryId.includes('order-') || !deliveryId.includes('-')) {
      console.log(`Detected order ID format: ${deliveryId}, using assignDriverToOrder`);
      return await assignDriverToOrder(deliveryId, driverId, driverName || '', vehicleNumber);
    }
    
    // Regular case: Call the accept delivery endpoint
    try {
      const response = await api.post<IDelivery>(`/delivery-service/${deliveryId}/accept`, {
        driverId,
        driverName,
        vehicleNumber
      });
      
      return response.data;
    } catch (acceptError) {
      console.error('Error using accept endpoint, falling back to assign driver:', acceptError);
      // Fallback to assignDriverToOrder if the accept endpoint fails
      // This could happen if the deliveryId is actually an orderId
      return await assignDriverToOrder(deliveryId, driverId, driverName || '', vehicleNumber);
    }
  } catch (error) {
    console.error('Failed to accept delivery:', error);
    throw error; // Pass the original error through for better debugging
  }
}

/**
 * Get pending orders that need drivers
 * This function tries to fetch available orders that need drivers
 */
export const getPendingOrders = async (): Promise<any[]> => {
  try {
    // Try to get pending orders from the delivery service
    // First, try the direct endpoint (if it exists)
    try {
      const response = await api.get('/delivery-service/pending-orders', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache', 
          'Pragma': 'no-cache'
        }
      });
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }
    } catch (endpointError) {
      console.log('Direct pending orders endpoint not available, trying alternative approach');
    }
    
    // Alternative: Try to get recent orders that might need a driver
    // Use the order-service endpoint if available
    try {
      const response = await api.get('/order-service/orders/status/PAID', {
        withCredentials: true
      });
      if (response.data && Array.isArray(response.data)) {
        // Filter to orders that don't have driver details
        const pendingOrders = response.data.filter(order => !order.driverDetails || !order.driverDetails.driverId);
        return pendingOrders.map(order => ({
          orderId: order.orderId,
          restaurantName: "Restaurant", // These would need to be populated with real data
          restaurantAddress: "Restaurant Address",
          restaurantPhone: "555-123-4567",
          restaurantLocation: { lat: 40.7128, lng: -74.006 },
          customerName: order.customerDetails?.name || "Customer",
          customerAddress: order.customerDetails?.address || "Customer Address",
          customerPhone: order.customerDetails?.contact || "555-987-6543",
          customerLocation: { 
            lat: order.customerDetails?.latitude || 40.7303, 
            lng: order.customerDetails?.longitude || -74.0054 
          },
          items: order.cartItems || [],
          totalAmount: order.totalAmount || 0
        }));
      }
    } catch (orderServiceError) {
      console.log('Order service endpoint not available');
    }

    // If no real data is available, use simulation for development
    return [
      {
        orderId: "ORD-" + Math.floor(Math.random() * 10000),
        restaurantName: "The Local Restaurant",
        restaurantAddress: "123 Main St, New York, NY",
        restaurantPhone: "555-123-4567",
        restaurantLocation: { lat: 40.7128, lng: -74.006 },
        customerName: "John Customer",
        customerAddress: "456 Market St, New York, NY",
        customerPhone: "555-987-6543",
        customerLocation: { lat: 40.7303, lng: -74.0054 },
        items: [
          { itemName: "Burger", quantity: 2, price: 12.99 },
          { itemName: "Fries", quantity: 1, price: 4.99 }
        ],
        totalAmount: 30.97
      }
    ];
  } catch (error) {
    console.error('Failed to fetch pending orders:', error);
    // For development, return simulated data instead of throwing
    return [
      {
        orderId: "ORD-" + Math.floor(Math.random() * 10000),
        restaurantName: "Backup Restaurant",
        restaurantAddress: "789 Avenue, New York, NY",
        restaurantPhone: "555-111-2222",
        restaurantLocation: { lat: 40.7128, lng: -74.006 },
        customerName: "Backup Customer",
        customerAddress: "101 Street Rd, New York, NY",
        customerPhone: "555-333-4444",
        customerLocation: { lat: 40.7303, lng: -74.0054 },
        items: [
          { itemName: "Pizza", quantity: 1, price: 14.99 }
        ],
        totalAmount: 14.99
      }
    ];
  }
};

/**
 * Convert an address to latitude and longitude coordinates
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

/**
 * Update driver's current location in the database
 */
export const updateDriverLocation = async (
  driverId: string, 
  location: { lat: number, lng: number }
): Promise<void> => {
  try {
    // Save the location update to the database via API
    await api.post(`/delivery-service/driver/${driverId}/location`, {
      location: {
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date().toISOString()
      }
    });
    console.log('Driver location updated in database:', { driverId, location });
  } catch (error) {
    console.error('Failed to update driver location in database:', error);
    // Don't throw here - we still want the socket update to work even if
    // the database update fails, so socket-based location sharing still works
  }
};