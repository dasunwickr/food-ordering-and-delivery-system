"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { OtpInput } from "./otp-input"

interface OtpStepProps {
  onSubmit: (otp: string) => void
  onResendOtp: () => void
}

export function OtpStep({ onSubmit, onResendOtp }: OtpStepProps) {
  const [otp, setOtp] = useState("")
  const [errors, setErrors] = useState<{ otp?: string }>({})

  const validateOtp = () => {
    const newErrors = { ...errors }
    delete newErrors.otp

    if (!otp || otp.length !== 6) {
      newErrors.otp = "Please enter a valid 6-digit code"
    }

    setErrors(newErrors)
    return !newErrors.otp
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateOtp()) {
      onSubmit(otp)
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
        <button type="button" className="text-primary font-medium hover:underline" onClick={onResendOtp}>
          Resend
        </button>
      </motion.div>
    </motion.form>
  )
}
