"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, User, Phone, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormInput } from "../form-input"

interface PersonalDetailsStepProps {
  onSubmit: (firstName: string, lastName: string, phone: string, profileImage: File | null) => void
}

export function PersonalDetailsStep({ onSubmit }: PersonalDetailsStepProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; phone?: string }>({})

  const validateForm = () => {
    const newErrors: { firstName?: string; lastName?: string; phone?: string } = {}

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

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setProfileImageUrl(URL.createObjectURL(file))
    }
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
      key="step2"
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
        <div className="space-y-2">
          <FormInput
            id="firstName"
            label="First Name"
            placeholder="John"
            value={firstName}
            onChange={setFirstName}
            error={errors.firstName}
            icon={<User className="h-4 w-4" />}
          />
        </div>
        <div className="space-y-2">
          <FormInput
            id="lastName"
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={setLastName}
            error={errors.lastName}
            icon={<User className="h-4 w-4" />}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <FormInput
          id="phone"
          label="Phone Number"
          placeholder="(123) 456-7890"
          value={phone}
          onChange={setPhone}
          error={errors.phone}
          icon={<Phone className="h-4 w-4" />}
        />
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="profileImage" className="text-sm font-medium">
          Profile Image (Optional)
        </Label>
        <div className="flex items-center space-x-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
            {profileImageUrl ? (
              <img
                src={profileImageUrl || "/placeholder.svg"}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <Label
              htmlFor="profileImage"
              className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </Label>
            <Input
              id="profileImage"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleProfileImageChange}
            />
            <p className="mt-1 text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full">
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.form>
  )
}
