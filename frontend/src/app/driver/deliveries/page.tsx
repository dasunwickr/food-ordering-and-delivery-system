"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DeliveryCard } from "@/components/ui/delivery-card"
import { DeliveryRequestModal } from "@/components/ui/delivery-request-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { DeliveryStatus } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { DeliveryMap } from "@/components/ui/delivery-map"
import { DriverLocationSharing } from "@/components/ui/driver-location-sharing"
import { getCookie } from "cookies-next"
import { getDeliveriesByDriverId, updateDelivery, getDeliveryWithOrderDetailsAndDriverInfo, IDelivery } from "@/services/delivery-service"
import { userService, RestaurantUser, User } from "@/services/user-service"
import { getLocalStorageItem } from "@/utils/storage"
import { toast } from "sonner"

// Sample request data (for simulating new delivery requests)
const NEW_DELIVERY_REQUEST = {
  id: "del-003",
  orderId: "ORD-9012",
  restaurant: {
    name: "Sushi Delight",
    address: "567 West St, New York, NY",
    phone: "555-333-4444",
    location: { lat: 40.7352, lng: -74.0086 },
  },
  customer: {
    name: "Sarah Johnson",
    address: "890 Hudson St, New York, NY",
    phone: "555-666-7777",
    location: { lat: 40.7303, lng: -74.0054 },
  },
  items: [
    { name: "California Roll", quantity: 2 },
    { name: "Spicy Tuna Roll", quantity: 1 },
    { name: "Miso Soup", quantity: 2 },
  ],
  estimatedTime: "20 min",
  distance: "2.5 mi",
  amount: "10.75",
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
}

