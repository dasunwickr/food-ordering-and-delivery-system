"use client"

import React, { useEffect, useState } from 'react'
import { atom, useAtom } from 'jotai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { 
  registerAsDriver, 
  updateDriverAvailability, 
  subscribeToOrderRequests,
  acceptOrder,
  rejectOrder,
  sendDriverLocationUpdate,
  getSocket
} from '@/lib/socket'
import { MapPin, User, Clock, DollarSign, Store, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PendingOrder {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantLocation: {
    lat: number;
    lng: number;
  };
  customerName: string;
  customerAddress: string;
  customerLocation: {
    lat: number;
    lng: number;
  };
  estimatedDistance: string;
  estimatedEarnings: string;
  estimatedTime: string;
  createdAt: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
  role?: string;
}

const userAtom = atom<User | null>(null);

export function useUser() {
  const [user, setUser] = useAtom(userAtom);
  
  return {
    user,
    setUser,
    clearUser: () => setUser(null),
    isLoggedIn: !!user,
  };
}

interface GeolocationState {
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: {
      latitude: null,
      longitude: null,
    },
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        error: null,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        error: error.message,
      }));
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}

const DriverDashboard = () => {
  const { user } = useUser();
  const router = useRouter();
  const { location, error: locationError } = useGeolocation();
  
  const [isAvailable, setIsAvailable] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Socket connection and driver registration
  useEffect(() => {
    if (!user || !user.id) return;
    
    // Get socket and monitor status
    const socket = getSocket();
    
    // Listen for socket connection events
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      setSocketStatus('connected');
      setLastUpdated(new Date().toLocaleTimeString());
      
      // Register driver with socket server when connected
      registerAsDriver(user.id);
      
      // Update availability on reconnect
      updateDriverAvailability(user.id, isAvailable);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketStatus('disconnected');
      setLastUpdated(new Date().toLocaleTimeString());
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setSocketStatus('disconnected');
      setLastUpdated(new Date().toLocaleTimeString());
    });
    
    // Initial registration
    registerAsDriver(user.id);
    
    // Update availability initially
    updateDriverAvailability(user.id, isAvailable);
    
    return () => {
      // Clean up event listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, [user]);
  
  // Subscribe to order requests
  useEffect(() => {
    if (!user || !user.id) return;
    
    console.log('Setting up order request subscription for driver:', user.id);
    
    // Subscribe to order requests
    const unsubscribe = subscribeToOrderRequests((orderRequest) => {
      console.log("Received order request:", orderRequest);
      
      // Format the order request data
      const formattedOrder: PendingOrder = {
        orderId: orderRequest.orderId,
        restaurantId: orderRequest.restaurantId,
        restaurantName: orderRequest.restaurantName,
        restaurantAddress: orderRequest.restaurantAddress,
        restaurantLocation: orderRequest.restaurantLocation,
        customerName: orderRequest.customerName,
        customerAddress: orderRequest.customerAddress,
        customerLocation: orderRequest.customerLocation,
        estimatedDistance: orderRequest.estimatedDistance || "2.5 mi",
        estimatedEarnings: orderRequest.estimatedEarnings || "$8.50",
        estimatedTime: orderRequest.estimatedTime || "15 min",
        createdAt: orderRequest.createdAt || new Date().toISOString(),
      };
      
      // Set the pending order and show the modal
      setPendingOrder(formattedOrder);
      setShowOrderModal(true);
      
      // Play a notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log("Error playing notification sound:", e));
    });
    
    // Cleanup function
    return () => {
      console.log('Cleaning up order request subscription');
      unsubscribe();
    };
  }, [user]);
  
  // Send location updates when available
  useEffect(() => {
    if (!user || !user.id || !isAvailable || !location) return;
    
    console.log('Setting up location updates for driver:', user.id);
    
    // Send driver location every 10 seconds
    const locationInterval = setInterval(() => {
      if (location.latitude && location.longitude) {
        console.log('Sending location update:', { lat: location.latitude, lng: location.longitude });
        sendDriverLocationUpdate(user.id!, {
          lat: location.latitude,
          lng: location.longitude
        });
      }
    }, 10000);
    
    // Initial location update
    if (location.latitude && location.longitude) {
      sendDriverLocationUpdate(user.id, {
        lat: location.latitude,
        lng: location.longitude
      });
    }
    
    return () => clearInterval(locationInterval);
  }, [user, isAvailable, location]);
  
  // Toggle driver availability
  const handleAvailabilityToggle = (newValue: boolean) => {
    if (!user || !user.id) {
      toast.error("User information not available");
      return;
    }
    
    setIsAvailable(newValue);
    updateDriverAvailability(user.id, newValue);
    
    if (newValue) {
      toast.success("You are now available for deliveries");
    } else {
      toast.info("You are now offline");
    }
  };
  
  // Handle order acceptance
  const handleAcceptOrder = async () => {
    if (!user || !user.id || !pendingOrder) return;
    
    setIsLoading(true);
    try {
      // Accept order via socket
      acceptOrder(user.id, pendingOrder.orderId);
      
      toast.success("Order accepted! Navigate to your deliveries page");
      setShowOrderModal(false);
      setPendingOrder(null);
      
      // Redirect to deliveries page after a short delay
      setTimeout(() => {
        router.push('/driver/deliveries');
      }, 1500);
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast.error("Failed to accept order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle order rejection
  const handleRejectOrder = () => {
    if (!user || !user.id || !pendingOrder) return;
    
    setIsLoading(true);
    try {
      // Reject order via socket
      rejectOrder(user.id, pendingOrder.orderId);
      
      toast.info("Order rejected");
      setShowOrderModal(false);
      setPendingOrder(null);
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast.error("Failed to reject order");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-bold">Driver Dashboard</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="availability" className={isAvailable ? "text-green-500" : "text-gray-500"}>
            {isAvailable ? "Available for Deliveries" : "Offline"}
          </Label>
          <Switch
            id="availability"
            checked={isAvailable}
            onCheckedChange={handleAvailabilityToggle}
          />
        </div>
      </div>
      
      {locationError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-500">
              Location access is required. Please enable location services to receive delivery orders.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Availability:</span>
                <Badge variant={isAvailable ? "secondary" : "outline"} className={isAvailable ? "bg-green-500 hover:bg-green-600" : ""}>
                  {isAvailable ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location:</span>
                <span className="text-sm">
                  {location ? "Tracking" : "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Socket Status:</span>
                <Badge variant={socketStatus === 'connected' ? "secondary" : "outline"} className={socketStatus === 'connected' ? "bg-green-500 hover:bg-green-600" : ""}>
                  {socketStatus.charAt(0).toUpperCase() + socketStatus.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{lastUpdated || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Today's Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deliveries:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Online Hours:</span>
                <span className="font-medium">0h 0m</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Earnings:</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/driver/deliveries')}
            >
              View My Deliveries
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => router.push('/driver/profile')}  
            >
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Pending Order Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">New Delivery Request</DialogTitle>
            <DialogDescription className="text-center">
              You have a new order to deliver! Accept or reject this delivery request.
            </DialogDescription>
          </DialogHeader>
          
          {pendingOrder && (
            <div className="space-y-4 py-4">
              <div className="flex items-start space-x-4 rounded-lg border p-4">
                <Store className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium leading-none">Pickup</p>
                  <p className="text-sm text-muted-foreground">{pendingOrder.restaurantName}</p>
                  <p className="text-xs text-muted-foreground">{pendingOrder.restaurantAddress}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 rounded-lg border p-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="font-medium leading-none">Delivery</p>
                  <p className="text-sm text-muted-foreground">{pendingOrder.customerName}</p>
                  <p className="text-xs text-muted-foreground">{pendingOrder.customerAddress}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">Est. Time</p>
                  <p className="font-medium">{pendingOrder.estimatedTime}</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">Distance</p>
                  <p className="font-medium">{pendingOrder.estimatedDistance}</p>
                </div>
                <div className="flex flex-col items-center justify-center rounded-lg border p-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <p className="mt-1 text-xs text-muted-foreground">Earnings</p>
                  <p className="font-medium">{pendingOrder.estimatedEarnings}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline"
              onClick={handleRejectOrder}
              disabled={isLoading}
              className="flex-1"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              onClick={handleAcceptOrder}
              disabled={isLoading}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default DriverDashboard