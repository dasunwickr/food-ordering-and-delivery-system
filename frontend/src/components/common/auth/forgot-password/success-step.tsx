"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessStepProps {
  email: string
}

export function SuccessStep({ email }: SuccessStepProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium">Password Reset Successful</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Your password for <span className="font-medium">{email}</span> has been reset successfully
        </p>
      </div>

      <div className="pt-2">
        <Link href="/login">
          <Button className="w-full" size="sm">
            Back to Login
          </Button>
        </Link>
      </div>
    </div>
  )
}