export default function DriverDeliveriesPage() {
  const router = useRouter()
  const [deliveries, setDeliveries] = useState<FormattedDelivery[]>([])
  const [activeDelivery, setActiveDelivery] = useState<string | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [simulateNewRequest, setSimulateNewRequest] = useState(false)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get driver ID from cookie or localStorage
    const cookieDriverId = getCookie('userId')?.toString();
    const localStorageDriverId = typeof window !== 'undefined' 
      ? localStorage.getItem('userId')
      : null;
    const userProfile = getLocalStorageItem<any>('userProfile');
    
    setDriverId(cookieDriverId || localStorageDriverId || userProfile?.id || "driver-001");
  }, []);

  useEffect(() => {
    // Fetch deliveries when driverId is available
    if (driverId) {
      fetchDeliveries();
    }
  }, [driverId]);

  const fetchDeliveries = async () => {
    if (!driverId) return;
    
    try {
      setLoading(true);
      const apiDeliveries = await getDeliveriesByDriverId(driverId);
      
      if (apiDeliveries && apiDeliveries.length > 0) {
        // Transform the API response into the format our UI expects
        const formattedDeliveries = await Promise.all(apiDeliveries.map(async (delivery) => {
          try {
            // Get detailed order and driver information using the enhanced service
            const orderDetails = await getDeliveryWithOrderDetailsAndDriverInfo(delivery._id || '');
            
            // Default values for restaurant and customer information
            let restaurantInfo = {
              name: "Restaurant Name",
              address: "Restaurant Address",
              phone: "Restaurant Phone",
              location: { lat: 40.7128, lng: -74.006 }, // Default NYC location
            };
            
            let customerInfo = {
              name: "Customer Name",
              address: "Customer Address",
              phone: "Customer Phone",
              location: { lat: 40.7282, lng: -73.9942 }, // Default location
            };
            
            // Default for order items
            let orderItems: OrderItem[] = [];
            let orderAmount = "0.00";
            
            // Try to get restaurant details if we have restaurantId
            if (orderDetails?.order?.restaurantId) {
              try {
                const restaurantData = await userService.getUserById(orderDetails.order.restaurantId) as RestaurantUser;
                if (restaurantData) {
                  restaurantInfo = {
                    name: restaurantData.restaurantName || `${restaurantData.firstName} ${restaurantData.lastName}'s Restaurant`,
                    address: restaurantData.restaurantAddress || "Restaurant Address",
                    phone: restaurantData.phone || restaurantData.contactNumber || "Restaurant Phone",
                    location: restaurantData.location || { lat: 40.7128, lng: -74.006 },
                  };
                }
              } catch (restaurantError) {
                console.error("Error fetching restaurant details:", restaurantError);
                // Continue with default restaurant info
              }
            }
            
            // Populate customer info from order data
            if (orderDetails?.order?.customerDetails) {
              const details = orderDetails.order.customerDetails;
              if ('name' in details && details.name) {
                customerInfo.name = details.name;
              }
              if (details.address) {
                customerInfo.address = details.address;
              }
              if ('contact' in details && details.contact) {
                customerInfo.phone = details.contact;
              }
              if (details.latitude && details.longitude) {
                customerInfo.location = { 
                  lat: details.latitude, 
                  lng: details.longitude 
                };
              }
            }
            
            if (orderDetails?.order?.totalAmount) {
              orderAmount = orderDetails.order.totalAmount.toString();
            }
            
            // Extract order items if available
            if (orderDetails?.order?.cartItems && Array.isArray(orderDetails.order.cartItems)) {
              orderItems = orderDetails.order.cartItems.map(item => ({
                name: item.itemName || 'Unknown Item',
                quantity: item.quantity || 1
              }));
            }
            
            // Driver's current location
            let driverCurrentLocation = { lat: 40.72, lng: -74.0 }; 
            if (orderDetails.driverLocation) {
              driverCurrentLocation = orderDetails.driverLocation;
            }
            
            // Calculate estimated delivery times and distances
            const estimatedTime = delivery.status === "DELIVERED" ? "0 min" : "15 min";
            const distance = "2.5 mi"; // Placeholder - would be calculated based on coordinates
            
            return {
              id: delivery._id || '',
              status: delivery.status as DeliveryStatus,
              orderId: delivery.orderId,
              restaurant: restaurantInfo,
              customer: customerInfo,
              driver: {
                name: getLocalStorageItem<User>('userProfile')?.firstName + " " + getLocalStorageItem<User>('userProfile')?.lastName || "Driver Name",
                phone: getLocalStorageItem<User>('userProfile')?.phone || "Driver Phone",
                vehicle: orderDetails.vehicleDetails?.vehicleNumber || "Vehicle Info",
              },
              driverLocation: driverCurrentLocation,
              estimatedTime: estimatedTime,
              distance: distance,
              amount: orderAmount,
              items: orderItems,
              createdAt: delivery.createdAt || new Date().toISOString(),
            };
          } catch (error) {
            console.error("Error formatting delivery:", error);
            return null;
          }
        }));
        
        // Filter out any null values from failed transformations
        setDeliveries(formattedDeliveries.filter(Boolean) as FormattedDelivery[]);
      } else {
        // No deliveries found - use empty array
        setDeliveries([]);
      }
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      setError("Failed to load your deliveries. Please try again later.");
      // Continue with empty array
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simulate new delivery request after 5 seconds if enabled and we don't have any active deliveries
    if (!simulateNewRequest && deliveries.filter(d => ["ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0) {
      const timer = setTimeout(() => {
        setShowRequestModal(true)
        setSimulateNewRequest(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [simulateNewRequest, deliveries])

  const handleAcceptDelivery = async (id: string) => {
    setShowRequestModal(false)

    try {
      // In a real app, you would call the API to accept a delivery
      // For now, we're simulating with our sample NEW_DELIVERY_REQUEST
      
      // Create a new formatted delivery object from our sample request
      const newDelivery: FormattedDelivery = {
        id: NEW_DELIVERY_REQUEST.id,
        status: "ACCEPTED" as DeliveryStatus,
        orderId: NEW_DELIVERY_REQUEST.orderId,
        restaurant: NEW_DELIVERY_REQUEST.restaurant,
        customer: NEW_DELIVERY_REQUEST.customer,
        driver: {
          name: getLocalStorageItem<User>('userProfile')?.firstName + " " + getLocalStorageItem<User>('userProfile')?.lastName || "Driver Name",
          phone: getLocalStorageItem<User>('userProfile')?.phone || "Driver Phone", 
          vehicle: "Vehicle Info",
        },
        driverLocation: {
          lat: (NEW_DELIVERY_REQUEST.restaurant.location.lat + NEW_DELIVERY_REQUEST.customer.location.lat) / 2,
          lng: (NEW_DELIVERY_REQUEST.restaurant.location.lng + NEW_DELIVERY_REQUEST.customer.location.lng) / 2,
        },
        estimatedTime: NEW_DELIVERY_REQUEST.estimatedTime,
        distance: NEW_DELIVERY_REQUEST.distance,
        amount: NEW_DELIVERY_REQUEST.amount,
        items: NEW_DELIVERY_REQUEST.items,
        createdAt: new Date().toISOString(),
      };

      setDeliveries([...deliveries, newDelivery]);
      setActiveDelivery(id);
      toast.success("Delivery accepted successfully");
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    }
  }

  const handleDeclineDelivery = () => {
    setShowRequestModal(false);
    toast.info("Delivery request declined");
  }

  const handlePickupDelivery = async (id: string) => {
    try {
      const delivery = deliveries.find(d => d.id === id);
      if (!delivery) {
        throw new Error("Delivery not found");
      }
      
      // Update status in the backend
      await updateDelivery(id, { status: "IN_PROGRESS" });
      
      // Update status locally
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === id ? { ...delivery, status: "IN_PROGRESS" as DeliveryStatus } : delivery,
        ),
      );
      
      toast.success("Delivery marked as picked up");
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      toast.error("Failed to update delivery status");
    }
  }

  const handleDeliverDelivery = async (id: string) => {
    try {
      const delivery = deliveries.find(d => d.id === id);
      if (!delivery) {
        throw new Error("Delivery not found");
      }
      
      // Update status in the backend
      await updateDelivery(id, { 
        status: "DELIVERED", 
        deliveredAt: new Date().toISOString() 
      });
      
      // Update status locally
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === id ? { ...delivery, status: "DELIVERED" as DeliveryStatus } : delivery,
        ),
      );
      
      toast.success("Delivery completed successfully");
    } catch (error) {
      console.error("Failed to update delivery status:", error);
      toast.error("Failed to update delivery status");
    }
  }

  const handleCancelDelivery = async (id: string) => {
    try {
      const delivery = deliveries.find(d => d.id === id);
      if (!delivery) {
        throw new Error("Delivery not found");
      }
      
      // Update status in the backend
      await updateDelivery(id, { status: "CANCELLED" });
      
      // Update status locally
      setDeliveries(
        deliveries.map((delivery) =>
          delivery.id === id ? { ...delivery, status: "CANCELLED" as DeliveryStatus } : delivery,
        ),
      );
      
      toast.success("Delivery cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel delivery:", error);
      toast.error("Failed to cancel delivery");
    }
  }

  const handleViewDetails = (id: string) => {
    setActiveDelivery(id)
  }

  const activeDeliveryData = deliveries.find((delivery) => delivery.id === activeDelivery)

  const handleRefresh = () => {
    fetchDeliveries();
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Active Deliveries</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>Refresh</Button>
            <Button onClick={() => setShowRequestModal(true)}>Simulate New Request</Button>
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
              <DeliveryMap
                driverLocation={{
                  lat: activeDeliveryData.driverLocation.lat,
                  lng: activeDeliveryData.driverLocation.lng,
                  label: "You",
                  icon: "driver",
                }}
                pickupLocation={{
                  lat: activeDeliveryData.restaurant.location.lat,
                  lng: activeDeliveryData.restaurant.location.lng,
                  label: activeDeliveryData.restaurant.name,
                  icon: "restaurant",
                }}
                dropoffLocation={{
                  lat: activeDeliveryData.customer.location.lat,
                  lng: activeDeliveryData.customer.location.lng,
                  label: activeDeliveryData.customer.name,
                  icon: "customer",
                }}
                className="h-[400px]"
                // Enable live updates for the driver's own position
                driverId={driverId || undefined}
                enableLiveTracking={true}
              />

              <div className="flex flex-wrap gap-2">
                {activeDeliveryData.status === "ACCEPTED" && (
                  <>
                    <Button className="flex-1" onClick={() => handlePickupDelivery(activeDeliveryData.id)}>
                      Mark as Picked Up
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleCancelDelivery(activeDeliveryData.id)}
                    >
                      Cancel Delivery
                    </Button>
                  </>
                )}

                {activeDeliveryData.status === "IN_PROGRESS" && (
                  <Button className="flex-1" onClick={() => handleDeliverDelivery(activeDeliveryData.id)}>
                    Mark as Delivered
                  </Button>
                )}

                <Button variant="outline" className="flex-1" onClick={() => setActiveDelivery(null)}>
                  Back to List
                </Button>
              </div>
              
              {/* Add driver location sharing component */}
              {driverId && ["ACCEPTED", "IN_PROGRESS"].includes(activeDeliveryData.status) && (
                <DriverLocationSharing 
                  driverId={driverId}
                  deliveryId={activeDeliveryData.id}
                />
              )}
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
                viewType="driver"
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
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4 space-y-4">
              {deliveries.filter((d) => ["ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No active deliveries</p>
                  <p className="text-xs text-muted-foreground">New delivery requests will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deliveries
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
                        viewType="driver"
                        onViewDetails={handleViewDetails}
                        onPickup={handlePickupDelivery}
                        onDeliver={handleDeliverDelivery}
                        onCancel={handleCancelDelivery}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              {deliveries.filter((d) => ["DELIVERED", "CANCELLED"].includes(d.status)).length === 0 ? (
                <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border">
                  <p className="text-muted-foreground">No completed deliveries</p>
                  <p className="text-xs text-muted-foreground">Completed deliveries will appear here</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {deliveries
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
                        viewType="driver"
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <DeliveryRequestModal
        open={showRequestModal}
        onOpenChange={setShowRequestModal}
        delivery={NEW_DELIVERY_REQUEST}
        onAccept={handleAcceptDelivery}
        onDecline={handleDeclineDelivery}
      />
    </>
  )
}
