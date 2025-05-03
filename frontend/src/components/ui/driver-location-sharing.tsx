"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { sendDriverLocationUpdate } from "@/lib/socket"
import { updateDriverLocation } from "@/services/delivery-service"
import { MapPin, AlertCircle, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface DriverLocationSharingProps {
  driverId: string
  deliveryId?: string
}

export function DriverLocationSharing({ driverId, deliveryId }: DriverLocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Function to get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords
        setCurrentLocation({ lat, lng })
        setLocationError(null)
        
        // Only send location update if sharing is enabled
        if (isSharing) {
          // Send location update via socket for real-time updates
          sendDriverLocationUpdate(driverId, { lat, lng })
          
          // Also update location in the database for persistence
          updateDriverLocation(driverId, { lat, lng })
            .then(() => {
              console.log("Location updated in database");
              // If we have a deliveryId, also update the order with location info
              if (deliveryId) {
                // We could update the order with this location as well if needed
                console.log(`Delivery ${deliveryId} associated with this location update`);
              }
            })
            .catch(err => console.error('Error updating location in database:', err));
          
          setLastUpdateTime(new Date().toLocaleTimeString())
          
          // Show success toast
          toast({
            title: "Location updated",
            description: `Your location has been shared successfully at ${new Date().toLocaleTimeString()}`,
            duration: 3000,
          })
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        setLocationError("Unable to retrieve your location. Please enable location services.")
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }, [driverId, isSharing, toast, deliveryId])

  // Toggle location sharing
  const toggleLocationSharing = () => {
    const newSharingState = !isSharing
    setIsSharing(newSharingState)
    
    if (newSharingState) {
      // Get location immediately when turning on sharing
      getCurrentLocation()
      
      toast({
        title: "Location sharing enabled",
        description: "You are now sharing your location in real-time",
        duration: 3000,
      })
    } else {
      toast({
        title: "Location sharing disabled",
        description: "You have stopped sharing your location",
        duration: 3000,
      })
    }
  }

  // Set up periodic location updates when sharing is enabled
  useEffect(() => {
    if (!isSharing) return
    
    // Update location immediately and then every 10 seconds
    getCurrentLocation()
    
    const intervalId = setInterval(() => {
      getCurrentLocation()
    }, 10000) // Update every 10 seconds
    
    return () => {
      clearInterval(intervalId)
    }
  }, [isSharing, getCurrentLocation])

  // Format the coordinates for display
  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Driver Location Sharing</CardTitle>
        <CardDescription>
          Share your real-time location for delivery tracking
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-sharing" className="font-medium">
              Real-time Location Sharing
            </Label>
            <Switch
              id="location-sharing"
              checked={isSharing}
              onCheckedChange={toggleLocationSharing}
            />
          </div>
          
          {locationError && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <p>{locationError}</p>
            </div>
          )}
          
          {currentLocation && (
            <div className="rounded-md bg-muted p-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium">Current coordinates:</span>
                <span className="text-muted-foreground">
                  {formatCoordinates(currentLocation.lat, currentLocation.lng)}
                </span>
              </div>
              
              {lastUpdateTime && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Last updated at {lastUpdateTime}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={getCurrentLocation}
          variant="outline"
          size="sm" 
          className="w-full"
          disabled={!navigator.geolocation}
        >
          Update Location Now
        </Button>
      </CardFooter>
    </Card>
  )
}