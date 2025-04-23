"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Search, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "./modal"

interface CustomerSignUpProps {
  userData: {
    email: string
    firstName: string
    lastName: string
    phone: string
    profileImage: string | null
  }
}

export function CustomerSignUp({ userData }: CustomerSignUpProps) {
  const [location, setLocation] = useState("")
  const [showMap, setShowMap] = useState(false)
  const [locationConfirmed, setLocationConfirmed] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errors, setErrors] = useState<{ location?: string }>({})

  const validateLocation = () => {
    const newErrors: { location?: string } = {}

    if (!location) {
      newErrors.location = "Location is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateLocation() && locationConfirmed) {
      // Handle sign up logic
      console.log("Customer sign up with:", {
        ...userData,
        location,
      })
      setShowSuccessModal(true)
    } else if (!locationConfirmed) {
      setShowMap(true)
    }
  }

  const handleConfirmLocation = () => {
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
          <Label htmlFor="location" className="text-sm font-medium">
            Your Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              placeholder="Enter your address"
              className={`pl-10 ${errors.location ? "border-red-500" : ""} ${locationConfirmed ? "pr-10 border-green-500" : ""}`}
              value={location}
              onChange={(e) => {
                setLocation(e.target.value)
                setLocationConfirmed(false)
              }}
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
          <p className="text-xs text-muted-foreground">We need your location to show you restaurants nearby</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center"
            onClick={() => setShowMap(true)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            Select on Map
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button type="submit" className="w-full">
            Complete Sign Up
          </Button>
        </motion.div>
      </motion.form>

      <Modal isOpen={showMap} onClose={() => setShowMap(false)} title="Select Your Location">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for your address"
              className="pl-10"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center p-4">
              <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Map would be displayed here</p>
            </div>
          </div>

          <Button onClick={handleConfirmLocation} className="w-full" disabled={!location}>
            Confirm Location
          </Button>
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
          <p className="mb-4">Your customer account has been created successfully!</p>
          <Button onClick={() => (window.location.href = "/dashboard")} className="w-full">
            Go to Dashboard
          </Button>
        </div>
      </Modal>
    </>
  )
}
