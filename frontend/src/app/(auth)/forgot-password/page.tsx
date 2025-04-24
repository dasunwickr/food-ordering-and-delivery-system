"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Check, AlertCircle } from "lucide-react"


import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/auth/back-button"
import { AuthHeader } from "@/components/auth/auth-header"
import { StepIndicator } from "@/components/auth/step-indicator"
import { OtpStep } from "@/components/auth/forgot-password/otp-step"
import { ResetPasswordStep } from "@/components/auth/forgot-password/reset-password"
import { Modal } from "@/components/auth/modal"
import { EmailStep } from "@/components/auth/forgot-password/email-step"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalContent, setModalContent] = useState({ title: "", message: "", isError: false })

  const handleEmailSubmit = (email: string) => {
    setEmail(email)
    setStep(2)
  }

  const handleOtpSubmit = (otp: string) => {
    setOtp(otp)
    setStep(3)
  }

  const handleResendOtp = () => {
    // Resend OTP logic would go here
    console.log("Resending OTP to", email)
  }

  const handleResetPassword = (password: string, confirmPassword: string) => {
    // Reset password logic would go here
    console.log("Resetting password for", email)
    setModalContent({
      title: "Success!",
      message: "Your password has been reset successfully.",
      isError: false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    if (!modalContent.isError) {
      // Redirect to sign in page
      window.location.href = "/sign-in"
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Enter your email to receive a verification code"
      case 2:
        return "Enter the 6-digit code sent to your email"
      case 3:
        return "Create a new password for your account"
      default:
        return ""
    }
  }

  return (
    <>
      <BackButton href="/sign-in" label="Back to Sign In" />

      <AuthHeader title="Reset Your Password" subtitle={getStepTitle()} />

      <StepIndicator steps={3} currentStep={step} onStepClick={setStep} />

      <AnimatePresence mode="wait">
        {step === 1 && <EmailStep onSubmit={handleEmailSubmit} />}
        {step === 2 && <OtpStep onSubmit={handleOtpSubmit} onResendOtp={handleResendOtp} />}
        {step === 3 && <ResetPasswordStep onSubmit={handleResetPassword} />}
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
    </>
  )
}
