"use client"

import { useState, useEffect } from "react"
import { DeliveryCard } from "@/components/ui/delivery-card"
import { DeliveryTimeline } from "@/components/ui/delivery-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeliveryStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryMap } from "@/components/ui/delivery-map"
import { getDeliveriesByCustomerId, getDeliveryWithOrderDetailsAndDriverInfo, IDelivery } from "@/services/delivery-service"
import { userService, User, RestaurantUser, DriverUser } from "@/services/user-service"
import { getLocalStorageItem } from "@/utils/storage"
import { toast } from "sonner"
import axios from "axios"
import { subscribeToDriverLocation, unsubscribeFromDriverLocation } from "@/lib/socket"

// Item interface
interface OrderItem {
  name: string;
  quantity: number;
}

// Format for the transformed delivery data
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
  };
}

// Sample data as fallback in case API fails
const SAMPLE_ORDERS = [
  {
    id: "del-001",
    status: "IN_PROGRESS" as DeliveryStatus,
    orderId: "ORD-1234",
    restaurant: {
      name: "Burger Palace",
      address: "123 Main St, New York, NY",
      phone: "555-123-4567",
      location: { lat: 40.7128, lng: -74.006 },
    },
    customer: {
      name: "John Smith",
      address: "456 Park Ave, New York, NY",
      phone: "555-987-6543",
      location: { lat: 40.7282, lng: -73.9942 },
    },
    driver: {
      name: "Michael Johnson",
      phone: "555-555-5555",
      vehicle: "Honda Civic (ABC-1234)",
    },
    driverLocation: { lat: 40.72, lng: -74.0 },
    estimatedTime: "15 min",
    distance: "2.3 mi",
    amount: "24.50",
    items: [
      { name: "Cheeseburger", quantity: 2 },
      { name: "Fries", quantity: 1 },
      { name: "Soda", quantity: 2 },
    ],
    createdAt: new Date().toISOString(),
    timestamps: {
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      acceptedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      pickedUpAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  },
  {
    id: "del-002",
    status: "DELIVERED" as DeliveryStatus,
    orderId: "ORD-5678",
    restaurant: {
      name: "Pizza Express",
      address: "789 Broadway, New York, NY",
      phone: "555-222-3333",
      location: { lat: 40.7309, lng: -73.9872 },
    },
    customer: {
      name: "John Smith",
      address: "456 Park Ave, New York, NY",
      phone: "555-987-6543",
      location: { lat: 40.7282, lng: -73.9942 },
    },
    driver: {
      name: "David Brown",
      phone: "555-666-7777",
      vehicle: "Toyota Prius (XYZ-5678)",
    },
    driverLocation: { lat: 40.7282, lng: -73.9942 },
    estimatedTime: "0 min",
    distance: "1.8 mi",
    amount: "32.75",
    items: [
      { name: "Large Pepperoni Pizza", quantity: 1 },
      { name: "Garlic Knots", quantity: 1 },
      { name: "2L Soda", quantity: 1 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    timestamps: {
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      acceptedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      pickedUpAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      deliveredAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
  },
  {
    id: "del-003",
    status: "PENDING" as DeliveryStatus,
    orderId: "ORD-9012",
    restaurant: {
      name: "Sushi Delight",
      address: "567 West St, New York, NY",
      phone: "555-333-4444",
      location: { lat: 40.7352, lng: -74.0086 },
    },
    customer: {
      name: "John Smith",
      address: "456 Park Ave, New York, NY",
      phone: "555-987-6543",
      location: { lat: 40.7282, lng: -73.9942 },
    },
    driverLocation: { lat: 40.7352, lng: -74.0086 },
    estimatedTime: "25 min",
    distance: "2.5 mi",
    amount: "45.50",
    items: [
      { name: "California Roll", quantity: 2 },
      { name: "Spicy Tuna Roll", quantity: 1 },
      { name: "Miso Soup", quantity: 2 },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    timestamps: {
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  },
]

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<FormattedDelivery[]>([])
  const [activeOrder, setActiveOrder] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [userProfile, setUserProfile] = useState<any>(null)
  
  useEffect(() => {
    // Try to get userId from localStorage
    const profile = getLocalStorageItem<any>('userProfile')
    if (profile?.id) {
      setUserId(profile.id)
      setUserProfile(profile)
    }
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) {
        // If no userId is available yet, don't make the API call
        return
      }
      
      try {
        setLoading(true)
        
        try {
          const response = await axios.get(`/api/order/customer/${userId}`);
          
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            const formattedOrdersPromises = response.data.map(async (order: any) => {
              try {
                // Default values for restaurant and customer information
                let restaurantInfo = {
                  name: "Restaurant Name",
                  address: "Restaurant Address",
                  phone: "Restaurant Phone",
                  location: { lat: 40.7128, lng: -74.006 }, // Default NYC location
                }
                
                // Try to get restaurant details from user-service
                if (order.restaurantId) {
                  try {
                    const restaurantData = await userService.getUserById(order.restaurantId) as RestaurantUser;
                    if (restaurantData) {
                      restaurantInfo = {
                        name: restaurantData.restaurantName || `${restaurantData.firstName} ${restaurantData.lastName}'s Restaurant`,
                        address: restaurantData.restaurantAddress || "Restaurant Address",
                        phone: restaurantData.phone || restaurantData.contactNumber || "Restaurant Phone",
                        location: restaurantData.location && 'lat' in restaurantData.location ? 
                          restaurantData.location : 
                          { lat: 40.7128, lng: -74.006 },
                      }
                    }
                  } catch (restaurantError) {
                    console.error("Error fetching restaurant details:", restaurantError);
                    // Continue with default restaurant info
                  }
                }
                
                // Use customer details from the order
                let customerInfo = {
                  name: order.customerDetails?.name || "Customer Name",
                  address: "Customer Address",
                  phone: order.customerDetails?.contact || "Customer Phone",
                  location: { 
                    lat: order.customerDetails?.latitude || 40.7282, 
                    lng: order.customerDetails?.longitude || -73.9942
                  },
                }
                
                // Get order items
                let orderItems: OrderItem[] = []
                if (order.cartItems && Array.isArray(order.cartItems)) {
                  orderItems = order.cartItems.map((item: any) => ({
                    name: item.itemName || 'Unknown Item',
                    quantity: item.quantity || 1
                  }))
                }
                
                // Handle driver information and live location
                let driverInfo = undefined
                let driverCurrentLocation = { 
                  lat: order.driverDetails?.latitude || 40.72, 
                  lng: order.driverDetails?.longitude || -74.0 
                } // Default location
                
                if (order.driverDetails?.driverId) {
                  try {
                    const driver = await userService.getUserById(order.driverDetails.driverId);
                    
                    // Get real-time driver location if available
                    const currentLocation = await userService.getDriverCurrentLocation(order.driverDetails.driverId);
                    if (currentLocation) {
                      driverCurrentLocation = currentLocation;
                    }
                    
                    // Get vehicle details
                    let vehicleInfo = order.driverDetails.vehicleNumber || "Vehicle Info";
                    const vehicleDetails = await userService.getDriverVehicleDetails(order.driverDetails.driverId);
                    if (vehicleDetails && vehicleDetails.type && vehicleDetails.vehicleNumber) {
                      vehicleInfo = `${vehicleDetails.type} (${vehicleDetails.vehicleNumber})`;
                    } else if (vehicleDetails && vehicleDetails.vehicleNumber) {
                      vehicleInfo = vehicleDetails.vehicleNumber;
                    }
                    
                    if (driver) {
                      driverInfo = {
                        name: `${driver.firstName} ${driver.lastName}`,
                        phone: driver.phone || "Driver Phone",
                        vehicle: vehicleInfo,
                      }
                    } else {
                      // Fallback to data in the order if driver details not found
                      driverInfo = {
                        name: order.driverDetails.driverName || "Driver Name",
                        phone: "Driver Phone", 
                        vehicle: vehicleInfo,
                      }
                    }
                  } catch (driverError) {
                    console.error("Error fetching driver details:", driverError);
                    // Use the basic driver info from the order
                    driverInfo = {
                      name: order.driverDetails.driverName || "Driver Name",
                      phone: "Driver Phone", 
                      vehicle: order.driverDetails.vehicleNumber || "Vehicle Info",
                    }
                  }
                }
                
                // Map the order status to our delivery status format
                let status: DeliveryStatus = "PENDING"
                switch (order.orderStatus?.toLowerCase()) {
                  case "pending":
                    status = "PENDING"
                    break
                  case "confirmed":
                    status = "ACCEPTED"
                    break
                  case "out for delivery":
                    status = "IN_PROGRESS"
                    break
                  case "delivered":
                    status = "DELIVERED"
                    break
                  case "cancelled":
                    status = "CANCELLED"
                    break
                  default:
                    status = "PENDING"
                }
                
                // Calculate estimated delivery times and distances
                const estimatedTime = order.orderStatus === "Delivered" ? "0 min" : "15 min"
                const distance = "2.5 mi" // Placeholder
                
                const formattedOrder = {
                  id: order.orderId,
                  status: status,
                  orderId: order.orderId,
                  restaurant: restaurantInfo,
                  customer: customerInfo,
                  driver: driverInfo,
                  driverLocation: driverCurrentLocation,
                  estimatedTime: estimatedTime,
                  distance: distance,
                  amount: order.totalAmount ? order.totalAmount.toString() : "0.00",
                  items: orderItems,
                  createdAt: order.createdAt || new Date().toISOString(),
                  timestamps: {
                    createdAt: order.createdAt || new Date().toISOString(),
                    acceptedAt: order.updatedAt, 
                    pickedUpAt: undefined,
                    deliveredAt: order.orderStatus === "Delivered" ? order.updatedAt : undefined
                  }
                };
                
                // Subscribe to real-time driver location updates when there's an active delivery
                if (order.driverDetails?.driverId && ["confirmed", "out for delivery"].includes(order.orderStatus?.toLowerCase())) {
                  // Use a consistent driverId format
                  const driverIdString = String(order.driverDetails.driverId);
                  console.log(`Setting up location subscription for driver: ${driverIdString} on order: ${order.orderId}`);
                  
                  // Subscribe to real-time location updates via socket
                  subscribeToDriverLocation(driverIdString, (location) => {
                    if (location && location.lat && location.lng) {
                      console.log(`Received location update for driver ${driverIdString}:`, location);
                      
                      // Update the orders state with the new driver location
                      setOrders(prev => prev.map(prevOrder => {
                        // Match by orderId since that's what we track in the UI
                        if (prevOrder.orderId === order.orderId) {
                          return {
                            ...prevOrder,
                            driverLocation: {
                              lat: location.lat,
                              lng: location.lng
                            }
                          };
                        }
                        return prevOrder;
                      }));
                    }
                  });
                }
                
                return formattedOrder;
              } catch (error) {
                console.error("Error formatting order:", error)
                return null
              }
            });
            
            const formattedOrders = await Promise.all(formattedOrdersPromises);
            
            setOrders(formattedOrders.filter(Boolean) as FormattedDelivery[]);
            setLoading(false);
            return;
          }
        } catch (orderErr) {
          console.error("Error fetching orders from order service:", orderErr);
        }
        
        // Rest of the code remains unchanged...
        const deliveries = await getDeliveriesByCustomerId(userId)
        
        if (deliveries && deliveries.length > 0) {
          // Transform the API response into the format our UI expects
          const formattedDeliveries = await Promise.all(deliveries.map(async (delivery) => {
            try {
              // Get detailed order and driver information using the enhanced service
              const orderDetails = await getDeliveryWithOrderDetailsAndDriverInfo(delivery._id || '')
              
              // Default values for restaurant and customer information
              let restaurantInfo = {
                name: "Restaurant Name",
                address: "Restaurant Address",
                phone: "Restaurant Phone",
                location: { lat: 40.7128, lng: -74.006 }, // Default NYC location
              }
              
              let customerInfo = {
                name: `${userProfile?.firstName} ${userProfile?.lastName}` || "Customer Name",
                address: "Customer Address",
                phone: userProfile?.phone || userProfile?.contactNumber || "Customer Phone",
                location: userProfile?.location || { lat: 40.7282, lng: -73.9942 }, // Default location
              }
              
              // Default for order items
              let orderItems: OrderItem[] = []
              let orderAmount = "0.00"
              
              // Try to get restaurant details if we have restaurantId
              if (orderDetails?.order?.restaurantId && typeof orderDetails.order.restaurantId === 'string') {
                try {
                  const restaurantData = await userService.getUserById(orderDetails.order.restaurantId) as RestaurantUser;
                  if (restaurantData) {
                    restaurantInfo = {
                      name: restaurantData.restaurantName || `${restaurantData.firstName} ${restaurantData.lastName}'s Restaurant`,
                      address: restaurantData.restaurantAddress || "Restaurant Address",
                      phone: restaurantData.phone || restaurantData.contactNumber || "Restaurant Phone",
                      location: restaurantData.location && 'lat' in restaurantData.location ? 
                        restaurantData.location : 
                        restaurantData.location && 'x' in restaurantData.location ?
                        { lat: restaurantData.location.x, lng: restaurantData.location.y } :
                        { lat: 40.7128, lng: -74.006 },
                    }
                  }
                } catch (restaurantError) {
                  console.error("Error fetching restaurant details:", restaurantError);
                  // Continue with default restaurant info
                }
              }
              
              // Populate with real data if available
              if (orderDetails?.order) {
                // Extract order items
                if (orderDetails.order.cartItems && Array.isArray(orderDetails.order.cartItems)) {
                  orderItems = orderDetails.order.cartItems.map(item => ({
                    name: item.itemName || 'Unknown Item',
                    quantity: item.quantity || 1
                  }))
                }
                
                // Extract customer details if available
                if (orderDetails.order.customerDetails) {
                  const details = orderDetails.order.customerDetails
                  // Access properties safely, checking if they exist on the object
                  if ('name' in details && details.name && typeof details.name === 'string') {
                    customerInfo.name = details.name
                  }
                  if (details.address) {
                    customerInfo.address = details.address
                  }
                  if ('contact' in details && details.contact) {
                    customerInfo.phone = details.contact
                  }
                  if (details.latitude && details.longitude) {
                    customerInfo.location = { 
                      lat: details.latitude, 
                      lng: details.longitude 
                    }
                  }
                }
                
                if (orderDetails.order.totalAmount) {
                  orderAmount = orderDetails.order.totalAmount.toString()
                }
              }
              
              let driverInfo = undefined
              let driverCurrentLocation = { lat: 40.72, lng: -74.0 }; 
              
              if (orderDetails.driverLocation) {
                driverCurrentLocation = orderDetails.driverLocation;
              }
              
              if (delivery.driverId) {
                try {
                  const driver = await userService.getUserById(delivery.driverId);
                  
                  let vehicleInfo = "Vehicle Info";
                  if (orderDetails.vehicleDetails) {
                    if (orderDetails.vehicleDetails.type && orderDetails.vehicleDetails.vehicleNumber) {
                      vehicleInfo = `${orderDetails.vehicleDetails.type} (${orderDetails.vehicleDetails.vehicleNumber})`;
                    } else if (orderDetails.vehicleDetails.vehicleNumber) {
                      vehicleInfo = orderDetails.vehicleDetails.vehicleNumber;
                    }
                  }
                  
                  if (driver) {
                    driverInfo = {
                      name: `${driver.firstName} ${driver.lastName}`,
                      phone: driver.phone || "Driver Phone",
                      vehicle: vehicleInfo,
                    }
                  }
                } catch (driverError) {
                  console.error("Error fetching driver details:", driverError);
                  // Fallback to basic driver info
                  driverInfo = {
                    name: "Driver Name",
                    phone: "Driver Phone",
                    vehicle: "Vehicle Info",
                  }
                }
              }
              
              // Calculate estimated delivery times and distances (would normally come from the API)
              const estimatedTime = delivery.status === "DELIVERED" ? "0 min" : "15 min"
              const distance = "2.5 mi" // Placeholder - would be calculated based on coordinates
              
              // Format the delivery data
              const formattedDelivery = {
                id: delivery._id || '',
                status: delivery.status as DeliveryStatus,
                orderId: delivery.orderId,
                restaurant: restaurantInfo,
                customer: customerInfo,
                driver: driverInfo,
                driverLocation: driverCurrentLocation,
                estimatedTime: estimatedTime,
                distance: distance,
                amount: orderAmount,
                items: orderItems,
                createdAt: delivery.createdAt || new Date().toISOString(),
                timestamps: {
                  createdAt: delivery.createdAt || new Date().toISOString(),
                  acceptedAt: delivery.acceptedAt,
                  deliveredAt: delivery.deliveredAt,
                  pickedUpAt: delivery.acceptedAt && delivery.deliveredAt 
                    ? new Date((new Date(delivery.acceptedAt).getTime() + 
                      new Date(delivery.deliveredAt).getTime()) / 2).toISOString()
                    : undefined
                }
              }

              // Subscribe to real-time driver location updates when there's an active, in-progress delivery
              if (delivery.driverId && ["ACCEPTED", "IN_PROGRESS"].includes(delivery.status)) {
                try {
                  // Convert driverId to string and ensure it's not undefined
                  const driverIdString = String(delivery.driverId);
                  
                  // Subscribe to real-time driver location updates
                  subscribeToDriverLocation(driverIdString, (location) => {
                    if (location && location.lat && location.lng) {
                      console.log(`Got real-time location update for driver ${driverIdString}:`, location);
                      // Update the driver location in our state
                      setOrders(prev => 
                        prev.map(order => 
                          order.id === delivery._id 
                            ? { 
                                ...order, 
                                driverLocation: { 
                                  lat: location.lat, 
                                  lng: location.lng 
                                } 
                              } 
                            : order
                        )
                      );
                    }
                  });
                } catch (locationError) {
                  console.error("Error subscribing to driver location:", locationError);
                }
              }
              
              return formattedDelivery;
            } catch (error) {
              console.error("Error formatting delivery:", error)
              return null
            }
          }))
          
          // Filter out any null values from failed transformations
          setOrders(formattedDeliveries.filter(Boolean) as FormattedDelivery[])
        } else {
          // No deliveries found - use empty array
          setOrders([])
        }
        
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        setError("Failed to load your orders. Please try again later.")
        // Use sample data as fallback
        setOrders(SAMPLE_ORDERS)
      } finally {
        setLoading(false)
      }
    }
    
    fetchOrders()
    
    // Clean up function to unsubscribe from all driver location updates
    return () => {
      // Get all unique driver IDs from orders with active deliveries
      const activeDriverIds = new Set<string>();
      
      orders.forEach(order => {
        if (order.driver && ["ACCEPTED", "IN_PROGRESS"].includes(order.status)) {
          // Try to extract driver ID from the order data
          const driverIdFromOrder = order.orderId.split('-')[0]; // This is just one possible format
          if (driverIdFromOrder) {
            activeDriverIds.add(driverIdFromOrder);
          }
        }
      });
      
      // Unsubscribe from all active driver location updates
      activeDriverIds.forEach(driverId => {
        console.log(`Unsubscribing from location updates for driver: ${driverId}`);
        unsubscribeFromDriverLocation(driverId);
      });
    };
  }, [userId, userProfile]);

  const handleViewDetails = (id: string) => {
    setActiveOrder(id)
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Define activeOrderData before using it in the useEffect hook
  const activeOrderData = orders.find((order) => order.id === activeOrder)

  // Add a useEffect to handle location updates for the active order
  useEffect(() => {
    if (activeOrder && activeOrderData) {
      // If there's an active order being viewed and it has driver details
      if (activeOrderData.driver && ["ACCEPTED", "IN_PROGRESS"].includes(activeOrderData.status)) {
        // Try different ways to get the driverId
        let driverId: string | undefined;
        
        // Attempt to get driverId from the order data structure
        if (activeOrderData.orderId) {
          // In some systems, the orderId might contain or be prefixed with the driverId
          const possibleDriverId = activeOrderData.orderId.split('-')[0];
          
          if (possibleDriverId) {
            driverId = possibleDriverId;
            console.log(`Using driver ID from orderId: ${driverId}`);
          }
        }
        
        if (driverId) {
          // Subscribe to real-time location updates for this specific driver
          subscribeToDriverLocation(driverId, (location) => {
            if (location && location.lat && location.lng) {
              console.log(`Active order: received location update for driver ${driverId}:`, location);
              
              // Update only the active order's driver location
              setOrders(prev => 
                prev.map(order => 
                  order.id === activeOrderData.id 
                    ? {
                        ...order,
                        driverLocation: {
                          lat: location.lat,
                          lng: location.lng
                        }
                      }
                    : order
                )
              );
            }
          });
          
          // Clean up subscription when the active order changes or component unmounts
          return () => {
            unsubscribeFromDriverLocation(driverId!);
          };
        }
      }
    }
  }, [activeOrder, activeOrderData]);

  const handleRateDelivery = () => {
    setShowRating(true)
  }

  const submitRating = async () => {
    try {
      if (!activeOrderData?.id) {
        throw new Error("No active order to rate")
      }
      
      // In a real app, this would call an API to submit the rating
      // For now, we'll just simulate that with a delay
      setLoading(true)
      
      // Mock API call - would be a real API call in production
      // await updateDelivery(activeOrderData.id, { rating })
      
      toast.success("Thank you for your rating!")
      setShowRating(false)
    } catch (error) {
      console.error("Failed to submit rating:", error)
      toast.error("Failed to submit your rating. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading orders...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order ID or restaurant..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {activeOrder && activeOrderData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {activeOrderData.status === "DELIVERED" ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Order Delivered</CardTitle>
                    <CardDescription>Your order has been delivered successfully</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DeliveryTimeline status={activeOrderData.status} timestamps={activeOrderData.timestamps} />
                  </CardContent>
                  <CardFooter>
                    {!showRating ? (
                      <Button onClick={handleRateDelivery} className="w-full">
                        Rate Delivery
                      </Button>
                    ) : (
                      <div className="space-y-4 w-full">
                        <div className="flex justify-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} type="button" onClick={() => setRating(star)} className="p-1">
                              <Star
                                className={`h-8 w-8 ${
                                  rating >= star ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                        <Button onClick={submitRating} className="w-full" disabled={rating === 0}>
                          Submit Rating
                        </Button>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ) : (
                <DeliveryMap
                  driverLocation={{
                    lat: activeOrderData.driverLocation.lat,
                    lng: activeOrderData.driverLocation.lng,
                    label: activeOrderData.driver?.name || "Driver",
                    icon: "driver",
                  }}
                  pickupLocation={{
                    lat: activeOrderData.restaurant.location.lat,
                    lng: activeOrderData.restaurant.location.lng,
                    label: activeOrderData.restaurant.name,
                    icon: "restaurant",
                  }}
                  dropoffLocation={{
                    lat: activeOrderData.customer.location.lat,
                    lng: activeOrderData.customer.location.lng,
                    label: "Your Location",
                    icon: "customer",
                  }}
                  className="h-[400px]"
                  // Pass the actual driver ID from the delivery data instead of trying to extract it from the order ID
                  driverId={activeOrderData.driver ? String(activeOrderData.orderId).split('-')[0] : undefined}
                  enableLiveTracking={Boolean(activeOrderData.driver) && 
                    ["ACCEPTED", "IN_PROGRESS"].includes(activeOrderData.status)}
                />
              )}

              {activeOrderData.status !== "DELIVERED" && (
                <DeliveryTimeline status={activeOrderData.status} timestamps={activeOrderData.timestamps} />
              )}

              <Button variant="outline" className="w-full" onClick={() => setActiveOrder(null)}>
                Back to Orders
              </Button>
            </div>

            <div>
              <DeliveryCard
                id={activeOrderData.id}
                status={activeOrderData.status}
                orderId={activeOrderData.orderId}
                restaurant={activeOrderData.restaurant}
                customer={activeOrderData.customer}
                driver={activeOrderData.driver}
                estimatedTime={activeOrderData.estimatedTime}
                distance={activeOrderData.distance}
                amount={activeOrderData.amount}
                createdAt={activeOrderData.createdAt}
                viewType="customer"
                className="mb-4"
              />

              <div className="rounded-lg border">
                <div className="border-b p-4">
                  <h3 className="font-medium">Order Summary</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {activeOrderData.items.map((item, index) => (
                      <li key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${(Number.parseFloat(activeOrderData.amount) - 5).toFixed(2)}</span>
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
                      <span>${activeOrderData.amount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="all">All Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4 space-y-4">
              {filteredOrders.filter((d) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No active orders</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOrders
                    .filter((d) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status))
                    .map((order) => (
                      <DeliveryCard
                        key={order.id}
                        id={order.id}
                        status={order.status}
                        orderId={order.orderId}
                        restaurant={order.restaurant}
                        customer={order.customer}
                        driver={order.driver}
                        estimatedTime={order.estimatedTime}
                        distance={order.distance}
                        amount={order.amount}
                        createdAt={order.createdAt}
                        viewType="customer"
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-4 space-y-4">
              {filteredOrders.filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No completed orders</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOrders
                    .filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status))
                    .map((order) => (
                      <DeliveryCard
                        key={order.id}
                        id={order.id}
                        status={order.status}
                        orderId={order.orderId}
                        restaurant={order.restaurant}
                        customer={order.customer}
                        driver={order.driver}
                        estimatedTime={order.estimatedTime}
                        distance={order.distance}
                        amount={order.amount}
                        createdAt={order.createdAt}
                        viewType="customer"
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="all" className="mt-4 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredOrders.map((order) => (
                    <DeliveryCard
                      key={order.id}
                      id={order.id}
                      status={order.status}
                      orderId={order.orderId}
                      restaurant={order.restaurant}
                      customer={order.customer}
                      driver={order.driver}
                      estimatedTime={order.estimatedTime}
                      distance={order.distance}
                      amount={order.amount}
                      createdAt={order.createdAt}
                      viewType="customer"
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </>
  )
}
