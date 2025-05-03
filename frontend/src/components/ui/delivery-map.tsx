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
  const [liveDriverLocation, setLiveDriverLocation] = useState<Location>(driverLocation)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Effect for live location tracking
  useEffect(() => {
    // Initialize with provided location
    setLiveDriverLocation(driverLocation)
    
    // Only set up socket tracking if both enableLiveTracking and driverId are provided
    if (enableLiveTracking && driverId) {
      // Subscribe to driver location updates
      subscribeToDriverLocation(driverId, (location) => {
        console.log(`Live location update for driver ${driverId}:`, location);
        setLiveDriverLocation(prevLocation => ({
          ...prevLocation,
          lat: location.lat,
          lng: location.lng
        }));
      });
      
      // Clean up subscription when component unmounts
      return () => {
        unsubscribeFromDriverLocation(driverId);
      };
    }
  }, [driverId, enableLiveTracking, driverLocation]);

  if (!isClient) {
    return (
      <div className={cn("h-[300px] w-full rounded-lg bg-muted/30", className)}>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("h-[300px] w-full overflow-hidden rounded-lg border", className)}>
      <MapWithNoSSR
        driverLocation={enableLiveTracking ? liveDriverLocation : driverLocation}
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        showRoute={showRoute}
        animate={animate}
        zoom={zoom}
        driverId={driverId}
        enableLiveTracking={enableLiveTracking}
      />
    </div>
  )
}
