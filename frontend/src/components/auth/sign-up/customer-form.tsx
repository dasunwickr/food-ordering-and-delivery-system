"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ChevronLeft, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CustomerFormProps {
  formData: {
    location: {
      lat: number
      lng: number
      address: string
    }
  }
  updateFormData: (data: {
    location: {
      lat: number
      lng: number
      address: string
    }
  }) => void
  onSubmit: () => void
  onBack: () => void
}

export function CustomerForm({ formData, updateFormData, onSubmit, onBack }: CustomerFormProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  // Mock function to simulate location selection
  const handleSelectLocation = () => {
    // In a real app, this would come from a map API
    updateFormData({
      location: {
        lat: 40.7128,
        lng: -74.006,
        address: searchQuery || "123 Main St, New York, NY 10001",
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mr-2 h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Your Location</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Please select your location to help us find restaurants near you
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location">Search Location</Label>
          <div className="flex space-x-2">
            <Input
              id="location"
              placeholder="Enter your address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={handleSelectLocation} size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Find
            </Button>
          </div>
        </div>

        {/* Map placeholder */}
        <Card className="w-full h-64 bg-muted flex items-center justify-center">
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Map would be displayed here</p>
            {formData.location.address && (
              <div className="mt-4 p-2 bg-background rounded-md text-sm">Selected: {formData.location.address}</div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={!formData.location.address}>
          Complete Registration
        </Button>
      </div>
    </form>
  )
}
