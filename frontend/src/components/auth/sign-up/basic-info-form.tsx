"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"

interface BasicInfoFormProps {
  formData: {
    firstName: string
    lastName: string
    contactNumber: string
  }
  updateFormData: (
    data: Partial<{
      firstName: string
      lastName: string
      contactNumber: string
    }>,
  ) => void
  onNext: () => void
  onBack: () => void
}

export function BasicInfoForm({ formData, updateFormData, onNext, onBack }: BasicInfoFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mr-2 h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Basic Information</h1>
        </div>
        <p className="text-sm text-muted-foreground">Please provide your personal details</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => updateFormData({ contactNumber: e.target.value })}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Continue
        </Button>
      </div>
    </form>
  )
}
