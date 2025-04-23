"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OtpFormProps {
  email: string
  otp: string
  updateOtp: (otp: string) => void
  onSubmit: () => void
}

export function OtpForm({ email, otp, updateOtp, onSubmit }: OtpFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Enter Verification Code</h1>
        <p className="text-sm text-muted-foreground">
          We've sent a verification code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            placeholder="Enter 6-digit code"
            value={otp}
            onChange={(e) => updateOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Verify Code
        </Button>

        <div className="text-center text-sm">
          Didn't receive a code?{" "}
          <Button variant="link" className="p-0 h-auto">
            Resend
          </Button>
        </div>
      </div>
    </form>
  )
}
