import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface LocationData {
  lat: number
  lng: number
  address: string
}

interface LocationState {
  location: LocationData
  locationSelected: boolean
  showMap: boolean
  
  // Actions
  setLocation: (location: LocationData) => void
  clearLocation: () => void
  toggleMap: (isOpen: boolean) => void
  confirmLocation: () => void
}

const defaultLocation = {
  lat: 6.9271, // Default to Colombo, Sri Lanka
  lng: 79.8612,
  address: ""
}

export const useLocationStore = create<LocationState>()(
  devtools(
    (set) => ({
      location: defaultLocation,
      locationSelected: false,
      showMap: false,
      
      setLocation: (location) => set({
        location,
        locationSelected: !!location.address
      }),
      
      clearLocation: () => set({
        location: defaultLocation,
        locationSelected: false
      }),
      
      toggleMap: (isOpen) => set({
        showMap: isOpen
      }),
      
      confirmLocation: () => set((state) => ({
        locationSelected: true,
        showMap: false
      }))
    }),
    { name: "location-store" }
  )
)