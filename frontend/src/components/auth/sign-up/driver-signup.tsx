"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { FileText, Car, MapPin, Check, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Modal } from "@/components/auth/modal"
import { MapSelector } from "@/components/ui/map-selector"
import { DocumentUploader } from "@/components/shared/document-uploader"

interface DriverSignUpProps {
  userData: {
    email: string
    firstName: string
    lastName: string
    phone: string
    profileImage: string | null
  }
}

export function DriverSignUp({ userData }: DriverSignUpProps) {
  // Vehicle info state
  const [vehicleType, setVehicleType] = useState("")
  const [licensePlate, setLicensePlate] = useState("")
  
  // Default required documents
  const defaultDocuments = [
    { name: "Driver's License", url: "" },
    { name: "Vehicle Registration", url: "" },
    { name: "Vehicle Insurance", url: "" }
  ]
  
  // Documents state
  const [documents, setDocuments] = useState<{ name: string; url: string }[]>(defaultDocuments)
  
  // Location state
  const [location, setLocation] = useState("")
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  
  // UI state
  const [showMap, setShowMap] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Handle sign up logic
      console.log("Driver sign up with:", {
        ...userData,
        vehicleType,
        licensePlate,
        documents,
        location,
      })
      setShowSuccessModal(true)
    }
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    let isValid = true
    
    if (!vehicleType) {
      newErrors.vehicleType = "Vehicle type is required"
      isValid = false
    }
    
    if (!licensePlate) {
      newErrors.licensePlate = "License plate is required"
      isValid = false
    }
    
    const missingDocuments = documents.some((doc) => !doc.url || doc.url.trim() === "")
    if (missingDocuments) {
      newErrors.documents = "All documents are required"
      isValid = false
    }
    
    if (!location) {
      newErrors.location = "Location is required"
      isValid = false
    }
    
    if (!locationConfirmed) {
      newErrors.locationConfirmed = "Please confirm your location on the map"
      isValid = false
    }
    
    setErrors(newErrors)
    return isValid
  }

  const updateDocument = (index: number, documentInfo: { name: string; url: string }) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index] = documentInfo;
    setDocuments(updatedDocuments);
  }

  const addDocument = () => {
    setDocuments([...documents, { name: "Additional Document", url: "" }])
  }

  const confirmLocationSelection = () => {
    setLocationConfirmed(true)
    setShowMap(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  }

  const vehicleTypes = [
    "Motorcycle", 
    "Compact Car", 
    "Sedan", 
    "SUV", 
    "Van", 
    "Pickup Truck",
    "Bicycle",
    "Electric Scooter",
  ]

  return (
    <>
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="space-y-4" variants={itemVariants}>
          <Label htmlFor="vehicleType" className="text-sm font-medium">
            Vehicle Type
          </Label>
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger
              id="vehicleType"
              className={errors.vehicleType ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select your vehicle type" />
            </SelectTrigger>
            <SelectContent>
              {vehicleTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vehicleType && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.vehicleType}
            </motion.p>
          )}
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <Label htmlFor="licensePlate" className="text-sm font-medium">
            License Plate Number
          </Label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="licensePlate"
              placeholder="e.g., ABC 1234"
              className={`pl-10 ${errors.licensePlate ? "border-red-500" : ""}`}
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          </div>
          {errors.licensePlate && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.licensePlate}
            </motion.p>
          )}
        </motion.div>

        <motion.div className="space-y-4" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Upload Documents</Label>
            {errors.documents && (
              <motion.span className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {errors.documents}
              </motion.span>
            )}
          </div>

          <div className="space-y-3">
            {documents.map((doc, index) => (
              <DocumentUploader
                key={index}
                documentName={doc.name}
                currentDocument={doc}
                onDocumentUpdate={(documentInfo) => updateDocument(index, documentInfo)}
                folder="food-ordering-system/driver-documents"
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={addDocument}
            >
              <Upload className="mr-2 h-4 w-4" />
              Add Another Document
            </Button>
          </div>
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="location" className="text-sm font-medium">
            Your Home Base Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Select your primary location"
              className={`pl-10 ${errors.location ? "border-red-500" : ""} ${
                locationConfirmed ? "pr-10 border-green-500" : ""
              }`}
              value={location}
              readOnly
            />
            {locationConfirmed && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {errors.location && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.location}
            </motion.p>
          )}
          {errors.locationConfirmed && !errors.location && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.locationConfirmed}
            </motion.p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center mt-2"
            onClick={() => setShowMap(true)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {locationConfirmed ? "Change Location" : "Select on Map"}
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button type="submit" className="w-full">
            Complete Sign Up
          </Button>
        </motion.div>
      </motion.form>

      <Modal 
        isOpen={showMap} 
        onClose={() => setShowMap(false)} 
        title="Select Home Base Location"
      >
        <div className="space-y-4">
          <MapSelector 
            height="350px" 
            onConfirmLocation={(selectedLocation) => {
              const formattedLocation = `Lat: ${selectedLocation.lat}, Lng: ${selectedLocation.lng}`;
              setLocation(formattedLocation);
              confirmLocationSelection();
            }} 
          />
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Account Created!"
        icon={Check}
        iconClassName="text-green-500"
      >
        <div className="text-center">
          <p className="mb-4">
            Your driver account has been created successfully! We will review your documents and get back to you
            soon.
          </p>
          <Button onClick={() => (window.location.href = "/driver")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </>
  )
}
