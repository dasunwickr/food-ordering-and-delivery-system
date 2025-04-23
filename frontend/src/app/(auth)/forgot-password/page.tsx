"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Mail, Lock, Check, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OtpInput } from "@/components/auth/otp-input"
import { Modal } from "@/components/auth/modal"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", message: "", isError: false })

  const validateEmail = () => {
    const newErrors = { ...errors }
    delete newErrors.email

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    setErrors(newErrors)
    return !newErrors.email
  }

  const validateOtp = () => {
    const newErrors = { ...errors }
    delete newErrors.otp

    if (!otp || otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit code"
    }

    setErrors(newErrors)
    return !newErrors.otp
  }

  const validatePassword = () => {
    const newErrors = { ...errors }
    delete newErrors.password
    delete newErrors.confirmPassword

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return !newErrors.password && !newErrors.confirmPassword
  }

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateEmail()) {
      // Send OTP logic would go here
      setStep(2)
    }
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateOtp()) {
      // Verify OTP logic would go here
      setStep(3)
    }
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (validatePassword()) {
      // Reset password logic would go here
      setModalContent({
        title: "Success!",
        message: "Your password has been reset successfully.",
        isError: false,
      })
      setShowModal(true)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    if (!modalContent.isError) {
      // Redirect to sign in page
      window.location.href = "/sign-in"
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
        <Link
          href="/sign-in"
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Link>
      </motion.div>

      <motion.div
        className="space-y-2 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-2xl font-bold">Reset Your Password</h1>
        <p className="text-muted-foreground">
          {step === 1 && "Enter your email to receive a verification code"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Create a new password for your account"}
        </p>
      </motion.div>

      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.form
            key="step1"
            onSubmit={handleSendOtp}
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

            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full">
                Send Verification Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            onSubmit={handleVerifyOtp}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="space-y-4" variants={itemVariants}>
              <Label htmlFor="otp" className="text-sm font-medium">
                Verification Code
              </Label>
              <OtpInput value={otp} onChange={setOtp} numInputs={6} hasError={!!errors.otp} />
              {errors.otp && (
                <motion.p className="text-sm text-red-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {errors.otp}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full">
                Verify Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>

            <motion.div className="text-center text-sm" variants={itemVariants}>
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                className="text-primary font-medium hover:underline"
                onClick={() => {
                  // Resend OTP logic would go here
                }}
              >
                Resend
              </button>
            </motion.div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            onSubmit={handleResetPassword}
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div className="space-y-2" variants={itemVariants}>
              <Label htmlFor="password" className="text-sm font-medium">
                New Password
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
                Confirm New Password
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
                Reset Password
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={modalContent.title}
        icon={modalContent.isError ? AlertCircle : Check}
        iconClassName={modalContent.isError ? "text-red-500" : "text-green-500"}
      >
        <p className="text-center">{modalContent.message}</p>
        <Button onClick={closeModal} className="mt-4 w-full">
          {modalContent.isError ? "Try Again" : "Go to Sign In"}
        </Button>
      </Modal>
    </div>
  )
}
