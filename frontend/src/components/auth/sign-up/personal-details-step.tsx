"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Phone, InfoIcon } from "lucide-react"
import { ProfileImageUploader } from "@/components/user-service/profile/profile-image-uploader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PersonalDetailsStepProps {
  onSubmit: (firstName: string, lastName: string, phone: string, profileImage: string | null) => void
  initialData?: {
    firstName?: string
    lastName?: string
    phone?: string
    profilePictureUrl?: string | null
  }
  isGoogleAuth?: boolean
}

export function PersonalDetailsStep({ 
  onSubmit, 
  initialData = {}, 
  isGoogleAuth = false 
}: PersonalDetailsStepProps) {
  const [firstName, setFirstName] = useState(initialData.firstName || "")
  const [lastName, setLastName] = useState(initialData.lastName || "")
  const [phone, setPhone] = useState(initialData.phone || "")
  const [profileImage, setProfileImage] = useState<string | null>(initialData.profilePictureUrl || null)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Update state if initialData changes (e.g., when pre-filled with Google data)
  useEffect(() => {
    if (initialData.firstName) setFirstName(initialData.firstName)
    if (initialData.lastName) setLastName(initialData.lastName)
    if (initialData.phone) setPhone(initialData.phone)
    if (initialData.profilePictureUrl) setProfileImage(initialData.profilePictureUrl)
  }, [initialData])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!firstName) {
      newErrors.firstName = "First name is required"
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required"
    }

    if (!phone) {
      newErrors.phone = "Phone number is required"
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(firstName, lastName, phone, profileImage)
    }
  }

  const handleProfileImageUpdate = (imageUrl: string) => {
    setProfileImage(imageUrl)
  }

  const containerVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.2,
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
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {isGoogleAuth && (
        <motion.div variants={itemVariants}>
          <Alert className="bg-blue-50 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-sm">
              <span className="font-medium">Google account connected!</span> We've pre-filled your information.
              Please verify and continue.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <motion.div className="flex flex-col items-center space-y-4" variants={itemVariants}>
        <Label className="text-sm font-medium">Profile Picture</Label>
        <ProfileImageUploader 
          currentImage={profileImage || "/placeholder.svg"} 
          onImageUpdate={handleProfileImageUpdate} 
          disabled={isGoogleAuth && !!profileImage}
        />
        <p className="text-xs text-muted-foreground">
          {isGoogleAuth && profileImage 
            ? "Profile picture imported from Google" 
            : "Upload a profile picture (optional)"}
        </p>
      </motion.div>

      <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="firstName"
              placeholder="e.g., John"
              className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="lastName"
              placeholder="e.g., Doe"
              className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
        </div>
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="phone" className="text-sm font-medium">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="e.g., 123-456-7890"
            className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </motion.div>
    </motion.form>
  )
}
