"use client"

import { useState } from "react"
import { UserTypeSelection } from "./user-type-selection"
import { UserDetailsForm } from "./user-details-form"
import { RegistrationSummary } from "./registration-summary"
import { ProgressIndicator } from "./progress-indicator"

export type UserType = "customer" | "restaurant" | "driver"

export type FormData = {
  userType: UserType | null
  firstName: string
  lastName: string
  address: string
  email: string
  contactNumber: string
  password: string
  confirmPassword: string
  location: {
    lat: number
    lng: number
    address: string
  } | null
  // Restaurant specific fields
  restaurantName?: string
  restaurantAddress?: string
  restaurantLicenseNumber?: string
  restaurantType?: string
  restaurantDocuments?: File[]
  openingTimes?: {
    [key: string]: { open: string; close: string }[]
  }
  restaurantStatus?: "active" | "inactive"
  // Driver specific fields
  vehicleType?: string
  vehicleNumber?: string
  vehicleDocuments?: File[]
  deliveryStatus?: "available" | "unavailable"
  driverStatus?: "active" | "inactive"
  currentLocation?: {
    lat: number
    lng: number
    address: string
  }
}

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    userType: null,
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
    location: null,
  })

  const totalSteps = 3

  const handleUserTypeSelect = (userType: UserType) => {
    setFormData({ ...formData, userType })
    setCurrentStep(2)
  }

  const handleFormDataChange = (data: Partial<FormData>) => {
    setFormData({ ...formData, ...data })
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    alert("Registration successful!")
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <ProgressIndicator currentStep={currentStep} totalSteps={totalSteps} />

      <div className="mt-8">
        {currentStep === 1 && <UserTypeSelection selectedType={formData.userType} onSelect={handleUserTypeSelect} />}

        {currentStep === 2 && (
          <UserDetailsForm
            formData={formData}
            onChange={handleFormDataChange}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {currentStep === 3 && <RegistrationSummary formData={formData} onBack={handleBack} onSubmit={handleSubmit} />}
      </div>
    </div>
  )
}
