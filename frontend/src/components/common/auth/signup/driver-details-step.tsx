"use client"

import type { FormData } from "./compact-registration-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, Truck } from "lucide-react"

interface DriverDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

// Mock vehicle types
const vehicleTypes = ["Car", "Motorcycle", "Bicycle", "Scooter", "Van", "Truck"]

export function DriverDetailsStep({ formData, updateFormData, errors }: DriverDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Driver Details</h2>

      <div className="space-y-1">
        <Label htmlFor="vehicleType" className="text-xs font-medium">
          Vehicle Type
        </Label>
        <Select value={formData.vehicleType || ""} onValueChange={(value) => updateFormData({ vehicleType: value })}>
          <SelectTrigger id="vehicleType" className={`h-9 text-sm ${errors.vehicleType ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Select vehicle type" />
          </SelectTrigger>
          <SelectContent>
            {vehicleTypes.map((type) => (
              <SelectItem key={type} value={type} className="text-sm">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.vehicleType && <p className="text-destructive text-xs">{errors.vehicleType}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="vehicleCapacity" className="text-xs font-medium">
          Vehicle Capacity
        </Label>
        <div className="relative">
          <Truck className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="vehicleCapacity"
            value={formData.vehicleCapacity || ""}
            onChange={(e) => updateFormData({ vehicleCapacity: e.target.value })}
            placeholder="e.g., 2 passengers, 10kg cargo"
            className={`pl-8 h-9 text-sm ${errors.vehicleCapacity ? "border-destructive" : ""}`}
          />
        </div>
        {errors.vehicleCapacity && <p className="text-destructive text-xs">{errors.vehicleCapacity}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="licensePlate" className="text-xs font-medium">
          License Plate
        </Label>
        <div className="relative">
          <Car className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="licensePlate"
            value={formData.licensePlate || ""}
            onChange={(e) => updateFormData({ licensePlate: e.target.value })}
            placeholder="ABC-1234"
            className={`pl-8 h-9 text-sm ${errors.licensePlate ? "border-destructive" : ""}`}
          />
        </div>
        {errors.licensePlate && <p className="text-destructive text-xs">{errors.licensePlate}</p>}
      </div>

      <p className="text-xs text-muted-foreground">
        Your vehicle information helps us match you with appropriate delivery orders.
      </p>
    </div>
  )
}
