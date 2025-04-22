"use client"

import { useState } from "react"
import type { FormData } from "./registration-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckIcon, Loader2Icon } from "lucide-react"

interface RegistrationSummaryProps {
  formData: FormData
  onBack: () => void
  onSubmit: () => Promise<void>
}

export function RegistrationSummary({ formData, onBack, onSubmit }: RegistrationSummaryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Registration Summary</h1>
        <p className="text-muted-foreground mt-2">Please review your information before submitting</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Account Type</h3>
                <p className="text-muted-foreground capitalize">{formData.userType}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">First Name</h3>
                <p className="text-muted-foreground">{formData.firstName}</p>
              </div>
              <div>
                <h3 className="font-medium">Last Name</h3>
                <p className="text-muted-foreground">{formData.lastName}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium">Address</h3>
              <p className="text-muted-foreground">{formData.address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-muted-foreground">{formData.email}</p>
              </div>
              <div>
                <h3 className="font-medium">Contact Number</h3>
                <p className="text-muted-foreground">{formData.contactNumber}</p>
              </div>
            </div>

            {formData.location && (
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-muted-foreground">{formData.location.address}</p>
              </div>
            )}

            {/* Restaurant specific fields */}
            {formData.userType === "restaurant" && (
              <>
                <div>
                  <h3 className="font-medium">Restaurant Name</h3>
                  <p className="text-muted-foreground">{formData.restaurantName}</p>
                </div>
                <div>
                  <h3 className="font-medium">Restaurant Address</h3>
                  <p className="text-muted-foreground">{formData.restaurantAddress}</p>
                </div>
                <div>
                  <h3 className="font-medium">Restaurant License Number</h3>
                  <p className="text-muted-foreground">{formData.restaurantLicenseNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium">Restaurant Type</h3>
                  <p className="text-muted-foreground">{formData.restaurantType}</p>
                </div>
                <div>
                  <h3 className="font-medium">Restaurant Status</h3>
                  <p className="text-muted-foreground capitalize">{formData.restaurantStatus}</p>
                </div>
                <div>
                  <h3 className="font-medium">Documents</h3>
                  <p className="text-muted-foreground">
                    {formData.restaurantDocuments
                      ? `${formData.restaurantDocuments.length} files uploaded`
                      : "No documents uploaded"}
                  </p>
                </div>
              </>
            )}

            {/* Driver specific fields */}
            {formData.userType === "driver" && (
              <>
                <div>
                  <h3 className="font-medium">Vehicle Type</h3>
                  <p className="text-muted-foreground">{formData.vehicleType}</p>
                </div>
                <div>
                  <h3 className="font-medium">Vehicle Number</h3>
                  <p className="text-muted-foreground">{formData.vehicleNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium">Delivery Status</h3>
                  <p className="text-muted-foreground capitalize">{formData.deliveryStatus}</p>
                </div>
                <div>
                  <h3 className="font-medium">Driver Status</h3>
                  <p className="text-muted-foreground capitalize">{formData.driverStatus}</p>
                </div>
                <div>
                  <h3 className="font-medium">Documents</h3>
                  <p className="text-muted-foreground">
                    {formData.vehicleDocuments
                      ? `${formData.vehicleDocuments.length} files uploaded`
                      : "No documents uploaded"}
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckIcon className="mr-2 h-4 w-4" />
              Complete Registration
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
