"use client"

import { useState } from "react"

import { BasicInfoForm } from "@/components/auth/sign-up/basic-info-form"
import { CustomerForm } from "@/components/auth/sign-up/customer-form"
import { RestaurantForm } from "@/components/auth/sign-up/restaurant-form"
import { DriverForm } from "@/components/auth/sign-up/driver-form"
import { EmailPasswordForm } from "@/components/auth/sign-up/email-password-form"
import { UserTypeForm } from "@/components/auth/sign-up/user-type-form"

type UserType = "customer" | "restaurant" | "driver" | null

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    contactNumber: "",
    userType: null as UserType,
    // Customer specific
    location: { lat: 0, lng: 0, address: "" },
    // Restaurant specific
    restaurantName: "",
    restaurantAddress: "",
    restaurantLicenseNumber: "",
    restaurantType: "",
    cuisineTypes: [] as string[],
    documents: [] as { name: string; file: File }[],
    openingHours: [] as { day: string; openTime: string; closeTime: string }[],
    // Driver specific
    vehicleNumber: "",
    vehicleType: "",
    vehicleDocuments: [] as { name: string; file: File }[],
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => setStep((prev) => prev + 1)
  const prevStep = () => setStep((prev) => prev - 1)

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    updateFormData({ userType: type })
    nextStep()
  }

  return (
    <div className="space-y-6 w-full">
      {step === 1 && <EmailPasswordForm formData={formData} updateFormData={updateFormData} onNext={nextStep} />}

      {step === 2 && <UserTypeForm onSelect={handleUserTypeSelect} onBack={prevStep} />}

      {step === 3 && (
        <BasicInfoForm formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />
      )}

      {step === 4 && userType === "customer" && (
        <CustomerForm
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={() => console.log("Submit customer form", formData)}
          onBack={prevStep}
        />
      )}

      {step === 4 && userType === "restaurant" && (
        <RestaurantForm
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={() => console.log("Submit restaurant form", formData)}
          onBack={prevStep}
        />
      )}

      {step === 4 && userType === "driver" && (
        <DriverForm
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={() => console.log("Submit driver form", formData)}
          onBack={prevStep}
        />
      )}
    </div>
  )
}
