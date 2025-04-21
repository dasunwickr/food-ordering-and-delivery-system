"use client"

import { useState } from "react"
import type { FormData } from "./registration-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CustomerForm } from "./customer-form"
import { RestaurantForm } from "./restaurant-form"
import { DriverForm } from "./driver-form"

interface UserDetailsFormProps {
  formData: FormData
  onChange: (data: Partial<FormData>) => void
  onBack: () => void
  onNext: () => void
}

export function UserDetailsForm({ formData, onChange, onBack, onNext }: UserDetailsFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Common validations
    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!formData.contactNumber) newErrors.contactNumber = "Contact number is required"
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    // Location validation for customers
    if (formData.userType === "customer" && !formData.location) {
      newErrors.location = "Location is required"
    }

    // Restaurant specific validations
    if (formData.userType === "restaurant") {
      if (!formData.restaurantName) newErrors.restaurantName = "Restaurant name is required"
      if (!formData.restaurantAddress) newErrors.restaurantAddress = "Restaurant address is required"
      if (!formData.restaurantLicenseNumber) newErrors.restaurantLicenseNumber = "License number is required"
      if (!formData.restaurantType) newErrors.restaurantType = "Restaurant type is required"
    }

    // Driver specific validations
    if (formData.userType === "driver") {
      if (!formData.vehicleType) newErrors.vehicleType = "Vehicle type is required"
      if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0]
      const element = document.getElementById(firstErrorField)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value })

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {formData.userType === "customer"
            ? "Customer Registration"
            : formData.userType === "restaurant"
              ? "Restaurant Registration"
              : "Driver Registration"}
        </h1>
        <p className="text-muted-foreground mt-2">Please fill in your details</p>
      </div>

      <div className="space-y-6">
        {/* Common fields for all user types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-medium">
              First Name
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              placeholder="John"
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-medium">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              placeholder="Doe"
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-sm font-medium">
            Address
          </Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="123 Main St, City, Country"
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber" className="text-sm font-medium">
              Contact Number
            </Label>
            <Input
              id="contactNumber"
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => handleChange("contactNumber", e.target.value)}
              placeholder="+1 (555) 123-4567"
              className={errors.contactNumber ? "border-destructive" : ""}
            />
            {errors.contactNumber && <p className="text-destructive text-xs">{errors.contactNumber}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className={errors.password ? "border-destructive" : ""}
            />
            {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className={errors.confirmPassword ? "border-destructive" : ""}
            />
            {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* User type specific fields */}
        {formData.userType === "customer" && <CustomerForm formData={formData} onChange={onChange} errors={errors} />}

        {formData.userType === "restaurant" && (
          <RestaurantForm formData={formData} onChange={onChange} errors={errors} />
        )}

        {formData.userType === "driver" && <DriverForm formData={formData} onChange={onChange} errors={errors} />}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>Next</Button>
      </div>
    </div>
  )
}
