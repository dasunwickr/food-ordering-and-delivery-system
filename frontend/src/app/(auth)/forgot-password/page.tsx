"use client"

import { useState } from "react"
import { EmailForm } from "@/components/auth/forgot-password/email-form"
import { OtpForm } from "@/components/auth/forgot-password/otp-form"
import { ResetPasswordForm } from "@/components/auth/forgot-password/reset-password"

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  })

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => setStep((prev) => prev + 1)

  return (
    <div className="space-y-6 w-full">
      {step === 1 && (
        <EmailForm email={formData.email} updateEmail={(email) => updateFormData({ email })} onSubmit={nextStep} />
      )}

      {step === 2 && (
        <OtpForm
          email={formData.email}
          otp={formData.otp}
          updateOtp={(otp) => updateFormData({ otp })}
          onSubmit={nextStep}
        />
      )}

      {step === 3 && (
        <ResetPasswordForm
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          updatePassword={(password) => updateFormData({ password })}
          updateConfirmPassword={(confirmPassword) => updateFormData({ confirmPassword })}
          onSubmit={() => console.log("Password reset", formData)}
        />
      )}
    </div>
  )
}
