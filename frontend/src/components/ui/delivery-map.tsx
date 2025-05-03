"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import React from "react"
import { subscribeToDriverLocation, unsubscribeFromDriverLocation } from "@/lib/socket"

export interface Location {
  lat: number
  lng: number
  label?: string
  icon?: "driver" | "restaurant" | "customer"
}

interface MapProps {
  driverLocation: Location
  pickupLocation: Location
  dropoffLocation: Location
  showRoute?: boolean
  animate?: boolean
  zoom?: number
  driverId?: string
  enableLiveTracking?: boolean
}

export default function Map({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  showRoute = true,
  animate = true,
  zoom = 14,
  driverId,
  enableLiveTracking = false,
}: MapProps) {
  // Your map implementation here
  return (
    <div>
      {/* Map implementation */}
    </div>
  )
}

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import("@/components/ui/map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface DeliveryMapProps {
  driverLocation: Location
  pickupLocation: Location
  dropoffLocation: Location
  className?: string
  showRoute?: boolean
  animate?: boolean
  zoom?: number
  driverId?: string
  enableLiveTracking?: boolean
}

export function DeliveryMap({
  driverLocation,
  pickupLocation,
  dropoffLocation,
  className,
  showRoute = true,
  animate = true,
  zoom = 14,
  driverId,
  enableLiveTracking = false,
}: DeliveryMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [liveDriverLocation, setLiveDriverLocation] = useState<Location | null>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Initialize with provided location whenever it changes
  useEffect(() => {
    if (driverLocation && driverLocation.lat && driverLocation.lng) {
      setLiveDriverLocation(driverLocation);
    }
  }, [driverLocation]);

  // Effect for live location tracking
  useEffect(() => {
    // Only set up socket tracking if both enableLiveTracking and driverId are provided
    if (enableLiveTracking && driverId) {
      console.log(`Setting up live tracking for driver: ${driverId}`);
      
      // Subscribe to driver location updates
      subscribeToDriverLocation(driverId, (location) => {
        console.log(`Live location update received for driver ${driverId}:`, location);
        
        if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
          setLiveDriverLocation({
            lat: location.lat,
            lng: location.lng,
            icon: "driver" // Preserve the icon type
          });
        } else {
          console.warn("Received invalid location data:", location);
        }
      });
      
      // Clean up subscription when component unmounts or driver changes
      return () => {
        console.log(`Unsubscribing from driver ${driverId} location updates`);
        unsubscribeFromDriverLocation(driverId);
      };
    }
  }, [driverId, enableLiveTracking]);

  if (!isClient) {
    return (
      <div className={cn("h-[300px] w-full rounded-lg bg-muted/30", className)}>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Validate locations to prevent map rendering issues
  const validateLocation = (location: Location): Location => {
    if (!location) return { lat: 0, lng: 0, icon: "driver" };
    
    // Ensure lat and lng are numbers and within valid ranges
    const validLat = typeof location.lat === 'number' && !isNaN(location.lat) ? 
      Math.max(-90, Math.min(90, location.lat)) : 0;
    
    const validLng = typeof location.lng === 'number' && !isNaN(location.lng) ? 
      Math.max(-180, Math.min(180, location.lng)) : 0;
    
    return {
      ...location,
      lat: validLat,
      lng: validLng
    };
  };

  // Use live driver location if available, otherwise fall back to the original driver location
  const currentDriverLocation = validateLocation(
    (enableLiveTracking && liveDriverLocation) ? liveDriverLocation : driverLocation
  );
  
  // Validate pickup and dropoff locations
  const validPickupLocation = validateLocation(pickupLocation);
  const validDropoffLocation = validateLocation(dropoffLocation);

  return (
    <div className={cn("h-[300px] w-full overflow-hidden rounded-lg border", className)}>
      <MapWithNoSSR
        driverLocation={currentDriverLocation}
        pickupLocation={validPickupLocation}
        dropoffLocation={validDropoffLocation}
        showRoute={showRoute}
        animate={animate}
        zoom={zoom}
        driverId={driverId}
        enableLiveTracking={enableLiveTracking}
      />
    </div>
  )
}
