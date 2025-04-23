"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Upload, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface DriverFormProps {
  formData: {
    vehicleNumber: string
    vehicleType: string
    vehicleDocuments: { name: string; file: File }[]
  }
  updateFormData: (
    data: Partial<{
      vehicleNumber: string
      vehicleType: string
      vehicleDocuments: { name: string; file: File }[]
    }>,
  ) => void
  onSubmit: () => void
  onBack: () => void
}

// Mock data
const vehicleTypes = ["Bicycle", "Motorcycle", "Scooter", "Car", "Van", "Truck"]

export function DriverForm({ formData, updateFormData, onSubmit, onBack }: DriverFormProps) {
  const [isVehicleTypeOpen, setIsVehicleTypeOpen] = useState(false)
  const [documentName, setDocumentName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  const handleSelectVehicleType = (type: string) => {
    updateFormData({ vehicleType: type })
    setIsVehicleTypeOpen(false)
  }

  const handleAddDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && documentName) {
      const newDoc = {
        name: documentName,
        file: e.target.files[0],
      }
      updateFormData({
        vehicleDocuments: [...formData.vehicleDocuments, newDoc],
      })
      setDocumentName("")
    }
  }

  const handleRemoveDocument = (index: number) => {
    const updatedDocs = [...formData.vehicleDocuments]
    updatedDocs.splice(index, 1)
    updateFormData({ vehicleDocuments: updatedDocs })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center">
          <Button type="button" variant="ghost" size="sm" onClick={onBack} className="mr-2 h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicle Details</h1>
        </div>
        <p className="text-sm text-muted-foreground">Please provide information about your vehicle</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleNumber">Vehicle Number</Label>
          <Input
            id="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={(e) => updateFormData({ vehicleNumber: e.target.value })}
            required
          />
        </div>

        {/* Vehicle Type Selection */}
        <div className="space-y-2">
          <Label>Vehicle Type</Label>
          <Dialog open={isVehicleTypeOpen} onOpenChange={setIsVehicleTypeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full justify-between" type="button">
                {formData.vehicleType || "Select Vehicle Type"}
                <ChevronLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Vehicle Type</DialogTitle>
              </DialogHeader>
              <div className="grid gap-2 py-4">
                {vehicleTypes.map((type) => (
                  <Button
                    key={type}
                    variant={formData.vehicleType === type ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => handleSelectVehicleType(type)}
                    type="button"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <Label>Vehicle Documents</Label>
          <div className="space-y-2">
            <div className="flex space-x-2">
              <Input
                placeholder="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                className="flex-1"
              />
              <div className="relative">
                <Input
                  type="file"
                  id="document-upload"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAddDocument}
                />
                <Button type="button" variant="outline" disabled={!documentName}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>

            {formData.vehicleDocuments.length > 0 && (
              <div className="space-y-2 mt-2">
                {formData.vehicleDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-sm truncate flex-1">{doc.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!formData.vehicleNumber || !formData.vehicleType || formData.vehicleDocuments.length === 0}
        >
          Complete Registration
        </Button>
      </div>
    </form>
  )
}
