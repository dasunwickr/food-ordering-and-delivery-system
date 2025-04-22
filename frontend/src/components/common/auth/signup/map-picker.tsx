"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPinIcon, SearchIcon } from "lucide-react"

interface Location {
  lat: number
  lng: number
  address: string
}

interface MapPickerProps {
  id?: string
  value: Location | null
  onChange: (location: Location) => void
}

export function MapPicker({ id, value, onChange }: MapPickerProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // In a real implementation, this would use the Google Maps or Mapbox API
  const handleSearch = () => {
    if (searchQuery) {
      // Mock location data - in a real app, this would come from the Maps API
      const mockLocation = {
        lat: 40.7128,
        lng: -74.006,
        address: searchQuery,
      }
      onChange(mockLocation)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={id}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location"
            className="w-full"
          />
        </div>
        <Button type="button" onClick={handleSearch} className="shrink-0">
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="border rounded-md h-[200px] bg-muted/20 relative">
        {/* This would be replaced with an actual map component */}
        <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
          <MapPinIcon className="h-8 w-8 mb-2" />
          <p className="text-sm">Map View</p>
          {value && <p className="text-xs mt-2 max-w-[80%] text-center">Selected: {value.address}</p>}
        </div>
      </div>
    </div>
  )
}
