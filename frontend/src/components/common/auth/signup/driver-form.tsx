"use client"

import type React from "react"

import type { FormData } from "./registration-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MapPicker } from "./map-picker"

interface DriverFormProps {
  formData: FormData
  onChange: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

// Mock vehicle types from backend
const vehicleTypes = ["Car", "Motorcycle", "Bicycle", "Scooter", "Van", "Truck"]

export function DriverForm({ formData, onChange, errors }: DriverFormProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange({ vehicleDocuments: Array.from(e.target.files) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="vehicleType" className="text-sm font-medium">
          Vehicle Type
        </Label>
        <Select value={formData.vehicleType || ""} onValueChange={(value) => onChange({ vehicleType: value })}>
          <SelectTrigger id="vehicleType" className={errors.vehicleType ? "border-destructive" : ""}>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicleType && <p className="text-destructive text-xs">{errors.vehicleType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleNumber" className="text-sm font-medium">
          Vehicle Number
        </Label>
        <Input
          id="vehicleNumber"
          value={formData.vehicleNumber || ""}
          onChange={(e) => onChange({ vehicleNumber: e.target.value })}
          placeholder="Vehicle Number"
          className={errors.vehicleNumber ? "border-destructive" : ""}
        />
        {errors.vehicleNumber && <p className="text-destructive text-xs">{errors.vehicleNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="vehicleDocuments" className="text-sm font-medium">
          Upload Vehicle Documents
        </Label>
        <Input
          id="vehicleDocuments"
          type="file"
          multiple
          onChange={handleFileChange}
          className={errors.vehicleDocuments ? "border-destructive" : ""}
        />
        {errors.vehicleDocuments && <p className="text-destructive text-xs">{errors.vehicleDocuments}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="deliveryStatus"
          checked={formData.deliveryStatus === "available"}
          onCheckedChange={(checked) => onChange({ deliveryStatus: checked ? "available" : "unavailable" })}
        />
        <Label htmlFor="deliveryStatus" className="text-sm font-medium">
          Delivery Status ({formData.deliveryStatus === "available" ? "Available" : "Unavailable"})
        </Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="driverStatus"
          checked={formData.driverStatus === "active"}
          onCheckedChange={(checked) => onChange({ driverStatus: checked ? "active" : "inactive" })}
        />
        <Label htmlFor="driverStatus" className="text-sm font-medium">
          Driver Status ({formData.driverStatus === "active" ? "Active" : "Inactive"})
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentLocation" className="text-sm font-medium">
          Current Location
        </Label>
        <MapPicker
          id="currentLocation"
          value={formData.currentLocation || null}
          onChange={(location) => onChange({ currentLocation: location })}
        />
        {errors.currentLocation && <p className="text-destructive text-xs">{errors.currentLocation}</p>}
      </div>
    </div>
  )
}
