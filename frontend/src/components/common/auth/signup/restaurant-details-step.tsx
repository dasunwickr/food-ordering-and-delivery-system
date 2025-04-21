"use client"

import type { FormData } from "./compact-registration-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CompactMapPicker } from "./compact-map-picker"
import { CompactTimeSelector } from "./compact-time-selector"
import { Store } from "lucide-react"

interface RestaurantDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function RestaurantDetailsStep({ formData, updateFormData, errors }: RestaurantDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Restaurant Details</h2>

      <div className="space-y-1">
        <Label htmlFor="restaurantName" className="text-xs font-medium">
          Restaurant Name
        </Label>
        <div className="relative">
          <Store className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="restaurantName"
            value={formData.restaurantName || ""}
            onChange={(e) => updateFormData({ restaurantName: e.target.value })}
            placeholder="Restaurant Name"
            className={`pl-8 h-9 text-sm ${errors.restaurantName ? "border-destructive" : ""}`}
          />
        </div>
        {errors.restaurantName && <p className="text-destructive text-xs">{errors.restaurantName}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="restaurantDescription" className="text-xs font-medium">
          Description
        </Label>
        <Textarea
          id="restaurantDescription"
          value={formData.restaurantDescription || ""}
          onChange={(e) => updateFormData({ restaurantDescription: e.target.value })}
          placeholder="Brief description of your restaurant"
          className={`min-h-[60px] text-sm ${errors.restaurantDescription ? "border-destructive" : ""}`}
        />
        {errors.restaurantDescription && <p className="text-destructive text-xs">{errors.restaurantDescription}</p>}
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium">Opening Times</Label>
        <CompactTimeSelector
          value={formData.openingTimes || {}}
          onChange={(openingTimes) => updateFormData({ openingTimes })}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="restaurantLocation" className="text-xs font-medium">
          Restaurant Location
        </Label>
        <CompactMapPicker
          id="restaurantLocation"
          value={formData.restaurantLocation}
          onChange={(location) => updateFormData({ restaurantLocation: location })}
        />
        {errors.restaurantLocation && <p className="text-destructive text-xs">{errors.restaurantLocation}</p>}
      </div>
    </div>
  )
}
