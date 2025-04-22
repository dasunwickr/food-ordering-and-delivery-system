"use client"

import type React from "react"

import { useState } from "react"
import type { FormData } from "./registration-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MapPicker } from "./map-picker"
import { PlusIcon, TrashIcon } from "lucide-react"

interface RestaurantFormProps {
  formData: FormData
  onChange: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

// Mock restaurant types from backend
const restaurantTypes = [
  "Fast Food",
  "Fine Dining",
  "Casual Dining",
  "Cafe",
  "Buffet",
  "Food Truck",
  "Pizzeria",
  "Bakery",
  "Pub",
  "Bistro",
]

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function RestaurantForm({ formData, onChange, errors }: RestaurantFormProps) {
  const [openingTimes, setOpeningTimes] = useState<{
    [key: string]: { open: string; close: string }[]
  }>(
    formData.openingTimes ||
      weekDays.reduce(
        (acc, day) => {
          acc[day] = [{ open: "09:00", close: "17:00" }]
          return acc
        },
        {} as { [key: string]: { open: string; close: string }[] },
      ),
  )

  const handleOpeningTimesChange = (day: string, index: number, field: "open" | "close", value: string) => {
    const newTimes = { ...openingTimes }
    newTimes[day][index][field] = value
    setOpeningTimes(newTimes)
    onChange({ openingTimes: newTimes })
  }

  const addTimeSlot = (day: string) => {
    const newTimes = { ...openingTimes }
    newTimes[day].push({ open: "09:00", close: "17:00" })
    setOpeningTimes(newTimes)
    onChange({ openingTimes: newTimes })
  }

  const removeTimeSlot = (day: string, index: number) => {
    const newTimes = { ...openingTimes }
    newTimes[day].splice(index, 1)
    setOpeningTimes(newTimes)
    onChange({ openingTimes: newTimes })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onChange({ restaurantDocuments: Array.from(e.target.files) })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="restaurantName" className="text-sm font-medium">
          Restaurant Name
        </Label>
        <Input
          id="restaurantName"
          value={formData.restaurantName || ""}
          onChange={(e) => onChange({ restaurantName: e.target.value })}
          placeholder="Restaurant Name"
          className={errors.restaurantName ? "border-destructive" : ""}
        />
        {errors.restaurantName && <p className="text-destructive text-xs">{errors.restaurantName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurantAddress" className="text-sm font-medium">
          Restaurant Address
        </Label>
        <Input
          id="restaurantAddress"
          value={formData.restaurantAddress || ""}
          onChange={(e) => onChange({ restaurantAddress: e.target.value })}
          placeholder="Restaurant Address"
          className={errors.restaurantAddress ? "border-destructive" : ""}
        />
        {errors.restaurantAddress && <p className="text-destructive text-xs">{errors.restaurantAddress}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurantLicenseNumber" className="text-sm font-medium">
          Restaurant License Number
        </Label>
        <Input
          id="restaurantLicenseNumber"
          value={formData.restaurantLicenseNumber || ""}
          onChange={(e) => onChange({ restaurantLicenseNumber: e.target.value })}
          placeholder="License Number"
          className={errors.restaurantLicenseNumber ? "border-destructive" : ""}
        />
        {errors.restaurantLicenseNumber && <p className="text-destructive text-xs">{errors.restaurantLicenseNumber}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurantType" className="text-sm font-medium">
          Restaurant Type
        </Label>
        <Select value={formData.restaurantType || ""} onValueChange={(value) => onChange({ restaurantType: value })}>
          <SelectTrigger id="restaurantType" className={errors.restaurantType ? "border-destructive" : ""}>
            <SelectValue placeholder="Select restaurant type" />
          </SelectTrigger>
          <SelectContent>
            {restaurantTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.restaurantType && <p className="text-destructive text-xs">{errors.restaurantType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="restaurantDocuments" className="text-sm font-medium">
          Upload Restaurant Documents
        </Label>
        <Input
          id="restaurantDocuments"
          type="file"
          multiple
          onChange={handleFileChange}
          className={errors.restaurantDocuments ? "border-destructive" : ""}
        />
        {errors.restaurantDocuments && <p className="text-destructive text-xs">{errors.restaurantDocuments}</p>}
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-medium">Opening Times</Label>

        {weekDays.map((day) => (
          <div key={day} className="space-y-2">
            <div className="flex items-center">
              <span className="w-24 font-medium">{day}</span>
            </div>

            {openingTimes[day].map((time, index) => (
              <div key={index} className="flex items-center gap-2 ml-6">
                <Input
                  type="time"
                  value={time.open}
                  onChange={(e) => handleOpeningTimesChange(day, index, "open", e.target.value)}
                  className="w-32"
                />
                <span>to</span>
                <Input
                  type="time"
                  value={time.close}
                  onChange={(e) => handleOpeningTimesChange(day, index, "close", e.target.value)}
                  className="w-32"
                />

                {openingTimes[day].length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeTimeSlot(day, index)}>
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" className="ml-6" onClick={() => addTimeSlot(day)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="restaurantStatus"
          checked={formData.restaurantStatus === "active"}
          onCheckedChange={(checked) => onChange({ restaurantStatus: checked ? "active" : "inactive" })}
        />
        <Label htmlFor="restaurantStatus" className="text-sm font-medium">
          Restaurant Status ({formData.restaurantStatus === "active" ? "Active" : "Inactive"})
        </Label>
      </div>

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
