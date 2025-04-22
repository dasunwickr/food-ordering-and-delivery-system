"use client"

import { useState } from "react"
import { CompactStepper } from "./compact-stepper"
import { UserTypeModal } from "./user-type-modal"
import { GeneralInfoStep } from "./general-info-step"
import { PasswordStep } from "./password-step"
import { CustomerDetailsStep } from "./customer-details-step"
import { RestaurantDetailsStep } from "./restaurant-details-step"
import { DriverDetailsStep } from "./driver-details-step"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

export type UserType = "customer" | "restaurant" | "driver" | null

export type FormData = {
  firstName: string
  lastName: string
  address: string
  email: string
  contactNumber: string
  password: string
  userType: UserType
  // Customer specific
  location?: {
    lat: number
    lng: number
    address: string
  }
  // Restaurant specific
  restaurantName?: string
  restaurantDescription?: string
  openingTimes?: {
    [key: string]: { open: string; close: string }
  }
  restaurantLocation?: {
    lat: number
    lng: number
    address: string
  }
  // Driver specific
  vehicleType?: string
  vehicleCapacity?: string
  licensePlate?: string
}

export function CompactRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    contactNumber: "",
    password: "",
    userType: null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 3

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))

    // Clear errors for updated fields
    const updatedErrors = { ...errors }
    Object.keys(data).forEach((key) => {
      if (updatedErrors[key]) {
        delete updatedErrors[key]
      }
    })
    setErrors(updatedErrors)
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "Required"
      if (!formData.lastName) newErrors.lastName = "Required"
      if (!formData.email) {
        newErrors.email = "Required"
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Invalid email"
      }
      if (!formData.contactNumber) newErrors.contactNumber = "Required"
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Required"
      } else {
        if (formData.password.length < 8) newErrors.password = "Too short"
      }
    }

    if (step === 3) {
      if (formData.userType === "customer" && !formData.location) {
        newErrors.location = "Location required"
      }

      if (formData.userType === "restaurant") {
        if (!formData.restaurantName) newErrors.restaurantName = "Required"
        if (!formData.restaurantLocation) newErrors.restaurantLocation = "Required"
      }

      if (formData.userType === "driver") {
        if (!formData.vehicleType) newErrors.vehicleType = "Required"
        if (!formData.licensePlate) newErrors.licensePlate = "Required"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !formData.userType) {
        setShowTypeModal(true)
      } else if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleUserTypeSelect = (type: UserType) => {
    updateFormData({ userType: type })
    setShowTypeModal(false)
    setCurrentStep(2)
  }

  const handleSubmit = () => {
    console.log("Form submitted:", formData)
    // Here you would send the data to your API
    alert("Registration successful!")
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-sm">
      <CompactStepper currentStep={currentStep} totalSteps={totalSteps} />

      <div className="mt-6">
        {currentStep === 1 && <GeneralInfoStep formData={formData} updateFormData={updateFormData} errors={errors} />}

        {currentStep === 2 && (
          <PasswordStep
            password={formData.password}
            updatePassword={(password) => updateFormData({ password })}
            error={errors.password}
          />
        )}

        {currentStep === 3 && formData.userType === "customer" && (
          <CustomerDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
        )}

        {currentStep === 3 && formData.userType === "restaurant" && (
          <RestaurantDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
        )}

        {currentStep === 3 && formData.userType === "driver" && (
          <DriverDetailsStep formData={formData} updateFormData={updateFormData} errors={errors} />
        )}
      </div>

      <div className="flex justify-between mt-6">
        {currentStep > 1 ? (
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        ) : (
          <div></div>
        )}

        <Button size="sm" onClick={handleNext}>
          {currentStep < totalSteps ? (
            <>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </>
          ) : (
            <>
              Complete <Check className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>

      {showTypeModal && <UserTypeModal onSelect={handleUserTypeSelect} onClose={() => setShowTypeModal(false)} />}
    </div>
  )
}
