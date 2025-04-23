"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Mail, Lock, User, Phone, Upload, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomerSignUp } from "@/components/auth/customer-signup"
import { DriverSignUp } from "@/components/auth/driver-signup"
import { RestaurantSignUp } from "@/components/auth/restaurant-signup"
import { UserTypeSelector } from "@/components/auth/user-type-selector"

type UserType = "customer" | "driver" | "restaurant" | null

export default function SignUp() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [userType, setUserType] = useState<UserType>(null)
  const [showUserTypeModal, setShowUserTypeModal] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) {
      setStep(2)
    }
  }

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep2()) {
      setShowUserTypeModal(true)
    }
  }

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type)
    setShowUserTypeModal(false)
    setStep(3)
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

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center mb-8">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                i === step
                  ? "bg-primary text-white"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-gray-200 text-gray-400"
              }`}
              whileHover={{ scale: 1.05 }}
            >
              {i < step ? <Check className="h-4 w-4" /> : i}
            </motion.div>
            {i < 3 && <div className={`w-10 h-1 ${i < step ? "bg-primary/60" : "bg-gray-200"}`} />}
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <motion.div
        className="flex items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
        ) : (
          <Link
            href="/sign-in"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        )}
      </motion.div>

      <motion.div
        className="space-y-2 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold">Create an Account</h1>
        <p className="text-muted-foreground">
          {step === 1 && "Set up your account credentials"}
          {step === 2 && "Tell us about yourself"}
          {step === 3 && `Complete your ${userType} profile`}
        </p>
      </motion.div>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            onSubmit={handleStep1Submit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {errors.password && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              {errors.confirmPassword && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.confirmPassword}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div className="relative my-6" variants={itemVariants}>
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-muted-foreground">Or continue with</span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button type="button" variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
                Sign up with Google
              </Button>
            </motion.div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            onSubmit={handleStep2Submit}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="grid grid-cols-2 gap-4" variants={itemVariants}>
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="John"
                    className={`pl-10 ${errors.firstName ? "border-red-500" : ""}`}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                {errors.firstName && (
                  <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {errors.firstName}
                  </motion.p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    className={`pl-10 ${errors.lastName ? "border-red-500" : ""}`}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                {errors.lastName && (
                  <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {errors.lastName}
                  </motion.p>
                )}
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
                  type="tel"
                  placeholder="(123) 456-7890"
                  className={`pl-10 ${errors.phone ? "border-red-500" : ""}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {errors.phone && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.phone}
                </motion.p>
              )}
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
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {userType === "customer" && (
              <CustomerSignUp
                userData={{
                  email,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                }}
              />
            )}

            {userType === "driver" && (
              <DriverSignUp
                userData={{
                  email,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                }}
              />
            )}

            {userType === "restaurant" && (
              <RestaurantSignUp
                userData={{
                  email,
                  firstName,
                  lastName,
                  phone,
                  profileImage: profileImageUrl,
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <UserTypeSelector
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        onSelect={handleUserTypeSelect}
      />
    </div>
  )
}
