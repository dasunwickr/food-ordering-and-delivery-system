"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface VerificationStepProps {
  email: string
  verificationCode: string
  updateVerificationCode: (code: string) => void
  error?: string
  onVerifyCode: (email: string, code: string) => Promise<boolean>
  onResendCode: () => Promise<boolean>
}

export function VerificationStep({
  email,
  verificationCode,
  updateVerificationCode,
  error,
  onVerifyCode,
  onResendCode,
}: VerificationStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [individualDigits, setIndividualDigits] = useState<string[]>(Array(6).fill(""))

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Update verification code when digits change
  useEffect(() => {
    const joined = individualDigits.join("")
    if (joined !== verificationCode) {
      updateVerificationCode(joined)
    }
  }, [individualDigits, updateVerificationCode, verificationCode])

  // Initialize digits if verificationCode changes
  useEffect(() => {
    const joinedDigits = individualDigits.join("")
    if (verificationCode && joinedDigits !== verificationCode) {
      const digits = verificationCode.split("").concat(Array(6 - verificationCode.length).fill("")).slice(0, 6)
      setIndividualDigits(digits)
    }
  }, [verificationCode])

  const handleDigitChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return

    const newDigits = [...individualDigits]

    // Handle paste
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6)
      const newArray = Array(6).fill("")
      digits.forEach((digit, i) => {
        if (i < 6) newArray[i] = digit
      })
      setIndividualDigits(newArray)
      const nextIndex = Math.min(index + digits.length, 5)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    newDigits[index] = value
    setIndividualDigits(newDigits)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !individualDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleResendCode = async () => {
    setIsResending(true)
    try {
      await onResendCode()
      setCountdown(60)
    } catch (error) {
      console.error("Error resending code:", error)
    } finally {
      setIsResending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (individualDigits.join("").length !== 6) return

    setIsVerifying(true)
    try {
      await onVerifyCode(email, individualDigits.join(""))
    } catch (error) {
      console.error("Error verifying code:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-medium">Verification Code</h2>
        <p className="text-xs text-muted-foreground mt-1">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between gap-2 mt-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={individualDigits[index]}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={(e) => {
                e.preventDefault()
                const pasteData = e.clipboardData.getData("text")
                handleDigitChange(index, pasteData)
              }}
              className={`h-10 w-10 text-center text-lg p-0 ${error ? "border-destructive" : ""}`}
            />
          ))}
        </div>
        {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Button size="sm" onClick={handleVerifyCode} disabled={isVerifying || individualDigits.join("").length !== 6}>
          {isVerifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Verify Code
        </Button>

        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">Didn't receive the code?</p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={handleResendCode}
            disabled={isResending || countdown > 0}
          >
            {countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
          </Button>
        </div>
      </div>
    </div>
  )
}
