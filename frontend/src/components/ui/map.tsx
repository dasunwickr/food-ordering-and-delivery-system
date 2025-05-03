"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import "leaflet-routing-machine"
import "leaflet-routing-machine/dist/leaflet-routing-machine.css"
// Add type definition for leaflet-routing-machine
declare module "leaflet" {
  namespace Routing {
    interface RoutingControlOptions {
      waypoints: L.LatLng[]
      lineOptions?: any
      routeWhileDragging?: boolean
      addWaypoints?: boolean
      draggableWaypoints?: boolean
      fitSelectedRoutes?: boolean
      showAlternatives?: boolean
      router?: any
      formatter?: any
      show?: boolean
    }
    class Control {
      constructor(options: RoutingControlOptions)
      addTo(map: L.Map): this
      remove(): void
      on(event: string, callback: (e: any) => void): this
    }
    function control(options: RoutingControlOptions): Control
    function osrm(options: { serviceUrl: string }): any
    function osrmv1(options: { serviceUrl: string; profile: string; useHints?: boolean; timeout?: number }): any
    class Formatter {
      constructor(options: { language: string })
    }
  }
}
import type { Location } from "@/components/ui/delivery-map"
import { useToast } from "@/components/ui/use-toast"

// Fix for default marker icons in Leaflet with Next.js
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
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
  pickupAddress?: string // Restaurant address as fallback
  dropoffAddress?: string // Customer address as fallback
}

