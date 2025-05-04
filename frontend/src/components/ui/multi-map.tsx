"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { DeliveryMapItem } from "./multi-delivery-map"
import { useToast } from "./use-toast"

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
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

interface MultiMapProps {
  deliveries: DeliveryMapItem[]
  zoom?: number
  enableLiveTracking?: boolean
  onDeliverySelect?: (deliveryId: string) => void
  selectedDeliveryId?: string | null
}

interface MarkerGroup {
  driver?: L.Marker
  restaurant: L.Marker
  customer: L.Marker
  polyline?: L.Polyline
}

export default function MultiMap({
  deliveries,
  zoom = 12,
  enableLiveTracking = false,
  onDeliverySelect,
  selectedDeliveryId = null
}: MultiMapProps) {
  const { toast } = useToast()
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, MarkerGroup>>({})
  const [initialized, setInitialized] = useState(false)

  // Helper function to validate coordinates
  const isValidCoord = (coord: number): boolean => {
    return typeof coord === 'number' && !isNaN(coord) && 
         coord !== null && Math.abs(coord) <= 90;
  }

  // Helper function to validate longitude
  const isValidLong = (coord: number): boolean => {
    return typeof coord === 'number' && !isNaN(coord) && 
         coord !== null && Math.abs(coord) <= 180;
  }

  // Function to fit map to all delivery markers
  const fitAllMarkers = () => {
    if (!mapRef.current || !deliveries.length) return

    try {
      const points: L.LatLngExpression[] = []
      
      // Collect all valid points
      deliveries.forEach(delivery => {
        if (isValidCoord(delivery.restaurant.location.lat) && 
            isValidLong(delivery.restaurant.location.lng)) {
          points.push([delivery.restaurant.location.lat, delivery.restaurant.location.lng])
        }
        
        if (isValidCoord(delivery.customer.location.lat) && 
            isValidLong(delivery.customer.location.lng)) {
          points.push([delivery.customer.location.lat, delivery.customer.location.lng])
        }
        
        if (delivery.driver?.location && 
            isValidCoord(delivery.driver.location.lat) && 
            isValidLong(delivery.driver.location.lng)) {
          points.push([delivery.driver.location.lat, delivery.driver.location.lng])
        }
      })
      
      if (points.length > 0) {
        const bounds = L.latLngBounds(points)
        mapRef.current.fitBounds(bounds, { padding: [50, 50] })
      }
    } catch (error) {
      console.error('Error fitting map to markers:', error)
    }
  }

  // Initialize map
  useEffect(() => {
    fixLeafletIcon()

    // Create the map if it doesn't exist yet
    if (!mapRef.current) {
      try {
        // Use a default center point for initial map load
        const defaultCenter: [number, number] = [40.7128, -74.0059] // New York City
        
        mapRef.current = L.map("multi-map").setView(defaultCenter, zoom)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)
        
        setInitialized(true)
      } catch (error) {
        console.error("Error initializing multi-map:", error)
        toast({
          title: "Map initialization failed",
          description: "There was an error loading the map. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    // Listen for the fit-all-markers event
    const handleFitAll = () => {
      fitAllMarkers()
    }

    window.addEventListener('fit-all-markers', handleFitAll)

    return () => {
      window.removeEventListener('fit-all-markers', handleFitAll)
    }
  }, [zoom, toast])

  // Update markers when deliveries change
  useEffect(() => {
    if (!mapRef.current || !initialized) return

    try {
      const map = mapRef.current
      const existingDeliveryIds = Object.keys(markersRef.current)
      const currentDeliveryIds = deliveries.map(d => d.id)
      
      // Remove markers for deliveries that no longer exist
      existingDeliveryIds.forEach(id => {
        if (!currentDeliveryIds.includes(id)) {
          const markerGroup = markersRef.current[id]
          
          if (markerGroup) {
            if (markerGroup.driver) map.removeLayer(markerGroup.driver)
            if (markerGroup.restaurant) map.removeLayer(markerGroup.restaurant)
            if (markerGroup.customer) map.removeLayer(markerGroup.customer)
            if (markerGroup.polyline) map.removeLayer(markerGroup.polyline)
            
            delete markersRef.current[id]
          }
        }
      })
      
      // Add or update markers for current deliveries
      deliveries.forEach(delivery => {
        const isSelected = delivery.id === selectedDeliveryId
        const isActiveDelivery = ['ACCEPTED', 'IN_PROGRESS'].includes(delivery.status)
        const markerGroup = markersRef.current[delivery.id] || {}
        
        // Restaurant marker
        if (isValidCoord(delivery.restaurant.location.lat) && 
            isValidLong(delivery.restaurant.location.lng)) {
          
          const position: [number, number] = [
            delivery.restaurant.location.lat, 
            delivery.restaurant.location.lng
          ]
          
          if (markerGroup.restaurant) {
            // Update existing restaurant marker
            markerGroup.restaurant.setLatLng(position)
            
            // Update popup content (name might have changed)
            markerGroup.restaurant.getPopup()?.setContent(
              `<div><strong>Restaurant:</strong> ${delivery.restaurant.name}</div><div>Order ID: ${delivery.id}</div>`
            )
            
            // Update icon if selected state changed
            markerGroup.restaurant.setIcon(createCustomIcon('restaurant', false, isSelected))
          } else {
            // Create new restaurant marker
            const marker = L.marker(position, {
              icon: createCustomIcon('restaurant', false, isSelected),
              zIndexOffset: isSelected ? 1000 : 0
            })
            .bindPopup(`<div><strong>Restaurant:</strong> ${delivery.restaurant.name}</div><div>Order ID: ${delivery.id}</div>`)
            .addTo(map)
            
            if (onDeliverySelect) {
              marker.on('click', () => {
                onDeliverySelect(delivery.id)
              })
            }
            
            markerGroup.restaurant = marker
          }
        }
        
        // Customer marker
        if (isValidCoord(delivery.customer.location.lat) && 
            isValidLong(delivery.customer.location.lng)) {
          
          const position: [number, number] = [
            delivery.customer.location.lat, 
            delivery.customer.location.lng
          ]
          
          if (markerGroup.customer) {
            // Update existing customer marker
            markerGroup.customer.setLatLng(position)
            
            // Update popup content
            markerGroup.customer.getPopup()?.setContent(
              `<div><strong>Customer:</strong> ${delivery.customer.name}</div><div>Order ID: ${delivery.id}</div>`
            )
            
            // Update icon if selected state changed
            markerGroup.customer.setIcon(createCustomIcon('customer', false, isSelected))
          } else {
            // Create new customer marker
            const marker = L.marker(position, {
              icon: createCustomIcon('customer', false, isSelected),
              zIndexOffset: isSelected ? 1000 : 0
            })
            .bindPopup(`<div><strong>Customer:</strong> ${delivery.customer.name}</div><div>Order ID: ${delivery.id}</div>`)
            .addTo(map)
            
            if (onDeliverySelect) {
              marker.on('click', () => {
                onDeliverySelect(delivery.id)
              })
            }
            
            markerGroup.customer = marker
          }
        }
        
        // Driver marker (only for active deliveries)
        if (delivery.driver && isActiveDelivery &&
            isValidCoord(delivery.driver.location.lat) && 
            isValidLong(delivery.driver.location.lng)) {
          
          const position: [number, number] = [
            delivery.driver.location.lat, 
            delivery.driver.location.lng
          ]
          
          if (markerGroup.driver) {
            // Update existing driver marker
            markerGroup.driver.setLatLng(position)
            
            // Update popup content
            markerGroup.driver.getPopup()?.setContent(
              `<div><strong>Driver:</strong> ${delivery.driver.name}</div><div>Order ID: ${delivery.id}</div>`
            )
            
            // Update icon
            markerGroup.driver.setIcon(createCustomIcon('driver', enableLiveTracking, isSelected))
          } else {
            // Create new driver marker
            const marker = L.marker(position, {
              icon: createCustomIcon('driver', enableLiveTracking, isSelected),
              zIndexOffset: isSelected ? 1000 : 0
            })
            .bindPopup(`<div><strong>Driver:</strong> ${delivery.driver.name}</div><div>Order ID: ${delivery.id}</div>`)
            .addTo(map)
            
            if (onDeliverySelect) {
              marker.on('click', () => {
                onDeliverySelect(delivery.id)
              })
            }
            
            markerGroup.driver = marker
          }
        } else if (markerGroup.driver) {
          // Remove driver marker if delivery is no longer active
          map.removeLayer(markerGroup.driver)
          markerGroup.driver = undefined
        }
        
        // Add/update polyline between points
        if (isValidCoord(delivery.restaurant.location.lat) && 
            isValidLong(delivery.restaurant.location.lng) &&
            isValidCoord(delivery.customer.location.lat) && 
            isValidLong(delivery.customer.location.lng)) {
          
          const points: [number, number][] = [
            [delivery.restaurant.location.lat, delivery.restaurant.location.lng],
            [delivery.customer.location.lat, delivery.customer.location.lng]
          ]
          
          // Add driver position to polyline for active deliveries
          if (delivery.driver && isActiveDelivery && 
              isValidCoord(delivery.driver.location.lat) && 
              isValidLong(delivery.driver.location.lng)) {
            
            // Insert driver position between restaurant and customer
            points.splice(1, 0, [delivery.driver.location.lat, delivery.driver.location.lng])
          }
          
          if (markerGroup.polyline) {
            // Update existing polyline
            markerGroup.polyline.setLatLngs(points)
          } else {
            // Create new polyline
            const polylineColor = isSelected ? '#0000FF' : 'var(--primary)'
            const polylineOpacity = isSelected ? 0.8 : 0.4
            const polylineWeight = isSelected ? 4 : 2
            
            const polyline = L.polyline(points, {
              color: polylineColor,
              opacity: polylineOpacity,
              weight: polylineWeight,
              dashArray: '5, 10'
            }).addTo(map)
            
            if (onDeliverySelect) {
              polyline.on('click', () => {
                onDeliverySelect(delivery.id)
              })
            }
            
            markerGroup.polyline = polyline
          }
        }
        
        // Save/update the marker group
        markersRef.current[delivery.id] = markerGroup
      })
      
      // Fit map to markers if this is the first render with data
      if (!existingDeliveryIds.length && currentDeliveryIds.length) {
        fitAllMarkers()
      }
      
      // If a delivery is selected, zoom to it
      if (selectedDeliveryId) {
        const selectedDelivery = deliveries.find(d => d.id === selectedDeliveryId)
        if (selectedDelivery) {
          const points: L.LatLngExpression[] = []
          
          if (isValidCoord(selectedDelivery.restaurant.location.lat) && 
              isValidLong(selectedDelivery.restaurant.location.lng)) {
            points.push([selectedDelivery.restaurant.location.lat, selectedDelivery.restaurant.location.lng])
          }
          
          if (isValidCoord(selectedDelivery.customer.location.lat) && 
              isValidLong(selectedDelivery.customer.location.lng)) {
            points.push([selectedDelivery.customer.location.lat, selectedDelivery.customer.location.lng])
          }
          
          if (selectedDelivery.driver?.location && 
              isValidCoord(selectedDelivery.driver.location.lat) && 
              isValidLong(selectedDelivery.driver.location.lng)) {
            points.push([selectedDelivery.driver.location.lat, selectedDelivery.driver.location.lng])
          }
          
          if (points.length > 0) {
            const bounds = L.latLngBounds(points)
            mapRef.current.fitBounds(bounds, { padding: [50, 50] })
          }
        }
      }
      
    } catch (error) {
      console.error("Error updating multi-map markers:", error)
    }
    
  }, [deliveries, initialized, enableLiveTracking, onDeliverySelect, selectedDeliveryId])

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  return (
    <div id="multi-map" className="h-full w-full" />
  )
}