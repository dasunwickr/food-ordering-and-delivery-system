"use client"

import type { FormData } from "./compact-registration-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Mail, Phone, MapPin } from "lucide-react"

interface GeneralInfoStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  errors: Record<string, string>
}

export function GeneralInfoStep({ formData, updateFormData, errors }: GeneralInfoStepProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Personal Information</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="firstName" className="text-xs font-medium">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateFormData({ firstName: e.target.value })}
              placeholder="John"
              className={`pl-8 h-9 text-sm ${errors.firstName ? "border-destructive" : ""}`}
            />
          </div>
          {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="lastName" className="text-xs font-medium">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateFormData({ lastName: e.target.value })}
              placeholder="Doe"
              className={`pl-8 h-9 text-sm ${errors.lastName ? "border-destructive" : ""}`}
            />
          </div>
          {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address" className="text-xs font-medium">
          Address
        </Label>
        <div className="relative">
          <MapPin className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => updateFormData({ address: e.target.value })}
            placeholder="123 Main St, City, Country"
            className={`pl-8 min-h-[60px] text-sm ${errors.address ? "border-destructive" : ""}`}
          />
        </div>
        {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-medium">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            placeholder="john.doe@example.com"
            className={`pl-8 h-9 text-sm ${errors.email ? "border-destructive" : ""}`}
          />
        </div>
        {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="contactNumber" className="text-xs font-medium">
          Contact Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="contactNumber"
            type="tel"
            value={formData.contactNumber}
            onChange={(e) => updateFormData({ contactNumber: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className={`pl-8 h-9 text-sm ${errors.contactNumber ? "border-destructive" : ""}`}
          />
        </div>
        {errors.contactNumber && <p className="text-destructive text-xs">{errors.contactNumber}</p>}
      </div>
    </div>
  )
}
