"use client"

import type { FormData } from "./registration-form"
import { Label } from "@/components/ui/label"
import { MapPicker } from "./map-picker"

interface CustomerFormProps {
  formData: FormData
  onChange: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function CustomerForm({ formData, onChange, errors }: CustomerFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="location" className="text-sm font-medium">
          Location
        </Label>
        <MapPicker id="location" value={formData.location} onChange={(location) => onChange({ location })} />
        {errors.location && <p className="text-destructive text-xs">{errors.location}</p>}
      </div>
    </div>
  )
}
