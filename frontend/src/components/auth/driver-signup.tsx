"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Car, Upload, FileText, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "./modal"

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
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false)
  const [documents, setDocuments] = useState<{ name: string; file: File | null }[]>([
    { name: "Driver's License", file: null },
    { name: "Vehicle Registration", file: null },
  ])
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errors, setErrors] = useState<{
    vehicleNumber?: string
    vehicleType?: string
    documents?: string
  }>({})

  const validateForm = () => {
    const newErrors: {
      vehicleNumber?: string
      vehicleType?: string
      documents?: string
    } = {}

    if (!vehicleNumber) {
      newErrors.vehicleNumber = "Vehicle number is required"
    }

    if (!vehicleType) {
      newErrors.vehicleType = "Vehicle type is required"
    }

    const missingDocuments = documents.some((doc) => !doc.file)
    if (missingDocuments) {
      newErrors.documents = "All documents are required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      // Handle sign up logic
      console.log("Driver sign up with:", {
        ...userData,
        vehicleNumber,
        vehicleType,
        documents,
      })
      setShowSuccessModal(true)
    }
  }

  const handleVehicleTypeSelect = (type: string) => {
    setVehicleType(type)
    setShowVehicleTypeModal(false)
  }

  const handleDocumentChange = (index: number, file: File | null) => {
    const updatedDocuments = [...documents]
    updatedDocuments[index].file = file
    setDocuments(updatedDocuments)
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
    { id: "bike", name: "Bike" },
    { id: "car", name: "Car" },
    { id: "van", name: "Van" },
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
        <motion.div className="space-y-2" variants={itemVariants}>
          <Label htmlFor="vehicleNumber" className="text-sm font-medium">
            Vehicle Number
          </Label>
          <div className="relative">
            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="vehicleNumber"
              placeholder="e.g., ABC123"
              className={`pl-10 ${errors.vehicleNumber ? "border-red-500" : ""}`}
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
            />
          </div>
          {errors.vehicleNumber && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.vehicleNumber}
            </motion.p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <Label className="text-sm font-medium">Vehicle Type</Label>
          <Button
            type="button"
            variant="outline"
            className={`w-full justify-between ${errors.vehicleType ? "border-red-500" : ""}`}
            onClick={() => setShowVehicleTypeModal(true)}
          >
            {vehicleType ? vehicleType : "Select Vehicle Type"}
            <Car className="h-4 w-4 ml-2" />
          </Button>
          {errors.vehicleType && (
            <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {errors.vehicleType}
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
              <div
                key={index}
                className={`p-4 border rounded-lg ${doc.file ? "border-green-500 bg-green-50" : "border-gray-200"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className={`h-5 w-5 mr-2 ${doc.file ? "text-green-500" : "text-gray-400"}`} />
                    <span>{doc.name}</span>
                  </div>
                  <div>
                    <Label
                      htmlFor={`document-${index}`}
                      className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                    >
                      {doc.file ? "Change" : "Upload"}
                    </Label>
                    <Input
                      id={`document-${index}`}
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        handleDocumentChange(index, file)
                      }}
                    />
                  </div>
                </div>
                {doc.file && (
                  <div className="mt-2 text-xs text-green-600 flex items-center">
                    <Check className="h-3 w-3 mr-1" />
                    {doc.file.name}
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setDocuments([...documents, { name: "", file: null }])
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Add Another Document
            </Button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button type="submit" className="w-full">
            Complete Sign Up
          </Button>
        </motion.div>
      </motion.form>

      <Modal isOpen={showVehicleTypeModal} onClose={() => setShowVehicleTypeModal(false)} title="Select Vehicle Type">
        <div className="space-y-3">
          {vehicleTypes.map((type, index) => (
            <motion.button
              key={type.id}
              className="w-full p-3 border rounded-lg flex items-center hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => handleVehicleTypeSelect(type.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Car className="h-5 w-5 mr-3 text-primary" />
              <span>{type.name}</span>
            </motion.button>
          ))}
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
            Your driver account has been created successfully! We will review your documents and get back to you soon.
          </p>
          <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </>
  )
}
