"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search } from "lucide-react"

interface Location {
  lat: number
  lng: number
  address: string
}

interface CompactMapPickerProps {
  id?: string
  value?: Location
  onChange: (location: Location) => void
}

export function CompactMapPicker({ id, value, onChange }: CompactMapPickerProps) {
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
    <div className="space-y-2">
      <div className="flex gap-1">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id={id}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location"
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Button type="button" onClick={handleSearch} size="sm" className="h-8 px-2 text-xs">
          Find
        </Button>
      </div>

      <div className="border rounded-md h-[120px] bg-muted/20 relative">
        {/* This would be replaced with an actual map component */}
        <div className="absolute inset-0 flex items-center justify-center flex-col text-muted-foreground">
          <MapPin className="h-5 w-5 mb-1" />
          <p className="text-xs">Map View</p>
          {value && <p className="text-[10px] mt-1 max-w-[90%] text-center">Selected: {value.address}</p>}
        </div>
      </div>
    </div>
  )
}
