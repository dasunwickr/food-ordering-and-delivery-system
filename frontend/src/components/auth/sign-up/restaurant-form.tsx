"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Plus, X, MapPin, Upload } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RestaurantFormProps {
  formData: {
    restaurantName: string
    restaurantAddress: string
    restaurantLicenseNumber: string
    restaurantType: string
    cuisineTypes: string[]
    documents: { name: string; file: File }[]
    openingHours: { day: string; openTime: string; closeTime: string }[]
    location: {
      lat: number
      lng: number
      address: string
    }
  }
  updateFormData: (
    data: Partial<{
      restaurantName: string
      restaurantAddress: string
      restaurantLicenseNumber: string
      restaurantType: string
      cuisineTypes: string[]
      documents: { name: string; file: File }[]
      openingHours: { day: string; openTime: string; closeTime: string }[]
      location: {
        lat: number
        lng: number
        address: string
      }
    }>,
  ) => void
  onSubmit: () => void
  onBack: () => void
}

// Mock data
const restaurantTypes = ["Fast Food", "Casual Dining", "Fine Dining", "Cafe", "Buffet", "Food Truck"]

const cuisineTypes = [
  "Italian",
  "Chinese",
  "Indian",
  "Mexican",
  "Japanese",
  "Thai",
  "American",
  "Mediterranean",
  "French",
  "Greek",
]

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function RestaurantForm({ formData, updateFormData, onSubmit, onBack }: RestaurantFormProps) {
  const [isRestaurantTypeOpen, setIsRestaurantTypeOpen] = useState(false)
  const [isCuisineTypesOpen, setIsCuisineTypesOpen] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && documentName) {
      const newDoc = {
        name: documentName,
        file: e.target.files[0],
      }
      updateFormData({
        documents: [...formData.documents, newDoc],
      })
      setDocumentName("")
    }
  }

  const handleRemoveDocument = (index: number) => {
    const updatedDocs = [...formData.documents]
    updatedDocs.splice(index, 1)
    updateFormData({ documents: updatedDocs })
  }

  const handleAddOpeningHours = (day: string) => {
    if (!formData.openingHours.some((hour) => hour.day === day)) {
      updateFormData({
        openingHours: [...formData.openingHours, { day, openTime: "09:00", closeTime: "17:00" }],
      })
    }
  }

  const handleUpdateOpeningHours = (index: number, field: "openTime" | "closeTime", value: string) => {
    const updatedHours = [...formData.openingHours]
    updatedHours[index][field] = value
    updateFormData({ openingHours: updatedHours })
  }

  const handleRemoveOpeningHours = (index: number) => {
    const updatedHours = [...formData.openingHours]
    updatedHours.splice(index, 1)
    updateFormData({ openingHours: updatedHours })
  }

  const handleSelectRestaurantType = (type: string) => {
    updateFormData({ restaurantType: type })
    setIsRestaurantTypeOpen(false)
  }

  const handleToggleCuisineType = (type: string) => {
    const updatedCuisines = formData.cuisineTypes.includes(type)
      ? formData.cuisineTypes.filter((t) => t !== type)
      : [...formData.cuisineTypes, type]
    updateFormData({ cuisineTypes: updatedCuisines })
  }

  // Mock function to simulate location selection
  const handleSelectLocation = () => {
    // In a real app, this would come from a map API
    updateFormData({
      location: {
        lat: 40.7128,
        lng: -74.006,
        address: searchQuery || formData.restaurantAddress,
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
          <h1 className="text-2xl font-semibold tracking-tight">Restaurant Details</h1>
        </div>
        <p className="text-sm text-muted-foreground">Please provide information about your restaurant</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Restaurant Name</Label>
          <Input
            id="restaurantName"
            value={formData.restaurantName}
            onChange={(e) => updateFormData({ restaurantName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantAddress">Restaurant Address</Label>
          <Textarea
            id="restaurantAddress"
            value={formData.restaurantAddress}
            onChange={(e) => updateFormData({ restaurantAddress: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="restaurantLicenseNumber">Restaurant License Number</Label>
          <Input
            id="restaurantLicenseNumber"
            value={formData.restaurantLicenseNumber}
            onChange={(e) => updateFormData({ restaurantLicenseNumber: e.target.value })}
            required
          />
        </div>

        {/* Restaurant Type Selection */}
        <div className="space-y-2">
          <Label>Restaurant Type</Label>
          <Dialog open={isRestaurantTypeOpen} onOpenChange={setIsRestaurantTypeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between" type="button">
                {formData.restaurantType || "Select Restaurant Type"}
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Restaurant Type</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                {restaurantTypes.map((type) => (
                  <Button
                    key={type}
                    variant={formData.restaurantType === type ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleSelectRestaurantType(type)}
                    type="button"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Cuisine Types Selection */}
        <div className="space-y-2">
          <Label>Cuisine Types</Label>
          <Dialog open={isCuisineTypesOpen} onOpenChange={setIsCuisineTypesOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between" type="button">
                {formData.cuisineTypes.length > 0 ? `${formData.cuisineTypes.length} selected` : "Select Cuisine Types"}
                <Plus className="h-4 w-4 ml-2" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Cuisine Types</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                {cuisineTypes.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cuisine-${type}`}
                      checked={formData.cuisineTypes.includes(type)}
                      onCheckedChange={() => handleToggleCuisineType(type)}
                    />
                    <Label htmlFor={`cuisine-${type}`}>{type}</Label>
                  </div>
                ))}
              </div>
              <Button onClick={() => setIsCuisineTypesOpen(false)} className="w-full">
                Done
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <Label>Restaurant Documents</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="flex-1"
              />
              <div className="relative">
                <Input
                  type="file"
                  id="document-upload"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAddDocument}
                />
                <Button type="button" variant="outline" disabled={!documentName}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {formData.documents.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div className="space-y-2">
          <Label>Opening Hours</Label>
          <Select onValueChange={handleAddOpeningHours}>
            <SelectTrigger>
              <SelectValue placeholder="Add opening hours" />
            </SelectTrigger>
            <SelectContent>
              {weekDays
                .filter((day) => !formData.openingHours.some((hour) => hour.day === day))
                .map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {formData.openingHours.length > 0 && (
            <div className="space-y-2 mt-2">
              {formData.openingHours.map((hour, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-muted rounded-md">
                  <span className="text-sm font-medium w-24">{hour.day}</span>
                  <Input
                    type="time"
                    value={hour.openTime}
                    onChange={(e) => handleUpdateOpeningHours(index, "openTime", e.target.value)}
                    className="w-28"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={hour.closeTime}
                    onChange={(e) => handleUpdateOpeningHours(index, "closeTime", e.target.value)}
                    className="w-28"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveOpeningHours(index)}
                    className="h-8 w-8 p-0 ml-auto"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Map */}
        <div className="space-y-2">
          <Label htmlFor="location">Restaurant Location on Map</Label>
          <div className="flex space-x-2">
            <Input
              id="location"
              placeholder="Search location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="button" onClick={handleSelectLocation} size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Find
            </Button>
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
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            !formData.restaurantName ||
            !formData.restaurantAddress ||
            !formData.restaurantLicenseNumber ||
            !formData.restaurantType ||
            formData.cuisineTypes.length === 0 ||
            formData.openingHours.length === 0 ||
            !formData.location.address
          }
        >
          Complete Registration
        </Button>
      </div>
    </form>
  )
}
