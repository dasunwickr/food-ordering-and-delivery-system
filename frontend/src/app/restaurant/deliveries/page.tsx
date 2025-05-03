"use client"

import { useState, useEffect } from "react"
import { DeliveryCard } from "@/components/ui/delivery-card"
import { DeliveryTimeline } from "@/components/ui/delivery-timeline"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeliveryStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DeliveryMap } from "@/components/ui/delivery-map"
import { getLocalStorageItem } from "@/utils/storage"
import { getDeliveriesByRestaurantId, getDeliveryWithOrderDetailsAndDriverInfo, IDelivery, updateDelivery } from "@/services/delivery-service"
import { userService, User, RestaurantUser as RestaurantUserType, DriverUser } from "@/services/user-service"
import { toast } from "sonner"

// Item interface for order details
interface OrderItem {
  name: string;
  quantity: number;
}

// Extended User interface to include restaurant-specific fields
interface RestaurantUser extends User {
  restaurantName?: string;
  restaurantAddress?: string;
  location?: { lat: number; lng: number };
}

// Order interface for type checking
interface OrderData {
  customerId: string;
  customerDetails?: {
    address?: string;
    latitude?: number;
    longitude?: number;
    name?: string;
    contact?: string;
  };
  cartItems?: Array<{
    itemName?: string;
    quantity?: number;
  }>;
  totalAmount?: number;
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
    driverId: string;
    name: string;
    phone: string;
    vehicle: string;
  };
  driverLocation?: { lat: number; lng: number };
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

