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
import { 
  getDeliveriesByDriverId, 
  updateDelivery, 
  getDeliveryWithOrderDetailsAndDriverInfo, 
  IDelivery, 
  assignDriverToOrder,
  getPendingOrders,
  acceptDelivery
} from "@/services/delivery-service"
import { userService, RestaurantUser, DriverUser } from "@/services/user-service"
import { getLocalStorageItem } from "@/utils/storage"
import { toast } from "sonner"
import { 
  registerAsDriver, 
  updateDriverAvailability, 
  subscribeToOrderRequests, 
  subscribeToOrderTaken,
  acceptOrder as socketAcceptOrder,
  rejectOrder as socketRejectOrder
} from "@/lib/socket"

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
  const [isDriverAvailable, setIsDriverAvailable] = useState(true)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  
  useEffect(() => {
    // Get driver ID from cookie or localStorage
    const cookieDriverId = getCookie('userId')?.toString();
    const localStorageDriverId = typeof window !== 'undefined' 
      ? localStorage.getItem('userId')
      : null;
    const userProfile = getLocalStorageItem<any>('userProfile');
    
    const id = cookieDriverId || localStorageDriverId || userProfile?.id || "driver-001";
    setDriverId(id);
    
    // Register as driver with socket server when driverId is available
    if (id) {
      registerAsDriver(id);
      updateDriverAvailability(id, true);
      setIsDriverAvailable(true);
    }
    
    return () => {
      // Update availability status when leaving the page
      if (id) {
        updateDriverAvailability(id, false);
      }
    }
  }, []);

  useEffect(() => {
    // Fetch deliveries when driverId is available
    if (driverId) {
      fetchDeliveries();
    }
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    // Subscribe to order requests from the socket server
    const unsubscribeOrderRequests = subscribeToOrderRequests((orderRequest) => {
      console.log('New order request received:', orderRequest);
      
      // Only show the modal if driver is available
      if (isDriverAvailable) {
        // Make sure we have a valid orderId to work with
        if (!orderRequest.orderId) {
          console.warn('Received order request without orderId', orderRequest);
          
          // Try to extract orderId from other fields if available
          if (orderRequest.id) {
            orderRequest.orderId = orderRequest.id;
          } else if (orderRequest._id) {
            orderRequest.orderId = orderRequest._id;
          }
        }
          
        // Format the order request data for the modal
        const formattedOrder = {
          id: orderRequest.orderId || `order-${Date.now()}`, // Ensure we have at least some ID
          orderId: orderRequest.orderId || `order-${Date.now()}`, // And make sure orderId is set
          restaurant: {
            name: orderRequest.restaurantDetails?.name || orderRequest.restaurantName || "Restaurant",
            address: orderRequest.restaurantDetails?.address || orderRequest.restaurantAddress || "Restaurant Address",
            phone: orderRequest.restaurantPhone || "Restaurant Phone",
            location: orderRequest.restaurantDetails?.location || orderRequest.restaurantLocation || { lat: 40.7128, lng: -74.006 }
          },
          customer: {
            name: orderRequest.customerDetails?.name || orderRequest.customerName || "Customer",
            address: orderRequest.customerDetails?.address || orderRequest.customerAddress || "Customer Address",
            phone: orderRequest.customerPhone || "Customer Phone",
            location: orderRequest.customerDetails?.location || orderRequest.customerLocation || { lat: 40.7303, lng: -74.0054 }
          },
          items: orderRequest.items || [],
          estimatedTime: "15-20 min",
          distance: calculateDistance(
            orderRequest.restaurantDetails?.location || orderRequest.restaurantLocation || { lat: 40.7128, lng: -74.006 },
            orderRequest.customerDetails?.location || orderRequest.customerLocation || { lat: 40.7303, lng: -74.0054 }
          ).toFixed(1) + " mi",
          amount: orderRequest.amount ? orderRequest.amount.toString() : "10.00",
        };
        
        setPendingOrder(formattedOrder);
        setShowRequestModal(true);
        
        // Play sound to alert driver (optional)
        playAlertSound();
      }
    });
    
    // Subscribe to order taken notifications (when another driver accepts an order)
    const unsubscribeOrderTaken = subscribeToOrderTaken(({ orderId }) => {
      console.log('Order taken by another driver:', orderId);
      
      // If this is the order we're showing in the modal, close it
      if (pendingOrder && pendingOrder.orderId === orderId) {
        setShowRequestModal(false);
        setPendingOrder(null);
        toast.info("This order has been accepted by another driver");
      }
    });

    // Fetch pending orders if no socket events arrive
    const fetchPendingOrdersTimeout = setTimeout(() => {
      if (!pendingOrder && isDriverAvailable) {
        fetchPendingOrdersForDriver();
      }
    }, 3000);

    return () => {
      unsubscribeOrderRequests();
      unsubscribeOrderTaken();
      clearTimeout(fetchPendingOrdersTimeout);
    };
  }, [driverId, isDriverAvailable, pendingOrder]);

  const calculateDistance = (point1: {lat: number, lng: number}, point2: {lat: number, lng: number}) => {
    // Simple approximation formula (not accurate for real world)
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;
    
    // Convert to radians
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    // Haversine formula (approximation)
    const distance = 3963 * Math.acos(
      Math.sin(p1) * Math.sin(p2) + 
      Math.cos(p1) * Math.cos(p2) * Math.cos(dLon)
    );
    
    return distance; // in miles
  };
  
  const playAlertSound = () => {
    // Only play sound if the browser supports it
    if (typeof window !== 'undefined' && 'Audio' in window) {
      try {
        const audio = new Audio('/notification-sound.mp3'); // Add a sound file to the public folder
        audio.play().catch(e => console.log('Unable to play sound', e));
      } catch (e) {
        console.log('Error playing sound:', e);
      }
    }
  };

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
              location: { lat: 40.7128, lng: -74.006 } // Default NYC coordinates
            };
            
            let customerInfo = {
              name: "Customer Name",
              address: "Customer Address",
              phone: "Customer Phone",
              location: { lat: 40.7128, lng: -73.99 } // Default NYC coordinates
            };
            
            // Try to get the restaurant details
            if (orderDetails.order?.restaurantId) {
              try {
                const restaurant = await userService.getUserById(orderDetails.order.restaurantId) as RestaurantUser;
                if (restaurant) {
                  restaurantInfo = {
                    name: restaurant.restaurantName || "Restaurant",
                    address: restaurant.restaurantAddress || "Restaurant Address",
                    phone: restaurant.phone || "Restaurant Phone",
                    location: { 
                      lat: restaurant.location && 'x' in restaurant.location ? restaurant.location.y : 40.7128, 
                      lng: restaurant.location && 'x' in restaurant.location ? restaurant.location.x : -74.006
                    }
                  };
                }
              } catch (restaurantError) {
                console.error("Error fetching restaurant details:", restaurantError);
              }
            }
            
            // Customer location from order details
            if (orderDetails.order?.customerDetails) {
              const customerDetails = orderDetails.order.customerDetails;
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
            
            // Get order items if available
            let orderItems: OrderItem[] = [];
            if (orderDetails?.order?.cartItems && Array.isArray(orderDetails.order.cartItems)) {
              orderItems = orderDetails.order.cartItems.map(item => ({
                name: item.itemName || 'Unknown Item',
                quantity: item.quantity || 1
              }));
            }
            
            // Order amount if available
            let orderAmount = "10.00";
            if (orderDetails?.order?.totalAmount) {
              orderAmount = orderDetails.order.totalAmount.toString();
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
                name: getLocalStorageItem<DriverUser>('userProfile')?.firstName + " " + getLocalStorageItem<DriverUser>('userProfile')?.lastName || "Driver Name",
                phone: getLocalStorageItem<DriverUser>('userProfile')?.phone || "Driver Phone",
                vehicle: (getLocalStorageItem<any>('userProfile')?.vehicleNumber) || orderDetails.vehicleDetails?.vehicleNumber || "Vehicle Info",
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

  // Fetch pending orders that need drivers
  const fetchPendingOrdersForDriver = async () => {
    try {
      const pendingOrders = await getPendingOrders();
      console.log('Available pending orders:', pendingOrders);
      
      if (pendingOrders && pendingOrders.length > 0) {
        // Take the first pending order and show it as a request
        const orderRequest = pendingOrders[0];
        console.log(orderRequest)
        
        // Format the order request data for the modal
        const formattedOrder = {
          id: orderRequest.orderId,
          orderId: orderRequest.orderId,
          restaurant: {
            name: orderRequest.restaurantName || "Restaurant",
            address: orderRequest.restaurantAddress || "Restaurant Address", 
            phone: orderRequest.restaurantPhone || "Restaurant Phone",
            location: orderRequest.restaurantLocation || { lat: 40.7128, lng: -74.006 }
          },
          customer: {
            name: orderRequest.customerName || "Customer",
            address: orderRequest.customerAddress || "Customer Address",
            phone: orderRequest.customerPhone || "Customer Phone",
            location: orderRequest.customerLocation || { lat: 40.7303, lng: -74.0054 }
          },
          items: orderRequest.items || [{ name: "Food Item", quantity: 1 }],
          estimatedTime: "15-20 min",
          distance: "2.5 mi",
          amount: orderRequest.totalAmount?.toString() || "10.00"
        };
      
      
        
        setPendingOrder(formattedOrder);
        setShowRequestModal(true);
      }
    } catch (error) {
      console.error("Error fetching pending orders:", error);
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

  // Handle accepting a real order request from socket
  const handleAcceptDelivery = async (id: string) => {
    if (!driverId) {
      toast.error("Driver ID not found");
      return;
    }
    
    try {
      setShowRequestModal(false);
      
      // Get user profile info for the driver name
      const userProfile = getLocalStorageItem<DriverUser>('userProfile');
      const driverName = userProfile ? 
        `${userProfile.firstName} ${userProfile.lastName}` : 
        "Driver";
      
      const vehicleNumber = userProfile?.vehicleNumber || "";
      
      // Get the orderId - ensure we have a valid ID to work with
      let orderId = id;
      
      // Check if we're working with the pending order
      if (pendingOrder) {
        console.log("Using pending order:", pendingOrder);
        // Use the pendingOrder.orderId or id as fallback
        orderId = pendingOrder.orderId || pendingOrder.id || id;
      }
      
      // Validate the order ID
      if (!orderId || orderId === "undefined" || orderId === "null") {
        // If both ids are invalid, show error and abort
        console.error("Invalid order ID", { 
          providedId: id, 
          pendingOrderId: pendingOrder?.orderId,
          pendingOrder
        });
        toast.error("Invalid order ID - please try again");
        return;
      }
      
      console.log(`Accepting delivery for order: ${orderId} by driver: ${driverId}`);
      
      // Skip the delivery ID approach entirely and just use the orderId with assignDriverToOrder
      // This is much more reliable as we know the orderId always exists
      await assignDriverToOrder(
        orderId,
        driverId,
        driverName,
        vehicleNumber
      );
      
      // Notify socket server that this driver has accepted the order
      socketAcceptOrder(driverId, orderId);
      
      toast.success("Delivery accepted successfully");
      
      // Refresh the deliveries list
      fetchDeliveries();
      
      // Clear pending order
      setPendingOrder(null);
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery");
    }
  }
  
  // When driver rejects the order request  
  const handleDeclineDelivery = (orderId: string) => {
    if (driverId) {
      // Notify socket server that this driver has rejected the order
      socketRejectOrder(driverId, orderId);
    }
    
    setShowRequestModal(false);
    setPendingOrder(null);
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
  
  // Toggle driver availability
  const handleToggleAvailability = () => {
    if (!driverId) return;
    
    const newAvailability = !isDriverAvailable;
    setIsDriverAvailable(newAvailability);
    updateDriverAvailability(driverId, newAvailability);
    
    toast.success(`You are now ${newAvailability ? 'available' : 'unavailable'} for new deliveries`);
  };

  const activeDeliveryData = deliveries.find((delivery) => delivery.id === activeDelivery)

  const handleRefresh = () => {
    fetchDeliveries();
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading deliveries...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold tracking-tight">Active Deliveries</h1>
          <div className="flex gap-2">
            <Button 
              variant={isDriverAvailable ? "default" : "outline"} 
              onClick={handleToggleAvailability}
            >
              {isDriverAvailable ? "Available" : "Unavailable"}
            </Button>
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
                items={activeDeliveryData.items}
                estimatedTime={activeDeliveryData.estimatedTime}
                distance={activeDeliveryData.distance}
                amount={activeDeliveryData.amount}
              />
            </div>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-4">
              {deliveries.filter((d: FormattedDelivery) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status)).length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="text-lg font-medium">No active deliveries</h3>
                  <p className="text-sm text-muted-foreground">
                    New deliveries will appear here when assigned to you.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {deliveries
                    .filter((d: FormattedDelivery) => ["PENDING", "ACCEPTED", "IN_PROGRESS"].includes(d.status))
                    .map((delivery: FormattedDelivery) => (
                      <DeliveryCard
                        key={delivery.id}
                        id={delivery.id}
                        status={delivery.status}
                        orderId={delivery.orderId}
                        restaurant={delivery.restaurant}
                        customer={delivery.customer}
                        estimatedTime={delivery.estimatedTime}
                        distance={delivery.distance}
                        amount={delivery.amount}
                        onViewDetails={() => handleViewDetails(delivery.id)}
                        onPickup={handlePickupDelivery}
                        onDeliver={handleDeliverDelivery}
                        onCancel={handleCancelDelivery}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-4">
              {deliveries.filter((d: FormattedDelivery) => ["DELIVERED", "CANCELLED"].includes(d.status)).length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center">
                  <h3 className="text-lg font-medium">No completed deliveries</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed and cancelled deliveries will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                  {deliveries
                    .filter((d: FormattedDelivery) => ["DELIVERED", "CANCELLED"].includes(d.status))
                    .map((delivery: FormattedDelivery) => (
                      <DeliveryCard
                        key={delivery.id}
                        id={delivery.id}
                        status={delivery.status}
                        orderId={delivery.orderId}
                        restaurant={delivery.restaurant}
                        customer={delivery.customer}
                        estimatedTime="0 min"
                        distance={delivery.distance}
                        amount={delivery.amount}
                        onViewDetails={() => handleViewDetails(delivery.id)}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delivery Request Modal */}
      {pendingOrder ? (
        <DeliveryRequestModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          delivery={pendingOrder}
          onAccept={handleAcceptDelivery}
          onDecline={handleDeclineDelivery}
        />
      ) : simulateNewRequest ? (
        <DeliveryRequestModal
          open={showRequestModal}
          onOpenChange={setShowRequestModal}
          delivery={NEW_DELIVERY_REQUEST}
          onAccept={handleAcceptDelivery}
          onDecline={handleDeclineDelivery}
        />
      ) : null}
    </>
  )
}
