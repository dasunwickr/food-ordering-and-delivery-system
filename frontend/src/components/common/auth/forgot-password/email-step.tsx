"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Mail, ArrowRight, Loader2 } from "lucide-react"

interface EmailStepProps {
  email: string
  updateEmail: (email: string) => void
  error?: string
  onRequestCode: (email: string) => Promise<boolean>
  onNext: () => void
}

export function EmailStep({ email, updateEmail, error, onRequestCode, onNext }: EmailStepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return

    setIsLoading(true)
    try {
      const success = await onRequestCode(email)
      if (success) {
        onNext()
      }
    } catch (error) {
      console.error("Error requesting code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-medium">Forgot Password</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Enter your email address and we'll send you a verification code
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="email" className="text-xs font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            placeholder="your.email@example.com"
            className={`pl-8 h-9 text-sm ${error ? "border-destructive" : ""}`}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>

      <Button className="w-full" size="sm" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending Code
          </>
        ) : (
          <>
            Continue <ArrowRight className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>
    </div>
  )
}
