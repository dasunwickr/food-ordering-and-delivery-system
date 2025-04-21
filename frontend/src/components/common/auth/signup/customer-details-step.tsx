"use client"

import type { FormData } from "./compact-registration-form"
import { Label } from "@/components/ui/label"
import { CompactMapPicker } from "./compact-map-picker"

interface CustomerDetailsStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function CustomerDetailsStep({ formData, updateFormData, errors }: CustomerDetailsStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Customer Details</h2>

      <div className="space-y-1">
        <Label htmlFor="location" className="text-xs font-medium">
          Location
        </Label>
        <CompactMapPicker
          id="location"
          value={formData.location}
          onChange={(location) => updateFormData({ location })}
        />
        {errors.location && <p className="text-destructive text-xs">{errors.location}</p>}
      </div>

      <p className="text-xs text-muted-foreground">
        Your location helps us show you nearby restaurants and delivery options.
      </p>
    </div>
  )
}
