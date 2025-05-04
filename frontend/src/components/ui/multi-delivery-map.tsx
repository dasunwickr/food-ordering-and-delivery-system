"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Location } from "./delivery-map"
import { Button } from "./button"
import { subscribeToDriverLocation, unsubscribeFromDriverLocation } from "@/lib/socket"
import L from "leaflet"

// Type for multiple deliveries to display on the map
export interface DeliveryMapItem {
  id: string
  driver?: {
    id?: string
    name: string
    location: Location
  }
  restaurant: {
    name: string
    location: Location
  }
  customer: {
    name: string
    location: Location
  }
  status: string
}

interface MultiDeliveryMapProps {
  deliveries: DeliveryMapItem[]
  className?: string
  zoom?: number
  enableLiveTracking?: boolean
  height?: string
  onDeliverySelect?: (deliveryId: string) => void
  selectedDeliveryId?: string | null
}

// Custom marker icons
const createCustomIcon = (type: 'driver' | 'restaurant' | 'customer', isLive: boolean = false, isSelected: boolean = false) => {
  const colors = {
    driver: isSelected ? 'bg-blue-600' : 'bg-primary',
    restaurant: 'bg-orange-500',
    customer: 'bg-green-500'
  }

  const icons = {
    driver: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`,
    restaurant: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
    customer: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`
  }

  const animationClass = isLive && type === 'driver' ? 'animate-pulse' : ''
  const sizeClass = isSelected ? 'h-10 w-10' : 'h-8 w-8'

  return L.divIcon({
    html: `<div class="flex ${sizeClass} items-center justify-center rounded-full ${colors[type]} text-white shadow-md ${animationClass}">
            ${icons[type]}
          </div>`,
    className: "",
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 20] : [16, 16],
  })
}

// Dynamically import the map component to avoid SSR issues
const MultiMapWithNoSSR = dynamic(() => import("./multi-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/30">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

export default function MultiDeliveryMap({
  deliveries,
  className,
  zoom = 12,
  enableLiveTracking = false,
  height = "500px",
  onDeliverySelect,
  selectedDeliveryId = null
}: MultiDeliveryMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [liveDriverLocations, setLiveDriverLocations] = useState<Record<string, Location>>({})
  const subscribedDrivers = useRef<string[]>([])

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Set up live tracking for all drivers
  useEffect(() => {
    if (!enableLiveTracking) return

    // Extract driver IDs from deliveries
    const driverIds = deliveries
      .filter(d => d.driver && d.driver.id && ["ACCEPTED", "IN_PROGRESS"].includes(d.status))
      .map(d => d.driver!.id!)
      .filter(Boolean)

    // Unsubscribe from drivers no longer in the list
    subscribedDrivers.current.forEach(driverId => {
      if (!driverIds.includes(driverId)) {
        console.log(`Unsubscribing from driver ${driverId}`)
        unsubscribeFromDriverLocation(driverId)
      }
    })

    // Subscribe to new drivers
    driverIds.forEach(driverId => {
      if (!subscribedDrivers.current.includes(driverId)) {
        console.log(`Setting up location tracking for driver: ${driverId}`)
        subscribeToDriverLocation(driverId, (location) => {
          if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
            console.log(`Received live location for driver ${driverId}:`, location)
            setLiveDriverLocations(prev => ({
              ...prev,
              [driverId]: {
                lat: location.lat,
                lng: location.lng,
                label: `Driver ${driverId}`,
                icon: "driver"
              }
            }))
          }
        })
        subscribedDrivers.current.push(driverId)
      }
    })

    // Update ref for cleanup
    subscribedDrivers.current = driverIds

    // Cleanup on unmount
    return () => {
      subscribedDrivers.current.forEach(driverId => {
        console.log(`Cleaning up location tracking for driver: ${driverId}`)
        unsubscribeFromDriverLocation(driverId)
      })
    }
  }, [deliveries, enableLiveTracking])

  // Get deliveries with updated locations from live data
  const getUpdatedDeliveries = () => {
    return deliveries.map(delivery => {
      // If we have live driver location, use it
      if (delivery.driver?.id && liveDriverLocations[delivery.driver.id]) {
        return {
          ...delivery,
          driver: {
            ...delivery.driver,
            location: liveDriverLocations[delivery.driver.id]
          }
        }
      }
      return delivery
    })
  }

  // Handle button click to fit map to all points
  const handleFitAll = () => {
    // This function is passed to the map component
    const event = new CustomEvent('fit-all-markers')
    window.dispatchEvent(event)
  }

  if (!isClient) {
    return (
      <div className={cn(`h-[${height}] w-full rounded-lg bg-muted/30`, className)}>
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(`h-[${height}] w-full overflow-hidden rounded-lg border`, className)}>
      <div className="h-full w-full relative">
        <MultiMapWithNoSSR
          deliveries={getUpdatedDeliveries()}
          zoom={zoom}
          enableLiveTracking={enableLiveTracking}
          onDeliverySelect={onDeliverySelect}
          selectedDeliveryId={selectedDeliveryId}
        />
        <div className="absolute top-2 right-2 z-[1000] bg-white rounded-md shadow-md">
          <Button variant="outline" size="sm" onClick={handleFitAll}>
            Show All Deliveries
          </Button>
        </div>
      </div>
    </div>
  )
}