"use client"

import { useState, useEffect } from "react"
import { DeliveryCard } from "@/components/ui/delivery-card"
import { DeliveryTimeline } from "@/components/ui/delivery-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeliveryStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Filter, Calendar, ChevronDown, MapPin } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MultiDeliveryMap, { DeliveryMapItem } from "@/components/ui/multi-delivery-map"
import { toast } from "sonner"
import { 
  getAllDeliveries, 
  getDeliveryWithOrderDetailsAndDriverInfo, 
  updateDelivery,
  getPendingOrders,
  IDelivery
} from "@/services/delivery-service"
import api from "@/lib/axios"
import { userService } from "@/services/user-service"
import dynamic from 'next/dynamic';

const MultiDeliveryMapDynamic = dynamic(() => import('@/components/ui/multi-delivery-map'), {
  ssr: false,
  loading: () => <div className="h-[500px] flex items-center justify-center bg-muted">Loading map...</div>
});

// Analytics data for dashboard metrics
const ANALYTICS_DATA = {
  totalDeliveries: 125,
  activeDeliveries: 18,
  completedToday: 42,
  cancelledToday: 3,
  averageDeliveryTime: "28 min",
}

// Format for the transformed delivery data
interface OrderItem {
  name: string;
  quantity: number;
}

interface FormattedDelivery {
  id: string;
  status: DeliveryStatus;
  orderId: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
    location: { lat: number; lng: number };
  };
  customer: {
    name: string;
    address: string;
    phone: string;
    location: { lat: number; lng: number };
  };
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  driverLocation: { lat: number; lng: number };
  estimatedTime: string;
  distance: string;
  amount: string;
  items: OrderItem[];
  createdAt: string;
  timestamps: {
    createdAt: string;
    acceptedAt?: string;
    pickedUpAt?: string;
    deliveredAt?: string;
    cancelledAt?: string;
  };
}