export default function RestaurantDeliveriesPage() {
  const [deliveries, setDeliveries] = useState<FormattedDelivery[]>([])
  const [activeDelivery, setActiveDelivery] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try to get restaurantId from localStorage
    const profile = getLocalStorageItem<any>('userProfile')
    if (profile?.id) {
      setRestaurantId(profile.id)
    }
  }, [])

  useEffect(() => {
    if (restaurantId) {
      fetchDeliveries()
    }
  }, [restaurantId])

  const fetchDeliveries = async () => {
    if (!restaurantId) return
    
    try {
      setLoading(true)
      
      // Get all deliveries for this restaurant from the API
      const apiDeliveries = await getDeliveriesByRestaurantId(restaurantId)
      
      if (apiDeliveries && apiDeliveries.length > 0) {
        // Transform the API response into the format our UI expects
        const formattedDeliveries = await Promise.all(apiDeliveries.map(async (delivery) => {
          try {
            // Default values for restaurant, customer, and driver information
            let restaurantInfo = {
              name: "Restaurant Name",
              address: "Restaurant Address",
              phone: "Restaurant Phone",
              location: { lat: 40.7128, lng: -74.006 }, // Default NYC location
            }
            
            let customerInfo = {
              name: "Customer Name",
              address: "Customer Address",
              phone: "Customer Phone", 
              location: { lat: 40.7282, lng: -73.9942 }, // Default location
            }
            
            let driverInfo = undefined
            let orderItems: OrderItem[] = []
            let orderAmount = "0.00"
            
            try {
              // Get detailed order information
              const orderDetails = await getDeliveryWithOrderDetailsAndDriverInfo(delivery._id || "")
              
              // Get restaurant info
              try {
                const restaurant = await userService.getUserById(restaurantId) as RestaurantUserType
                if (restaurant) {
                  restaurantInfo = {
                    name: restaurant.restaurantName || `${restaurant.firstName} ${restaurant.lastName}'s Restaurant`,
                    address: restaurant.restaurantAddress || "Address not available",
                    phone: restaurant.phone || "Phone not available",
                    location: (() => {
                      if (!restaurant.location) {
                        return { lat: 40.7128, lng: -74.006 }; // Default location
                      }
                      // Check if location already has lat/lng format
                      if ('lat' in restaurant.location && 'lng' in restaurant.location) {
                        return {
                          lat: Number(restaurant.location.lat),
                          lng: Number(restaurant.location.lng)
                        };
                      }
                      // Check if location has x/y format
                      if ('x' in restaurant.location && 'y' in restaurant.location) {
                        return {
                          lat: Number(restaurant.location.y), // y coordinate maps to latitude
                          lng: Number(restaurant.location.x)  // x coordinate maps to longitude
                        };
                      }
                      return { lat: 40.7128, lng: -74.006 }; // Fallback default location
                    })(),
                  }
                }
              } catch (restaurantError) {
                console.error("Error fetching restaurant details:", restaurantError);
                // Continue with default restaurant info
              }
              
              // Get order details to fetch customer and items
              if (orderDetails && orderDetails.order) {
                const order = orderDetails.order as OrderData
                
                // Get customer info
                if (order.customerId) {
                  try {
                    const customer = await userService.getUserById(order.customerId)
                    if (customer) {
                      customerInfo = {
                        name: `${customer.firstName} ${customer.lastName}`,
                        address: order.customerDetails?.address || "Customer Address",
                        phone: customer.phone || "Phone not available",
                        location: { 
                          lat: order.customerDetails?.latitude || 40.7282, 
                          lng: order.customerDetails?.longitude || -73.9942 
                        },
                      }
                    }
                  } catch (customerError) {
                    console.error("Error fetching customer details:", customerError);
                    // Continue with default or order-provided customer info
                  }
                }
                
                // If we have customer details directly in the order, prioritize them
                if (order.customerDetails) {
                  if (order.customerDetails.name) {
                    customerInfo.name = order.customerDetails.name;
                  }
                  if (order.customerDetails.contact) {
                    customerInfo.phone = order.customerDetails.contact;
                  }
                }
                
                // Get order items
                if (order.cartItems && Array.isArray(order.cartItems)) {
                  orderItems = order.cartItems.map((item) => ({
                    name: item.itemName || "Unknown Item",
                    quantity: item.quantity || 1,
                  }))
                }

                // Get order amount
                if (order.totalAmount) {
                  orderAmount = order.totalAmount.toString()
                }
              }
              
              // Get driver info if assigned
              if (delivery.driverId) {
                console.log(`Fetching driver info for ID: ${delivery.driverId}`);
                try {
                  const driver = await userService.getUserById(delivery.driverId) as DriverUser;
                  if (driver) {
                    driverInfo = {
                      driverId: driver.id,
                      name: `${driver.firstName} ${driver.lastName}`,
                      phone: driver.phone || "Phone not available",
                      vehicle: driver.vehicleNumber || "Vehicle Info",
                    };
                    console.log(`Retrieved driver details: ${driver.firstName} ${driver.lastName}`);
                  } else {
                    // Driver record exists in delivery but not in user service
                    console.warn(`Driver with ID ${delivery.driverId} exists in delivery record but couldn't be found in user service`);
                    driverInfo = {
                      driverId: delivery.driverId,
                      name: "Driver data unavailable",
                      phone: "Phone not available",
                      vehicle: "Vehicle information unavailable",
                    };
                  }
                } catch (driverError) {
                  console.error("Error fetching driver details:", driverError);
                  // Continue without driver info if fetching fails
                  driverInfo = {
                    driverId: delivery.driverId,
                    name: "Driver information unavailable",
                    phone: "Phone not available",
                    vehicle: "Vehicle information unavailable",
                  };
                }
              }
              
              // Get driver's real-time location if available
              let driverLocation = undefined;
              try {
                if (orderDetails.driverLocation) {
                  driverLocation = orderDetails.driverLocation;
                } else if (delivery.driverId) {
                  // Try to get location directly from driver service as fallback
                  try {
                    const driverLocationData = await userService.getDriverCurrentLocation(delivery.driverId);
                    if (driverLocationData) {
                      driverLocation = driverLocationData;
                      console.log(`Retrieved driver location for ${delivery.driverId}:`, driverLocationData);
                    }
                  } catch (locError) {
                    console.warn(`Could not get current location for driver ${delivery.driverId}:`, locError);
                    // Use default location as fallback
                    driverLocation = { lat: 40.7128, lng: -74.006 };
                  }
                }
              } catch (locationError) {
                console.error("Error fetching driver location:", locationError);
                // Continue without driver location if fetching fails
              }
              
              // Calculate estimated delivery times
              const estimatedTime = delivery.status === "DELIVERED" ? "0 min" : "15 min"
              const distance = "2.5 mi" // Placeholder - would be calculated based on coordinates
              
              return {
                id: delivery._id || "",
                status: delivery.status as DeliveryStatus,
                orderId: delivery.orderId,
                restaurant: restaurantInfo,
                customer: customerInfo,
                driver: driverInfo,
                driverLocation: driverLocation,
                estimatedTime,
                distance,
                amount: orderAmount,
                items: orderItems,
                createdAt: delivery.createdAt || new Date().toISOString(),
                timestamps: {
                  createdAt: delivery.createdAt || new Date().toISOString(),
                  acceptedAt: delivery.acceptedAt,
                  pickedUpAt: delivery.acceptedAt && delivery.deliveredAt 
                    ? new Date((new Date(delivery.acceptedAt).getTime() + 
                      new Date(delivery.deliveredAt).getTime()) / 2).toISOString()
                    : undefined,
                  deliveredAt: delivery.deliveredAt,
                },
              }
            } catch (error) {
              console.error("Error processing delivery details:", error)
              return null
            }
          } catch (error) {
            console.error("Error formatting delivery:", error)
            return null
          }
        }))
        
        // Filter out any null values from failed transformations
        setDeliveries(formattedDeliveries.filter(Boolean) as FormattedDelivery[])
      } else {
        // No deliveries found - use empty array
        setDeliveries([])
      }
      
    } catch (err) {
      console.error("Failed to fetch deliveries:", err)
      setError("Failed to load deliveries. Please try again later.")
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (id: string) => {
    setActiveDelivery(id)
  }

  // New handler for the Hand to Driver button
  const handleHandToDriver = async (deliveryId: string) => {
    try {
      const delivery = deliveries.find(d => d.id === deliveryId)
      if (!delivery) {
        throw new Error("Delivery not found")
      }
      
      if (!delivery.driver) {
        toast.error("No driver assigned to this delivery")
        return
      }
      
      // Update delivery status to IN_PROGRESS
      await updateDelivery(deliveryId, { status: "IN_PROGRESS" })
      
      // Update status locally
      setDeliveries(
        deliveries.map((d) =>
          d.id === deliveryId ? { ...d, status: "IN_PROGRESS" as DeliveryStatus } : d
        ),
      )
      
      toast.success(`Order handed to ${delivery.driver.name} successfully`)
      
      // Refresh the deliveries list
      fetchDeliveries()
    } catch (error) {
      console.error("Failed to update delivery status:", error)
      toast.error("Failed to update delivery status")
    }
  }

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const activeDeliveryData = deliveries.find((delivery) => delivery.id === activeDelivery)

  const handleRefresh = () => {
    fetchDeliveries()
  }

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
          <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by order ID or customer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleRefresh}>Refresh</Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {activeDelivery && activeDeliveryData ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              {/* Delivery Map */}
              <DeliveryMap
                driverLocation={{
                  lat: activeDeliveryData.driverLocation?.lat || 0,
                  lng: activeDeliveryData.driverLocation?.lng || 0,
                  label: activeDeliveryData.driver?.name || "Driver",
                  icon: "driver",
                }}
                pickupLocation={{
                  lat: Number(activeDeliveryData.restaurant.location.lat) || 40.7128,
                  lng: Number(activeDeliveryData.restaurant.location.lng) || -74.006,
                  label: activeDeliveryData.restaurant.name,
                  icon: "restaurant",
                }}
                dropoffLocation={{
                  lat: Number(activeDeliveryData.customer.location.lat) || 40.7303,
                  lng: Number(activeDeliveryData.customer.location.lng) || -74.0054,
                  label: activeDeliveryData.customer.name,
                  icon: "customer",
                }}
                className="h-[400px]"
                driverId={activeDeliveryData.driver?.driverId || undefined}
                enableLiveTracking={Boolean(activeDeliveryData.driver) && 
                  ["ACCEPTED", "IN_PROGRESS"].includes(activeDeliveryData.status)}
              />

              {/* Delivery Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Timeline</CardTitle>
                  <CardDescription>Track the progress of this delivery</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeliveryTimeline status={activeDeliveryData.status} timestamps={activeDeliveryData.timestamps} />
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setActiveDelivery(null)}>
                    Back to List
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              {/* Delivery Card */}
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
                viewType="restaurant"
                className="mb-4"
              />

              {/* Order Items */}
              <div className="rounded-lg border">
                <div className="border-b p-4">
                  <h3 className="font-medium">Order Items</h3>
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
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${activeDeliveryData.amount}</span>
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
              <TabsTrigger value="all">All Deliveries</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4 space-y-4">
              {filteredDeliveries.filter((d) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No active deliveries</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDeliveries
                    .filter((d) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status))
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
                        viewType="restaurant"
                        onViewDetails={handleViewDetails}
                        onHandToDriver={handleHandToDriver}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-4 space-y-4">
              {filteredDeliveries.filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No completed deliveries</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredDeliveries
                    .filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status))
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
                        viewType="restaurant"
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
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
                      viewType="restaurant"
                      onViewDetails={handleViewDetails}
                      onHandToDriver={handleHandToDriver}
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