export default function Map({
  driverLocation,
  pickupLocation,
  pickupAddress,
  dropoffLocation,
  dropoffAddress,
  showRoute = true,
  animate = true,
  zoom = 14,
  driverId,
  enableLiveTracking = false,
}: MapProps) {
  const { toast } = useToast()
  const mapRef = useRef<L.Map | null>(null)
  const routingControlRef = useRef<L.Routing.Control | null>(null)
  const driverMarkerRef = useRef<L.Marker | null>(null)
  const prevPositionRef = useRef<L.LatLng | null>(null)
  const pickupMarkerRef = useRef<L.Marker | null>(null)
  const dropoffMarkerRef = useRef<L.Marker | null>(null)

  // Add a handler to open Google Maps directions.
  const handleGoogleMaps = () => {
    const origin = `${driverLocation.lat},${driverLocation.lng}`
    const destination = `${dropoffLocation.lat},${dropoffLocation.lng}`
    window.open(
      `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
      "_blank"
    )
  }

  const animateMarker = (
    marker: L.Marker,
    from: L.LatLng,
    to: L.LatLng,
    frames = 100
  ) => {
    let frame = 0

    const animate = () => {
      if (frame < frames) {
        frame++
        const lat = from.lat + (to.lat - from.lat) * (frame / frames)
        const lng = from.lng + (to.lng - from.lng) * (frame / frames)

        marker.setLatLng([lat, lng])
        requestAnimationFrame(animate)
      } else {
        marker.setLatLng(to)
      }
    }

    animate()
  }

  useEffect(() => {
    fixLeafletIcon()

    // Initialize map
    if (!mapRef.current) {
      try {
        mapRef.current = L.map("map").setView([driverLocation.lat, driverLocation.lng], zoom)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current)

        // Create custom icons
        const restaurantIcon = L.divIcon({
          html: `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
                </div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const customerIcon = L.divIcon({
          html: `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        const driverIcon = L.divIcon({
          html: enableLiveTracking
            ? `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                </div>`
            : `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-bike"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>
                </div>`,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        })

        // Add markers for restaurant and customer
        try {
          pickupMarkerRef.current = L.marker([pickupLocation.lat, pickupLocation.lng], {
            icon: restaurantIcon,
          })
            .bindPopup(pickupLocation.label || pickupAddress || "Restaurant")
            .addTo(mapRef.current)

          dropoffMarkerRef.current = L.marker([dropoffLocation.lat, dropoffLocation.lng], {
            icon: customerIcon,
          })
            .bindPopup(dropoffLocation.label || dropoffAddress || "Customer")
            .addTo(mapRef.current)

          // Add initial driver marker if location is provided
          if (driverLocation) {
            driverMarkerRef.current = L.marker([driverLocation.lat, driverLocation.lng], {
              icon: driverIcon,
            })
              .bindPopup(driverLocation.label || "Driver")
              .addTo(mapRef.current)
          }

          // Add routing
          if (showRoute) {
            try {
              // Validate coordinates before creating routing
                // Helper function to validate coordinates
                const isValidCoord = (coord: number): boolean => {
                return typeof coord === 'number' && !isNaN(coord) && 
                     coord !== null && Math.abs(coord) <= 90; // Latitude can only be between -90 and 90
                };
              
              // Helper function to validate longitude
              const isValidLong = (coord: number): boolean => {
                return typeof coord === 'number' && !isNaN(coord) && 
                     coord !== null && Math.abs(coord) <= 180;
                };
              
              // Verify all coordinates are valid before proceeding
              if (!isValidCoord(pickupLocation.lat) || !isValidLong(pickupLocation.lng) ||
                  !isValidCoord(dropoffLocation.lat) || !isValidLong(dropoffLocation.lng)) {
                
                console.warn("Invalid coordinates detected, using fallback straight line:", {
                  pickup: pickupLocation,
                  dropoff: dropoffLocation
                });
                
                // Create a fallback straight line between points
                L.polyline(
                  [
                    [
                      isValidCoord(pickupLocation.lat) ? pickupLocation.lat : 0,
                      isValidLong(pickupLocation.lng) ? pickupLocation.lng : 0
                    ],
                    [
                      isValidCoord(dropoffLocation.lat) ? dropoffLocation.lat : 0,
                      isValidLong(dropoffLocation.lng) ? dropoffLocation.lng : 0
                    ]
                  ],
                  { color: 'var(--primary)', opacity: 0.5, dashArray: '5, 10' }
                ).addTo(mapRef.current);
                
                toast({
                  title: "Route calculation simplified",
                  description: "Using direct path due to missing location data",
                  duration: 3000
                });
                
                return; // Skip routing setup
              }
              
              // Use a public OSRM instance as fallback
              const publicServiceUrl = 'https://router.project-osrm.org';
              
              // Create the routing control with proper error handling
              routingControlRef.current = L.Routing.control({
                waypoints: [
                  L.latLng(pickupLocation.lat, pickupLocation.lng),
                  L.latLng(dropoffLocation.lat, dropoffLocation.lng),
                ],
                lineOptions: {
                  styles: [{ color: "var(--primary)", opacity: 0.7, weight: 4 }],
                  extendToWaypoints: true,
                  missingRouteTolerance: 0,
                },
                routeWhileDragging: false,
                addWaypoints: false,
                draggableWaypoints: false,
                fitSelectedRoutes: true,
                showAlternatives: false,
                router: L.Routing.osrmv1({
                  serviceUrl: publicServiceUrl,
                  profile: 'driving',
                  useHints: false,
                  timeout: 30000
                }),
                formatter: new L.Routing.Formatter({
                  language: 'en'
                }),
                show: false
              }).addTo(mapRef.current)

              const routingContainer = document.querySelector(".leaflet-routing-container")
              if (routingContainer) {
                routingContainer.setAttribute("style", "display: none")
              }

              routingControlRef.current.on('routingerror', function(e) {
                console.error('Routing error:', e);
                
                if (mapRef.current) {
                  L.polyline(
                    [
                      [pickupLocation.lat, pickupLocation.lng],
                      [dropoffLocation.lat, dropoffLocation.lng]
                    ],
                    { color: 'var(--primary)', opacity: 0.5, dashArray: '5, 10' }
                  ).addTo(mapRef.current);
                  
                  toast({
                    title: "Route calculation simplified",
                    description: "Using direct path instead of road network",
                    duration: 3000
                  });
                }
              });
            } catch (routingError) {
              console.error("Error setting up routing:", routingError);
              
              if (mapRef.current) {
                L.polyline(
                  [
                    [pickupLocation.lat, pickupLocation.lng],
                    [dropoffLocation.lat, dropoffLocation.lng]
                  ],
                  { color: 'var(--primary)', opacity: 0.5, dashArray: '5, 10' }
                ).addTo(mapRef.current);
              }
            }
          }

          // Fit bounds to include all markers
          const bounds = L.latLngBounds([
            [driverLocation.lat, driverLocation.lng],
            [pickupLocation.lat, pickupLocation.lng],
            [dropoffLocation.lat, dropoffLocation.lng],
          ])
          mapRef.current.fitBounds(bounds, { padding: [50, 50] })

          // Add double-click event on the map to open Google Maps
          mapRef.current.on("dblclick", handleGoogleMaps)
        } catch (markersError) {
          console.error("Error adding markers:", markersError);
        }
      } catch (mapInitError) {
        console.error("Error initializing map:", mapInitError);
      }
    }

    // Update driver position
    if (mapRef.current && driverMarkerRef.current && driverLocation) {
      try {
        const newPos = L.latLng(driverLocation.lat, driverLocation.lng)

        if (animate && prevPositionRef.current) {
          animateMarker(driverMarkerRef.current, prevPositionRef.current, newPos)
        } else {
          driverMarkerRef.current.setLatLng(newPos)
        }

        prevPositionRef.current = newPos
      } catch (positionError) {
        console.error("Error updating driver position:", positionError);
      }
    }

    // Cleanup
    return () => {
      try {
        if (routingControlRef.current) {
          routingControlRef.current.remove();
          routingControlRef.current = null;
        }
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch (cleanupError) {
        console.error("Error during map cleanup:", cleanupError);
      }
    }
  }, [driverLocation, pickupLocation, dropoffLocation, showRoute, animate, zoom, enableLiveTracking, driverId, toast])

  return (
    <>
      <div id="map" className="h-full w-full" />
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handleGoogleMaps}
          className="bg-primary text-white px-4 py-2 rounded shadow-md"
        >
          Open in Google Maps
        </button>
        
        {enableLiveTracking && driverId && (
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-sm text-muted-foreground">Live tracking active</span>
          </div>
        )}
      </div>
    </>
  )
}