// Define a synthetic delivery type to match the structure we create for pending orders
interface SyntheticDelivery {
  _id: string;
  orderId: string;
  status: string; // Changed from keyof DeliveryStatus to string
  createdAt?: string;
  updatedAt?: string;
  driverId?: string;
  acceptedAt?: string;
  deliveredAt?: string;
}

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<FormattedDelivery[]>([])
  const [activeDelivery, setActiveDelivery] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "ALL">("ALL")
  const [loading, setLoading] = useState(true)
  const [showMap, setShowMap] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState(ANALYTICS_DATA)
  const [liveDriverLocations, setLiveDriverLocations] = useState<Record<string, {lat: number, lng: number}>>({})

  useEffect(() => {
    fetchDeliveries()
  }, [])

  // Set up real-time location tracking for all active drivers
  useEffect(() => {
    // Skip this entire effect during server-side rendering
    if (typeof window === 'undefined') return;

    const activeDrivers = deliveries
      .filter(d => ["ACCEPTED", "IN_PROGRESS"].includes(d.status) && d.driver)
      .map(d => d.driver?.name?.split(' ')[0] || d.driver?.vehicle?.split('(')[1]?.split(')')[0])
      .filter(Boolean) as string[];
    
    // Subscribe to location updates for all active drivers
    if (activeDrivers.length > 0) {
      console.log("Setting up location tracking for drivers:", activeDrivers);
      
      // Import socket functions - make sure we're only doing this on client side
      const setupDriverTracking = async () => {
        try {
          // Dynamically import the socket module only on the client side
          const socketModule = await import('@/lib/socket');
          const { subscribeToDriverLocation, unsubscribeFromDriverLocation } = socketModule;
          
          // Setup listeners for each driver
          activeDrivers.forEach(driverId => {
            if (!driverId) return; // Skip if driverId is undefined
            console.log(`Setting up listener for driver: ${driverId}`);
            subscribeToDriverLocation(driverId, (location) => {
              if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
                console.log(`Received live location for driver ${driverId}:`, location);
                setLiveDriverLocations(prev => ({
                  ...prev,
                  [driverId]: {
                    lat: location.lat,
                    lng: location.lng
                  }
                }));
              }
            });
          });
        } catch (error) {
          console.error("Error setting up driver location tracking:", error);
        }
      };
      
      setupDriverTracking();
      
      // Cleanup function to unsubscribe when component unmounts
      return () => {
        const cleanupDriverTracking = async () => {
          if (typeof window === 'undefined') return; // Safety check
          
          try {
            const socketModule = await import('@/lib/socket');
            const { unsubscribeFromDriverLocation } = socketModule;
            
            activeDrivers.forEach(driverId => {
              if (!driverId) return; // Skip if driverId is undefined
              console.log(`Cleaning up listener for driver: ${driverId}`);
              unsubscribeFromDriverLocation(driverId);
            });
          } catch (error) {
            console.error("Error cleaning up driver tracking:", error);
          }
        };
        
        cleanupDriverTracking();
      };
    }
  }, [deliveries]);

  // Helper function to get customer details from user service
  const fetchCustomerDetails = async (customerId: string) => {
    try {
      if (!customerId) return null;
      const customer = await userService.getUserById(customerId);
      if (customer) {
        return {
          name: `${customer.firstName} ${customer.lastName}`,
          address: (customer as any).address || (customer as any).addressLine || "Customer Address",
          phone: (customer as any).contactNumber || customer.phone || "Customer Phone",
          location: (customer as any).location || { lat: 40.7282, lng: -73.9942 }
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch customer details for ID ${customerId}:`, error);
      return null;
    }
  };

  // Helper function to get restaurant details from user service
  const fetchRestaurantDetails = async (restaurantId: string) => {
    try {
      if (!restaurantId) return null;
      const restaurant = await userService.getUserById(restaurantId);
      if (restaurant) {
        return {
          name: (restaurant as any).restaurantName || `${restaurant.firstName} ${restaurant.lastName}'s Restaurant`,
          address: (restaurant as any).restaurantAddress || (restaurant as any).address || "Restaurant Address",
          phone: (restaurant as any).contactNumber || (restaurant as any).phone || "Restaurant Phone",
          location: (restaurant as any).location || { lat: 40.7128, lng: -74.006 }
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch restaurant details for ID ${restaurantId}:`, error);
      return null;
    }
  };

  // Fetch orders with Pending Delivery status directly from the order service
  const fetchPendingDeliveryOrders = async (): Promise<any[]> => {
    try {
      // Try with the correct format (uppercase with underscores)
      try {
        const response = await api.get('/order-service/orders/status/PENDING_DELIVERY', {
          withCredentials: true
        });
        
        if (Array.isArray(response.data)) {
          console.log('Successfully fetched pending delivery orders with PENDING_DELIVERY format');
          return response.data;
        }
      } catch (formatError) {
        console.log('PENDING_DELIVERY format failed, trying alternative format');
      }
      
      // Try with the format used in the UI
      try {
        const response = await api.get('/order-service/orders/status/Pending%20Delivery', {
          withCredentials: true
        });
        
        if (Array.isArray(response.data)) {
          console.log('Successfully fetched pending delivery orders with "Pending Delivery" format');
          return response.data;
        }
      } catch (spaceError) {
        console.log('Space-separated format failed, trying yet another format');
      }
      
      // Try with a different common format (camelCase)
      const response = await api.get('/order-service/orders/pendingDelivery', {
        withCredentials: true
      });
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Failed to fetch pending delivery orders:', error);
      return [];
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      
      // Get all deliveries from the API
      const apiDeliveries = await getAllDeliveries()
      
      // Also get orders with "Pending Delivery" status that don't have delivery entries yet
      const pendingDeliveryOrders = await fetchPendingDeliveryOrders();
      
      // Convert pending orders to delivery format (synthetic deliveries)
      const syntheticDeliveries: SyntheticDelivery[] = pendingDeliveryOrders.map(order => ({
        _id: `order-${order.orderId}`,
        orderId: order.orderId,
        status: "PENDING",
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));
      
      // Merge both arrays, making sure to avoid duplicates
      const existingOrderIds = new Set(apiDeliveries.map(d => d.orderId));
      const uniqueSyntheticDeliveries = syntheticDeliveries.filter(d => !existingOrderIds.has(d.orderId));
      
      const allDeliveries: (IDelivery | SyntheticDelivery)[] = [...apiDeliveries, ...uniqueSyntheticDeliveries];
      
      if (allDeliveries && allDeliveries.length > 0) {
        // Transform the API response into the format our UI expects
        const formattedDeliveries = await Promise.all(allDeliveries.map(async (delivery) => {
          try {
            // For synthetic deliveries from pending orders, we need special handling
            const isSynthetic = delivery._id?.toString().startsWith('order-');
            
            // Get detailed order information - for synthetic deliveries we need to find the order by ID
            let orderDetails: any;
            try {
              if (isSynthetic) {
                // Find the original order in the pendingDeliveryOrders array
                const orderData = pendingDeliveryOrders.find(o => o.orderId === delivery.orderId);
                
                if (orderData) {
                  // Create a compatible object structure
                  orderDetails = {
                    delivery,
                    order: orderData
                  };
                } else {
                  // Try to get from the API as fallback
                  const response = await api.get(`/order-service/orders/${delivery.orderId}`);
                  orderDetails = {
                    delivery,
                    order: response.data
                  };
                }
              } else {
                // Normal delivery, get details using existing service
                orderDetails = await getDeliveryWithOrderDetailsAndDriverInfo(delivery._id || '');
              }
            } catch (detailsError) {
              console.error(`Error fetching details for delivery ${delivery._id}:`, detailsError);
              // Create minimal order details so we can still display something
              orderDetails = {
                delivery,
                order: {
                  orderId: delivery.orderId,
                  customerId: '',
                  restaurantId: '',
                }
              };
            }
            
            // Default values for restaurant and customer information
            let restaurantInfo = {
              name: "Restaurant Name",
              address: "Restaurant Address",
              phone: "Restaurant Phone",
              location: { lat: 40.7128, lng: -74.006 } // Default NYC coordinates
            }
            
            let customerInfo = {
              name: "Customer Name",
              address: "Customer Address",
              phone: "Customer Phone", 
              location: { lat: 40.7282, lng: -73.9942 } // Default location
            }
            
            let driverInfo = undefined
            
            // Restaurant info from order details
            if (orderDetails.order?.restaurantId) {
              try {
                // Try to get restaurant details from user service directly
                const restaurant = await userService.getUserById(orderDetails.order.restaurantId);
                if (restaurant) {
                  restaurantInfo = {
                    name: (restaurant as any).restaurantName || `${restaurant.firstName} ${restaurant.lastName}'s Restaurant`,
                    address: (restaurant as any).restaurantAddress || (restaurant as any).address || "Restaurant Address",
                    phone: (restaurant as any).contactNumber || restaurant.phone || "Restaurant Phone",
                    location: (restaurant as any).location ? 
                      {
                        // Handle both {lat, lng} and {x, y} coordinate formats
                        lat: (restaurant as any).location.lat || (restaurant as any).location.y || 40.7128,
                        lng: (restaurant as any).location.lng || (restaurant as any).location.x || -74.006 
                      } : 
                      { lat: 40.7128, lng: -74.006 }
                  };
                  console.log("Retrieved restaurant details:", restaurantInfo);
                }
              } catch (restaurantError) {
                console.error("Error fetching restaurant details:", restaurantError);
              }
            }
            
            // Customer details from order details
            if (orderDetails.order?.customerId) {
              try {
                // Try to get customer details from user service directly
                const customer = await userService.getUserById(orderDetails.order.customerId);
                if (customer) {
                  customerInfo = {
                    name: `${customer.firstName} ${customer.lastName}`,
                    address: (customer as any).address || (customer as any).customerAddress || "Customer Address",
                    phone: (customer as any).contactNumber || (customer as any).phone || "Customer Phone",
                    location: (customer as any).location ? 
                      {
                        // Handle both {lat, lng} and {x, y} coordinate formats
                        lat: (customer as any).location.lat || (customer as any).location.y || 40.7282,
                        lng: (customer as any).location.lng || (customer as any).location.x || -73.9942
                      } : 
                      { lat: 40.7282, lng: -73.9942 }
                  };
                  console.log("Retrieved customer details:", customerInfo);
                }
              } catch (customerError) {
                console.error("Error fetching customer details:", customerError);
              }
            } 
            
            // Fallback to order data if user service fetch failed
            if (orderDetails.order?.customerDetails) {
              const customerDetails = orderDetails.order.customerDetails;
              // Only use these values if we didn't already get details from user service
              if (customerInfo.name === "Customer Name") {
                customerInfo = {
                  name: customerDetails.name || "Customer",
                  address: customerDetails.address || "Customer Address",
                  phone: customerDetails.contact || "Customer Phone",
                  location: { 
                    lat: customerDetails.latitude || 40.7128, 
                    lng: customerDetails.longitude || -73.99
                  }
                };
              }
            }
            
            // Get order items if available
            let orderItems: OrderItem[] = []
            if (orderDetails?.order?.cartItems && Array.isArray(orderDetails.order.cartItems)) {
              orderItems = orderDetails.order.cartItems.map((item: any) => ({
                name: item.itemName || 'Unknown Item',
                quantity: item.quantity || 1
              }))
            }
            
            // Order amount if available
            let orderAmount = "0.00"
            if (orderDetails?.order?.totalAmount) {
              orderAmount = orderDetails.order.totalAmount.toString()
            }
            
            // Get driver info if assigned
            if ('driverId' in delivery && delivery.driverId) {
              try {
                const driver = await userService.getUserById(delivery.driverId)
                if (driver) {
                  driverInfo = {
                    name: `${driver.firstName} ${driver.lastName}`,
                    phone: driver.phone || "Driver Phone",
                    vehicle: (driver as any).vehicleNumber || 
                             (orderDetails?.vehicleDetails?.vehicleNumber) || 
                             ((driver as any).additionalInfo?.vehicleNumber) || 
                             "Vehicle Info",
                  }
                }
              } catch (driverError) {
                console.error("Error fetching driver details:", driverError)
              }
            }
            
            // Driver location either from real-time data or from order
            const driverLocation = orderDetails.driverLocation || 
              (orderDetails.order.driverDetails?.latitude && orderDetails.order.driverDetails?.longitude 
                ? {
                    lat: orderDetails.order.driverDetails.latitude,
                    lng: orderDetails.order.driverDetails.longitude
                  }
                : { lat: 40.72, lng: -74.0 }) // Default location if none available
            
            // Calculate estimated delivery times
            let estimatedTime = "15 min"
            if (delivery.status === "DELIVERED" || delivery.status === "CANCELLED") {
              estimatedTime = "0 min"
            }
            
            // Calculate approximate distance based on coordinates
            const calculateDistance = (loc1: {lat: number, lng: number}, loc2: {lat: number, lng: number}): string => {
              const R = 6371 // Radius of the earth in km
              const dLat = (loc2.lat - loc1.lat) * Math.PI / 180
              const dLng = (loc2.lng - loc1.lng) * Math.PI / 180
              const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) * 
                Math.sin(dLng/2) * Math.sin(dLng/2)
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
              const distance = R * c * 0.621371 // Convert to miles
              return distance.toFixed(1) + " mi"
            }
            
            const distance = calculateDistance(
              customerInfo.location, 
              restaurantInfo.location
            )
            
            // Create timestamps object based on available data
            const timestamps: any = {
              createdAt: delivery.createdAt || new Date().toISOString(),
            }
            
            if ('acceptedAt' in delivery && delivery.acceptedAt) timestamps.acceptedAt = delivery.acceptedAt
            if ('deliveredAt' in delivery && delivery.deliveredAt) timestamps.deliveredAt = delivery.deliveredAt
            
            // Simulate pickupAt if it's in progress but we don't have that data
            if (delivery.status === "IN_PROGRESS" && !timestamps.pickedUpAt && timestamps.acceptedAt) {
              const acceptedDate = new Date(timestamps.acceptedAt)
              timestamps.pickedUpAt = new Date(acceptedDate.getTime() + 10 * 60000).toISOString()
            }
            
            return {
              id: delivery._id || "",
              status: delivery.status as DeliveryStatus,
              orderId: delivery.orderId,
              restaurant: restaurantInfo,
              customer: customerInfo,
              driver: driverInfo,
              driverLocation,
              estimatedTime,
              distance,
              amount: orderAmount,
              items: orderItems,
              createdAt: delivery.createdAt || new Date().toISOString(),
              timestamps,
            }
          } catch (error) {
            console.error("Error formatting delivery:", error)
            return null
          }
        }))
        
        // Filter out any null values from failed transformations
        setDeliveries(formattedDeliveries.filter(Boolean) as FormattedDelivery[])
        
        // Update analytics based on real data
        const activeCount = formattedDeliveries.filter(d => 
          d && ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status)
        ).length
        
        const completedToday = formattedDeliveries.filter(d => {
          if (!d || d.status !== "DELIVERED") return false
          const deliveredDate = d.timestamps.deliveredAt ? new Date(d.timestamps.deliveredAt) : null
          if (!deliveredDate) return false
          const today = new Date()
          return deliveredDate.getDate() === today.getDate() && 
                deliveredDate.getMonth() === today.getMonth() &&
                deliveredDate.getFullYear() === today.getFullYear()
        }).length
        
        const cancelledToday = formattedDeliveries.filter(d => {
          if (!d || d.status !== "CANCELLED") return false
          const cancelledDate = d.timestamps.cancelledAt ? new Date(d.timestamps.cancelledAt) : null
          if (!cancelledDate) return false
          const today = new Date()
          return cancelledDate.getDate() === today.getDate() && 
                cancelledDate.getMonth() === today.getMonth() &&
                cancelledDate.getFullYear() === today.getFullYear()
        }).length
        
        setAnalytics({
          ...analytics,
          totalDeliveries: formattedDeliveries.filter(Boolean).length,
          activeDeliveries: activeCount,
          completedToday: completedToday || analytics.completedToday,
          cancelledToday: cancelledToday || analytics.cancelledToday
        })
      } else {
        // No deliveries found - use empty array
        setDeliveries([])
      }
      
    } catch (err) {
      console.error("Failed to fetch deliveries:", err)
      setError("Failed to load deliveries. Please try again later.")
      // Keep using sample data
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    setActiveDelivery(id)
  }

  const handleCancelDelivery = async (id: string) => {
    try {
      const delivery = deliveries.find(d => d.id === id)
      if (!delivery) {
        throw new Error("Delivery not found")
      }
      
      // Update status in the backend
      await updateDelivery(id, { 
        status: "CANCELLED", 
      })
      
      // Update status locally
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === id ? { ...delivery, status: "CANCELLED" as DeliveryStatus } : delivery,
        ),
      )
      
      toast.success("Delivery cancelled successfully")
    } catch (error) {
      console.error("Failed to cancel delivery:", error)
      toast.error("Failed to cancel delivery")
    }
  }

  const handleReassignDriver = (id: string) => {
    // In a real app, this would open a modal to select a new driver
    toast.info("Driver reassignment would be implemented here with a selection modal")
  }

  // Add utility function to get the current driver location
  const getCurrentDriverLocation = (delivery: FormattedDelivery) => {
    // Try to get driver ID
    const driverId = delivery.driver?.name?.split(' ')[0] || 
                     delivery.driver?.vehicle?.split('(')[1]?.split(')')[0];
    
    if (driverId && liveDriverLocations[driverId]) {
      return {
        lat: liveDriverLocations[driverId].lat,
        lng: liveDriverLocations[driverId].lng,
        label: delivery.driver?.name || "Driver",
        icon: "driver"
      };
    }
    
    // Fall back to the stored location
    return {
      lat: Number(delivery.driverLocation.lat) || 0,
      lng: Number(delivery.driverLocation.lng) || 0,
      label: delivery.driver?.name || "Driver",
      icon: "driver"
    };
  };

  // Format deliveries for map display
  const getMapDeliveries = (): DeliveryMapItem[] => {
    // Only calculate this on the client side
    if (typeof window === 'undefined') return [];
    
    // Filter to show only active and pending deliveries on the map
    return deliveries
      .filter(delivery => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(delivery.status))
      .map(delivery => ({
        id: delivery.id,
        status: delivery.status,
        restaurant: {
          name: delivery.restaurant.name,
          location: {
            lat: delivery.restaurant.location.lat,
            lng: delivery.restaurant.location.lng,
            label: delivery.restaurant.name,
            icon: "restaurant"
          }
        },
        customer: {
          name: delivery.customer.name,
          location: {
            lat: delivery.customer.location.lat,
            lng: delivery.customer.location.lng,
            label: delivery.customer.name,
            icon: "customer"
          }
        },
        ...(delivery.driver ? {
          driver: {
            id: delivery.driver.name.split(' ')[0] || delivery.id, // Use first name or id as driver id
            name: delivery.driver.name,
            location: {
              lat: liveDriverLocations[delivery.driver.name.split(' ')[0]]?.lat || delivery.driverLocation.lat,
              lng: liveDriverLocations[delivery.driver.name.split(' ')[0]]?.lng || delivery.driverLocation.lng,
              label: delivery.driver.name,
              icon: "driver"
            }
          }
        } : {})
      }));
  };

  // Handle map delivery selection
  const handleMapDeliverySelect = (deliveryId: string) => {
    setActiveDelivery(deliveryId);
  };

  const filteredDeliveries = deliveries.filter((delivery) => {
    const matchesSearch =
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (delivery.driver?.name.toLowerCase() || "").includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "ALL" || delivery.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const activeDeliveryData = deliveries.find((delivery) => delivery.id === activeDelivery)

  if (loading) {
    return (
      <>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading deliveries...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">Delivery Management</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowMap(!showMap)}>
              <MapPin className="mr-2 h-4 w-4" />
              {showMap ? "Hide Map" : "Show Map"}
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </Button>
            <Button size="sm" onClick={fetchDeliveries}>
              <Loader2 className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalDeliveries}</div>
              <p className="text-xs text-muted-foreground">+18% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeDeliveries}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedToday}</div>
              <p className="text-xs text-green-500">+5 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Delivery Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageDeliveryTime}</div>
              <p className="text-xs text-green-500">-3 min from last week</p>
            </CardContent>
          </Card>
        </div>

        {showMap && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Real-Time Delivery Map</CardTitle>
              <CardDescription>View all active deliveries on the map</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[500px]">
                {deliveries.length > 0 && typeof window !== 'undefined' && (
                  <MultiDeliveryMapDynamic
                    deliveries={getMapDeliveries()}
                    enableLiveTracking={true}
                    zoom={12}
                    height="500px"
                    onDeliverySelect={handleMapDeliverySelect}
                    selectedDeliveryId={activeDelivery}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeDelivery && activeDeliveryData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <DeliveryTimeline status={activeDeliveryData.status} timestamps={activeDeliveryData.timestamps} />

              <div className="flex flex-wrap gap-2">
                {activeDeliveryData.status === "PENDING" && (
                  <Button className="flex-1" onClick={() => handleReassignDriver(activeDeliveryData.id)}>
                    Reassign Driver
                  </Button>
                )}

                {["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(activeDeliveryData.status) && (
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleCancelDelivery(activeDeliveryData.id)}
                  >
                    Cancel Delivery
                  </Button>
                )}

                <Button variant="outline" className="flex-1" onClick={() => setActiveDelivery(null)}>
                  Back to List
                </Button>
              </div>
            </div>

            <div>
              <DeliveryCard
                id={activeDeliveryData.id}
                status={activeDeliveryData.status}
                orderId={activeDeliveryData.orderId}
                restaurant={activeDeliveryData.restaurant}
                customer={activeDeliveryData.customer}
                driver={activeDeliveryData.driver}
                estimatedTime={activeDeliveryData.estimatedTime}
                distance={activeDeliveryData.distance}
                amount={activeDeliveryData.amount}
                createdAt={activeDeliveryData.createdAt}
                viewType="admin"
                className="mb-4"
              />

              <div className="rounded-lg border">
                <div className="border-b p-4">
                  <h3 className="font-medium">Order Details</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {activeDeliveryData.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${(Number.parseFloat(activeDeliveryData.amount) - 5).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>$3.50</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>$1.50</span>
                    </div>
                    <div className="mt-2 flex justify-between font-medium">
                      <span>Total</span>
                      <span>${activeDeliveryData.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order ID, restaurant, customer, or driver..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as DeliveryStatus | "ALL")}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACCEPTED">Accepted</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DELIVERED">Delivered</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    More Filters
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>Restaurant</DropdownMenuItem>
                    <DropdownMenuItem>Driver</DropdownMenuItem>
                    <DropdownMenuItem>Date Range</DropdownMenuItem>
                    <DropdownMenuItem>Delivery Time</DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4 space-y-4">
                {filteredDeliveries.length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">No deliveries found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries.map((delivery) => (
                      <DeliveryCard
                        key={delivery.id}
                        id={delivery.id}
                        status={delivery.status}
                        orderId={delivery.orderId}
                        restaurant={delivery.restaurant}
                        customer={delivery.customer}
                        driver={delivery.driver}
                        estimatedTime={delivery.estimatedTime}
                        distance={delivery.distance}
                        amount={delivery.amount}
                        createdAt={delivery.createdAt}
                        viewType="admin"
                        onViewDetails={handleViewDetails}
                        onCancel={handleCancelDelivery}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pending" className="mt-4 space-y-4">
                {filteredDeliveries.filter((d) => d.status === "PENDING").length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">No pending deliveries</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries
                      .filter((d) => d.status === "PENDING")
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.id}
                          id={delivery.id}
                          status={delivery.status}
                          orderId={delivery.orderId}
                          restaurant={delivery.restaurant}
                          customer={delivery.customer}
                          driver={delivery.driver}
                          estimatedTime={delivery.estimatedTime}
                          distance={delivery.distance}
                          amount={delivery.amount}
                          createdAt={delivery.createdAt}
                          viewType="admin"
                          onViewDetails={handleViewDetails}
                          onCancel={handleCancelDelivery}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="active" className="mt-4 space-y-4">
                {filteredDeliveries.filter((d) => ["ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">No active deliveries</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries
                      .filter((d) => ["ACCEPTED", "IN_PROGRESS"].includes(d.status))
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.id}
                          id={delivery.id}
                          status={delivery.status}
                          orderId={delivery.orderId}
                          restaurant={delivery.restaurant}
                          customer={delivery.customer}
                          driver={delivery.driver}
                          estimatedTime={delivery.estimatedTime}
                          distance={delivery.distance}
                          amount={delivery.amount}
                          createdAt={delivery.createdAt}
                          viewType="admin"
                          onViewDetails={handleViewDetails}
                          onCancel={handleCancelDelivery}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="completed" className="mt-4 space-y-4">
                {filteredDeliveries.filter((d) => d.status === "DELIVERED").length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">No completed deliveries</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries
                      .filter((d) => d.status === "DELIVERED")
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.id}
                          id={delivery.id}
                          status={delivery.status}
                          orderId={delivery.orderId}
                          restaurant={delivery.restaurant}
                          customer={delivery.customer}
                          driver={delivery.driver}
                          estimatedTime={delivery.estimatedTime}
                          distance={delivery.distance}
                          amount={delivery.amount}
                          createdAt={delivery.createdAt}
                          viewType="admin"
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="cancelled" className="mt-4 space-y-4">
                {filteredDeliveries.filter((d) => d.status === "CANCELLED").length === 0 ? (
                  <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                    <p className="text-muted-foreground">No cancelled deliveries</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries
                      .filter((d) => d.status === "CANCELLED")
                      .map((delivery) => (
                        <DeliveryCard
                          key={delivery.id}
                          id={delivery.id}
                          status={delivery.status}
                          orderId={delivery.orderId}
                          restaurant={delivery.restaurant}
                          customer={delivery.customer}
                          driver={delivery.driver}
                          estimatedTime={delivery.estimatedTime}
                          distance={delivery.distance}
                          amount={delivery.amount}
                          createdAt={delivery.createdAt}
                          viewType="admin"
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  )
}
